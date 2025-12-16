// Context for managing trade data for a specific trading pair
'use client';

import React, { createContext, useContext, ReactNode, useEffect, useState } from 'react';
import { useWebSocket, subscribeToTrade, unsubscribeFromTrade } from '@/lib/websocket-manager';
import { TradeData } from '@/types/orderbook';

interface TradeDataContextType {
  tradeData: TradeData[];
  connectionStatus: 'connecting' | 'connected' | 'disconnected';
  error: string | null;
  selectedPair: string;
}

const TradeDataContext = createContext<TradeDataContextType | undefined>(undefined);

interface TradeDataProviderProps {
  children: ReactNode;
  pair: string;
}

export const TradeDataProvider: React.FC<TradeDataProviderProps> = ({ children, pair }) => {
  const { tradeData: allTradeData, connectionStatus, error } = useWebSocket();
  const [pairTradeData, setPairTradeData] = useState<TradeData[]>([]);

  useEffect(() => {
    // Subscribe to the trade data for the pair when component mounts
    subscribeToTrade(pair);

    // Cleanup trade subscription when component unmounts
    return () => {
      unsubscribeFromTrade(pair);
    };
  }, [pair]);

  useEffect(() => {
    if (allTradeData && allTradeData[pair]) {
      setPairTradeData(allTradeData[pair]);
    }
  }, [allTradeData, pair]);

  const value = {
    tradeData: pairTradeData,
    connectionStatus,
    error,
    selectedPair: pair
  };

  return (
    <TradeDataContext.Provider value={value}>
      {children}
    </TradeDataContext.Provider>
  );
};

export const useTradeData = () => {
  const context = useContext(TradeDataContext);
  if (context === undefined) {
    throw new Error('useTradeData must be used within a TradeDataProvider');
  }
  return context;
};