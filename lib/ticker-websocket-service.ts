// WebSocket service for Kraken ticker data
import { useEffect, useState } from 'react';
import { TickerData } from '@/types/orderbook';

export interface TickerMessage {
  channel: string;
  type: 'snapshot' | 'update';
  data: TickerData[];
}

const krakenWebSocketUrl = process.env.NEXT_PUBLIC_KRAKEN_WS_URL || 'wss://ws.kraken.com/v2';

export const useTickerWebSocket = (pair: string) => {
  const [tickerData, setTickerData] = useState<TickerData | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'connecting' | 'connected' | 'disconnected'>('connecting');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimeout: NodeJS.Timeout;
    let shouldReconnect = true; // Flag to control reconnection

    const connect = () => {
      try {
        if (!shouldReconnect) return; // Don't connect if not supposed to reconnect

        // Using Kraken's WebSocket API for ticker data
        ws = new WebSocket(krakenWebSocketUrl);

        ws.onopen = () => {
          setConnectionStatus('connected');
          setError(null);

          // Subscribe to the ticker channel for the specific pair
          const subscribeMessage = {
            method: "subscribe",
            params: {
              channel: "ticker",
              symbol: [pair]
            }
          };
          ws?.send(JSON.stringify(subscribeMessage));
        };

        ws.onmessage = (event) => {
          try {
            const message: TickerMessage = JSON.parse(event.data as string);

            if (message.channel === 'ticker') {
              // Always take the first item in the data array since we're subscribing to one symbol
              const dataItem = message.data[0];

              if (dataItem) {
                setTickerData(prev => {
                  // Update the existing data or set initial data
                  if (!prev || message.type === 'snapshot') {
                    // For snapshot, replace all data
                    return dataItem;
                  } else {
                    // For update, merge with existing data
                    return {
                      ...prev,
                      ...dataItem
                    };
                  }
                });
              }
            }
          } catch (parseError) {
            console.error('Error parsing WebSocket message:', parseError);
            setError('Failed to parse incoming data');
          }
        };

        ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          setError('WebSocket connection error');
        };

        ws.onclose = (event) => {
          // Only attempt reconnection if the closure was not intentional (1000 code)
          if (event.code !== 1000 && shouldReconnect) {
            setConnectionStatus('disconnected');
            // Attempt to reconnect after 3 seconds
            reconnectTimeout = setTimeout(connect, 3000);
          } else {
            setConnectionStatus('disconnected');
          }
        };
      } catch (error) {
        console.error('Error establishing WebSocket connection:', error);
        setError('Failed to establish WebSocket connection');
        setConnectionStatus('disconnected');
        if (shouldReconnect) {
          // Attempt to reconnect after 3 seconds
          reconnectTimeout = setTimeout(connect, 3000);
        }
      }
    };

    connect();

    // Cleanup function
    return () => {
      shouldReconnect = false; // Set the flag to prevent reconnection

      if (ws) {
        ws.close(1000, "Component unmounting"); // Close with normal closure code
        ws = null; // Clear reference
      }
      if (reconnectTimeout) {
        clearTimeout(reconnectTimeout);
      }
    };
  }, [pair]);

  return {
    tickerData,
    connectionStatus,
    error
  };
};