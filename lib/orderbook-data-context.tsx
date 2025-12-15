// Context for sharing order book data between components using the global WebSocket
'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useWebSocket, subscribeToBook, unsubscribeFromBook } from '@/lib/websocket-manager';
import { OrderBookData as OrderBookDataType } from '@/lib/websocket-manager';

interface OrderBookContextType {
  orderBookData: OrderBookDataType | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  error: string | null;
  selectedPair: string;
}

const OrderBookContext = createContext<OrderBookContextType | undefined>(undefined);

interface OrderBookProviderProps {
  children: ReactNode;
  pair: string;
}

export const OrderBookProvider: React.FC<OrderBookProviderProps> = ({ children, pair }) => {
  const { orderBookData: allOrderBookData, connectionStatus, error } = useWebSocket();
  const [pairOrderBookData, setPairOrderBookData] = useState<OrderBookDataType | null>(null);

  useEffect(() => {
    // Subscribe to the order book for the pair when component mounts
    subscribeToBook(pair);
    
    // Cleanup order book subscription when component unmounts
    return () => {
      unsubscribeFromBook(pair);
    };
  }, [pair]);

  useEffect(() => {
    if (allOrderBookData && allOrderBookData[pair]) {
      setPairOrderBookData(allOrderBookData[pair]);
    }
  }, [allOrderBookData, pair]);

  const value = {
    orderBookData: pairOrderBookData,
    connectionStatus,
    error,
    selectedPair: pair
  };

  return (
    <OrderBookContext.Provider value={value}>
      {children}
    </OrderBookContext.Provider>
  );
};

export const useOrderBook = () => {
  const context = useContext(OrderBookContext);
  if (context === undefined) {
    throw new Error('useOrderBook must be used within an OrderBookProvider');
  }
  return context;
};