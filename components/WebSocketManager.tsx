'use client';

import React, { useEffect, useRef, useState } from 'react';
import { krakenWebSocketUrl, SubscribeParams, createKrakenWebSocket } from '@/lib/kraken-api';

interface WebSocketManagerProps {
  pair: string;
  onConnectionChange: (connected: boolean) => void;
}

const WebSocketManager: React.FC<WebSocketManagerProps> = ({ pair, onConnectionChange }) => {
  const wsRef = useRef<WebSocket | null>(null);
  const [connectionStatus, setConnectionStatus] = useState<'disconnected' | 'connecting' | 'connected'>('disconnected');
  const [lastMessage, setLastMessage] = useState<string | null>(null);
  const [reconnectAttempts, setReconnectAttempts] = useState<number>(0);

  // Subscribe to order book for the selected trading pair
  const subscribeToOrderBook = () => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      const subscribeMsg: SubscribeParams = {
        event: 'subscribe',
        pair: [pair],
        subscription: {
          name: 'book',
          depth: 25 // Top 25 levels
        }
      };

      wsRef.current.send(JSON.stringify(subscribeMsg));
    }
  };

  // Establish WebSocket connection
  const connect = () => {
    setConnectionStatus('connecting');

    // Create actual WebSocket connection using the environment variable
    const ws = new WebSocket(krakenWebSocketUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      console.log('Connected to Kraken WebSocket');
      setConnectionStatus('connected');
      onConnectionChange(true);
      setReconnectAttempts(0);

      // Subscribe to order book after connection is established
      const subscribeMsg: SubscribeParams = {
        event: 'subscribe',
        pair: [pair],
        subscription: {
          name: 'book',
          depth: 25 // Top 25 levels
        }
      };

      ws.send(JSON.stringify(subscribeMsg));
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      setLastMessage(`Received: ${new Date().toLocaleTimeString()}`);

      // In a real implementation, process the order book data here
      if (data && Array.isArray(data) && data.length > 2) {
        // This is an order book update message
        console.log('Order book update:', data);
      } else if (data && data.event === 'subscriptionStatus') {
        console.log('Subscription status:', data);
      } else if (data && data.event === 'heartbeat') {
        // Ignore heartbeat messages
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setConnectionStatus('disconnected');
      onConnectionChange(false);
    };

    ws.onclose = () => {
      console.log('Disconnected from Kraken WebSocket');
      setConnectionStatus('disconnected');
      onConnectionChange(false);
    };
  };

  // Disconnect from WebSocket
  const disconnect = () => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setConnectionStatus('disconnected');
    onConnectionChange(false);
  };

  // Reconnect logic
  useEffect(() => {
    if (connectionStatus === 'disconnected' && reconnectAttempts < 5) {
      const timer = setTimeout(() => {
        console.log(`Attempting to reconnect (${reconnectAttempts + 1}/5)...`);
        connect();
        setReconnectAttempts(prev => prev + 1);
      }, 3000); // Reconnect after 3 seconds

      return () => clearTimeout(timer);
    } else if (reconnectAttempts >= 5) {
      console.error('Maximum reconnection attempts reached');
    }
  }, [connectionStatus, reconnectAttempts]);

  // Connect when component mounts and pair changes
  useEffect(() => {
    connect();

    // Clean up on unmount
    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [pair]);

  // Subscribe when connected
  useEffect(() => {
    if (connectionStatus === 'connected') {
      subscribeToOrderBook();
    }
  }, [connectionStatus, pair]);

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
      <div className="flex flex-wrap items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">Kraken Order Book Visualizer</h1>
        </div>

        <div className="flex items-center space-x-4 mt-2 sm:mt-0">
          <div className="flex items-center">
            <div className={`w-3 h-3 rounded-full mr-2 ${
              connectionStatus === 'connected'
                ? 'bg-green-400 animate-pulse'
                : connectionStatus === 'connecting'
                  ? 'bg-yellow-400'
                  : 'bg-red-400'
            }`}></div>
            <span className="text-sm capitalize">
              {connectionStatus} {connectionStatus !== 'disconnected' && `to ${pair}`}
            </span>
          </div>

          <button
            onClick={connectionStatus === 'connected' ? disconnect : connect}
            className={`px-4 py-1.5 rounded text-sm font-medium ${
              connectionStatus === 'connected'
                ? 'bg-red-500 hover:bg-red-600'
                : 'bg-green-500 hover:bg-green-600'
            }`}
          >
            {connectionStatus === 'connected' ? 'Disconnect' : 'Connect'}
          </button>
        </div>
      </div>

      {lastMessage && (
        <div className="mt-2 text-xs opacity-70">
          Last message: {lastMessage}
        </div>
      )}
    </div>
  );
};

export default WebSocketManager;