// Context for sharing ticker data between components using the global WebSocket
'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useWebSocket, subscribeToPair, unsubscribeFromPair } from '@/lib/websocket-manager';
import { TickerData } from '@/types/orderbook';

interface TickerContextType {
  tickerData: TickerData | null;
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  error: string | null;
  selectedPair: string;
}

const TickerContext = createContext<TickerContextType | undefined>(undefined);

interface TickerProviderProps {
  children: ReactNode;
  pair: string;
}

export const TickerProvider: React.FC<TickerProviderProps> = ({ children, pair }) => {
  const { tickerData: allTickerData, connectionStatus, error } = useWebSocket();
  const [pairTickerData, setPairTickerData] = useState<TickerData | null>(null);

  useEffect(() => {
    // Subscribe to the pair when component mounts
    subscribeToPair(pair);

    // Cleanup subscription when component unmounts
    return () => {
      //unsubscribeFromPair(pair);
    };
  }, [pair]);

  useEffect(() => {
    if (allTickerData && allTickerData[pair]) {
      setPairTickerData(allTickerData[pair]);
    }
  }, [allTickerData, pair]);

  const value = {
    tickerData: pairTickerData,
    connectionStatus,
    error,
    selectedPair: pair
  };

  return (
    <TickerContext.Provider value={value}>
      {children}
    </TickerContext.Provider>
  );
};

export const useTicker = () => {
  const context = useContext(TickerContext);
  if (context === undefined) {
    throw new Error('useTicker must be used within a TickerProvider');
  }
  return context;
};