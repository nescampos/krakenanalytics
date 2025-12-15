// Global WebSocket manager for the entire app lifecycle
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface TickerData {
  symbol: string;
  bid: number;
  bid_qty: number;
  ask: number;
  ask_qty: number;
  last: number;
  volume: number;
  vwap: number;
  low: number;
  high: number;
  change: number;
  change_pct: number;
}

interface OrderBookEntry {
  price: number;
  qty: number;
}

interface OrderBookData {
  symbol: string;
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  checksum: number;
}

// Define the internal format for maintaining book state
interface InternalOrderBookState {
  bids: Map<number, OrderBookEntry>;
  asks: Map<number, OrderBookEntry>;
  checksum: number;
}

// Initialize internal state map
const internalBookStates = new Map<string, InternalOrderBookState>();

interface WebSocketContextType {
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  error: string | null;
  tickerData: Record<string, TickerData>; // Store data for all pairs
  orderBookData: Record<string, OrderBookData>; // Store order book data for all pairs
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

let globalWebSocket: WebSocket | null = null;
let globalReconnectTimeout: NodeJS.Timeout | null = null;
let shouldReconnect = true;
const subscribedTickerPairs = new Set<string>();
const subscribedBookPairs = new Set<string>();
const tickerListeners = new Set<(data: { symbol: string; data: TickerData }) => void>();
const bookListeners = new Set<(data: { symbol: string; data: OrderBookData }) => void>();

// Function to connect to WebSocket
const connectWebSocket = () => {
  if (globalWebSocket) return; // Already connected

  try {
    globalWebSocket = new WebSocket('wss://ws.kraken.com/v2');

    globalWebSocket.onopen = () => {
      // Resubscribe to all pairs when connection opens
      const subscriptions = [];

      if (subscribedTickerPairs.size > 0) {
        subscriptions.push({
          method: "subscribe",
          params: {
            channel: "ticker",
            symbol: Array.from(subscribedTickerPairs)
          }
        });
      }

      if (subscribedBookPairs.size > 0) {
        subscriptions.push({
          method: "subscribe",
          params: {
            channel: "book",
            symbol: Array.from(subscribedBookPairs)
          }
        });
      }

      // Send all subscription requests
      subscriptions.forEach(sub => {
        globalWebSocket?.send(JSON.stringify(sub));
      });
    };

    globalWebSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string);

        if (message.channel === 'ticker' && Array.isArray(message.data)) {
          // Process each ticker data item
          message.data.forEach((dataItem: TickerData) => {
            // Notify all ticker listeners about the update
            tickerListeners.forEach(listener => {
              listener({ symbol: dataItem.symbol, data: dataItem });
            });
          });
        } else if (message.channel === 'book' && Array.isArray(message.data)) {
          // Process each book data item
          message.data.forEach((dataItem: any) => {
            const pair = dataItem.symbol;

            // Check if this is a snapshot (full book) or an update
            if (message.type === 'snapshot') {
              // For snapshot, initialize the internal state
              const bidsMap = new Map<number, OrderBookEntry>();
              const asksMap = new Map<number, OrderBookEntry>();

              if (dataItem.bids && Array.isArray(dataItem.bids)) {
                dataItem.bids.forEach((bid: any) => {
                  bidsMap.set(bid.price, { price: bid.price, qty: bid.qty });
                });
              }

              if (dataItem.asks && Array.isArray(dataItem.asks)) {
                dataItem.asks.forEach((ask: any) => {
                  asksMap.set(ask.price, { price: ask.price, qty: ask.qty });
                });
              }

              const newState: InternalOrderBookState = {
                bids: bidsMap,
                asks: asksMap,
                checksum: dataItem.checksum || 0
              };

              internalBookStates.set(pair, newState);
            } else if (message.type === 'update' && internalBookStates.has(pair)) {
              // For update, modify the existing state
              const existingState = internalBookStates.get(pair)!;

              // Update bids
              if (dataItem.bids && Array.isArray(dataItem.bids)) {
                dataItem.bids.forEach((bid: any) => {
                  if (bid.qty === 0) {
                    // Remove this price level if qty is 0
                    existingState.bids.delete(bid.price);
                  } else {
                    // Add or update this price level
                    existingState.bids.set(bid.price, { price: bid.price, qty: bid.qty });
                  }
                });
              }

              // Update asks
              if (dataItem.asks && Array.isArray(dataItem.asks)) {
                dataItem.asks.forEach((ask: any) => {
                  if (ask.qty === 0) {
                    // Remove this price level if qty is 0
                    existingState.asks.delete(ask.price);
                  } else {
                    // Add or update this price level
                    existingState.asks.set(ask.price, { price: ask.price, qty: ask.qty });
                  }
                });
              }

              // Update checksum if provided
              if (dataItem.checksum !== undefined) {
                existingState.checksum = dataItem.checksum;
              }
            }

            // Convert internal state back to the format for external consumption
            const currentBids = Array.from(internalBookStates.get(pair)?.bids?.values() || []);
            const currentAsks = Array.from(internalBookStates.get(pair)?.asks?.values() || []);

            const orderBookData: OrderBookData = {
              symbol: pair,
              bids: currentBids,
              asks: currentAsks,
              checksum: internalBookStates.get(pair)?.checksum || 0
            };

            // Notify all book listeners about the update
            bookListeners.forEach(listener => {
              listener({ symbol: pair, data: orderBookData });
            });
          });
        }
      } catch (parseError) {
        console.error('Error parsing WebSocket message:', parseError);
      }
    };

    globalWebSocket.onerror = (error) => {
      console.error('WebSocket error:', error);
    };

    globalWebSocket.onclose = (event) => {
      if (event.code !== 1000 && shouldReconnect) {
        // Attempt to reconnect after 3 seconds
        globalReconnectTimeout = setTimeout(() => {
          if (shouldReconnect) {
            connectWebSocket();
          }
        }, 3000);
      }
    };
  } catch (error) {
    console.error('Error establishing WebSocket connection:', error);
  }
};

