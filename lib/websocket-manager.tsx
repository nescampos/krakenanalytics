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

interface WebSocketContextType {
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  error: string | null;
  tickerData: Record<string, TickerData>; // Store data for all pairs
}

const WebSocketContext = createContext<WebSocketContextType | undefined>(undefined);

interface WebSocketProviderProps {
  children: ReactNode;
}

let globalWebSocket: WebSocket | null = null;
let globalReconnectTimeout: NodeJS.Timeout | null = null;
let shouldReconnect = true;
const subscribedPairs = new Set<string>();
const listeners = new Set<(data: { symbol: string; data: TickerData }) => void>();

// Function to connect to WebSocket
const connectWebSocket = () => {
  if (globalWebSocket) return; // Already connected
  
  try {
    globalWebSocket = new WebSocket('wss://ws.kraken.com/v2');

    globalWebSocket.onopen = () => {
      // Resubscribe to all pairs when connection opens
      if (subscribedPairs.size > 0) {
        const subscribeMessage = {
          method: "subscribe",
          params: {
            channel: "ticker",
            symbol: Array.from(subscribedPairs)
          }
        };
        globalWebSocket.send(JSON.stringify(subscribeMessage));
      }
    };

    globalWebSocket.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data as string);
        
        if (message.channel === 'ticker' && Array.isArray(message.data)) {
          // Process each ticker data item
          message.data.forEach((dataItem: TickerData) => {
            // Notify all listeners about the update
            listeners.forEach(listener => {
              listener({ symbol: dataItem.symbol, data: dataItem });
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
  console.log("Closing WebSocket connection");
  
  if (globalWebSocket) {
    globalWebSocket.close(1000, "App closing");
    globalWebSocket = null;
  }
  
  if (globalReconnectTimeout) {
    clearTimeout(globalReconnectTimeout);
    globalReconnectTimeout = null;
  }
};

// Function to subscribe to a pair
export const subscribeToPair = (pair: string) => {
  subscribedPairs.add(pair);
  
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

// Function to unsubscribe from a pair
export const unsubscribeFromPair = (pair: string) => {
  subscribedPairs.delete(pair);
  
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

// Function to add listener for ticker data
export const addTickerListener = (callback: (data: { symbol: string; data: TickerData }) => void) => {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
};

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [error, setError] = useState<string | null>(null);
  const [tickerData, setTickerData] = useState<Record<string, TickerData>>({});

  useEffect(() => {
    // Initialize connection
    setConnectionStatus('connecting');
    connectWebSocket();

    // Set up listener for ticker data
    const unsubscribe = addTickerListener(({ symbol, data }) => {
      setTickerData(prev => ({
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
      unsubscribe();
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
    tickerData
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