// Context for managing specific pair data from the global WebSocket
'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useWebSocket, subscribeToPair, unsubscribeFromPair } from '@/lib/websocket-manager';

interface PairDataContextType {
  tickerData: any | null; // Using any for now as we'll get the data from the global context
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  error: string | null;
}

const PairDataContext = createContext<PairDataContextType | undefined>(undefined);

interface PairDataProviderProps {
  children: ReactNode;
  pair: string;
}

export const PairDataProvider: React.FC<PairDataProviderProps> = ({ children, pair }) => {
  const { tickerData, connectionStatus, error } = useWebSocket();
  const [pairTickerData, setPairTickerData] = useState<any | null>(null);

  useEffect(() => {
    // Subscribe to the pair when component mounts
    subscribeToPair(pair);
    
    // Cleanup subscription when component unmounts
    return () => {
      unsubscribeFromPair(pair);
    };
  }, [pair]);

  // Update the pair-specific data when global ticker data changes
  useEffect(() => {
    if (tickerData && tickerData[pair]) {
      setPairTickerData(tickerData[pair]);
    }
  }, [tickerData, pair]);

  const value = {
    tickerData: pairTickerData,
    connectionStatus,
    error
  };

  return (
    <PairDataContext.Provider value={value}>
      {children}
    </PairDataContext.Provider>
  );
};

export const usePairData = () => {
  const context = useContext(PairDataContext);
  if (context === undefined) {
    throw new Error('usePairData must be used within a PairDataProvider');
  }
  return context;
};