// Function to close WebSocket connection
const closeWebSocket = () => {
  shouldReconnect = false;

  if (globalWebSocket) {
    globalWebSocket.close(1000, "App closing");
    globalWebSocket = null;
  }

  if (globalReconnectTimeout) {
    clearTimeout(globalReconnectTimeout);
    globalReconnectTimeout = null;
  }
};

// Function to subscribe to ticker data for a pair
export const subscribeToTicker = (pair: string) => {
  subscribedTickerPairs.add(pair);

  if (globalWebSocket?.readyState === WebSocket.OPEN) {
    const subscribeMessage = {
      method: "subscribe",
      params: {
        channel: "ticker",
        symbol: [pair]
      }
    };
    globalWebSocket.send(JSON.stringify(subscribeMessage));
  } else if (globalWebSocket?.readyState === WebSocket.CONNECTING) {
    // Will subscribe when connection opens
  } else {
    // Connect if not already connected
    connectWebSocket();
  }
};

// Function to unsubscribe from ticker data for a pair
export const unsubscribeFromTicker = (pair: string) => {
  subscribedTickerPairs.delete(pair);

  if (globalWebSocket?.readyState === WebSocket.OPEN) {
    const unsubscribeMessage = {
      method: "unsubscribe",
      params: {
        channel: "ticker",
        symbol: [pair]
      }
    };
    globalWebSocket.send(JSON.stringify(unsubscribeMessage));
  }
};

// Function to subscribe to order book data for a pair
export const subscribeToBook = (pair: string) => {
  subscribedBookPairs.add(pair);

  if (globalWebSocket?.readyState === WebSocket.OPEN) {
    const subscribeMessage = {
      method: "subscribe",
      params: {
        channel: "book",
        symbol: [pair]
      }
    };
    globalWebSocket.send(JSON.stringify(subscribeMessage));
  } else if (globalWebSocket?.readyState === WebSocket.CONNECTING) {
    // Will subscribe when connection opens
  } else {
    // Connect if not already connected
    connectWebSocket();
  }
};

// Function to unsubscribe from order book data for a pair
export const unsubscribeFromBook = (pair: string) => {
  subscribedBookPairs.delete(pair);

  if (globalWebSocket?.readyState === WebSocket.OPEN) {
    const unsubscribeMessage = {
      method: "unsubscribe",
      params: {
        channel: "book",
        symbol: [pair]
      }
    };
    globalWebSocket.send(JSON.stringify(unsubscribeMessage));
  }

  // Clean up internal state
  internalBookStates.delete(pair);
};

// Function to add listener for ticker data
export const addTickerListener = (callback: (data: { symbol: string; data: TickerData }) => void) => {
  tickerListeners.add(callback);
  return () => {
    tickerListeners.delete(callback);
  };
};

// Function to add listener for book data
export const addBookListener = (callback: (data: { symbol: string; data: OrderBookData }) => void) => {
  bookListeners.add(callback);
  return () => {
    bookListeners.delete(callback);
  };
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [tickerData, setTickerData] = useState<Record<string, TickerData>>({});
  const [orderBookData, setOrderBookData] = useState<Record<string, OrderBookData>>({});

  useEffect(() => {
    // Initialize connection
    setConnectionStatus('connecting');
    connectWebSocket();

    // Set up listener for ticker data
    const tickerUnsubscribe = addTickerListener(({ symbol, data }) => {
      setTickerData(prev => ({
        ...prev,
        [symbol]: data
      }));
    });

    // Set up listener for book data
    const bookUnsubscribe = addBookListener(({ symbol, data }) => {
      setOrderBookData(prev => ({
        ...prev,
        [symbol]: data
      }));
    });

    // Update connection status based on WebSocket state
    const connectionInterval = setInterval(() => {
      if (globalWebSocket) {
        if (globalWebSocket.readyState === WebSocket.OPEN) {
          setConnectionStatus('connected');
          setError(null);
        } else if (globalWebSocket.readyState === WebSocket.CONNECTING) {
          setConnectionStatus('connecting');
        } else {
          setConnectionStatus('disconnected');
        }
      }
    }, 1000); // Update every second

    // Cleanup on unmount
    return () => {
      tickerUnsubscribe();
      bookUnsubscribe();
      clearInterval(connectionInterval);
    };
  }, []);

  // Set up handlers for page visibility and beforeunload
  useEffect(() => {
    const handleBeforeUnload = () => {
      closeWebSocket();
    };

    const handlePageHide = () => {
      closeWebSocket();
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    window.addEventListener('pagehide', handlePageHide);

    // Also handle visibility change to detect when user leaves the tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        closeWebSocket();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('pagehide', handlePageHide);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const value = {
    connectionStatus,
    error,
    tickerData,
    orderBookData
  };

  return (
    <WebSocketContext.Provider value={value}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocket = () => {
  const context = useContext(WebSocketContext);
  if (context === undefined) {
    throw new Error('useWebSocket must be used within a WebSocketProvider');
  }
  return context;
};