'use client';

import React, { useState, useEffect } from 'react';
import OrderBook from '@/components/OrderBook';
import WebSocketManager from '@/components/WebSocketManager';
import MarketSelector from '@/components/MarketSelector';
import OrderBookHeader from '@/components/OrderBookHeader';

const OrderBookPage = () => {
  const [selectedPair, setSelectedPair] = useState('XBT/USD');
  const [isConnected, setIsConnected] = useState(false);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex min-h-[90vh] w-full max-w-6xl flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
        <WebSocketManager 
          pair={selectedPair} 
          onConnectionChange={setIsConnected} 
        />
        
        <OrderBookHeader 
          selectedPair={selectedPair} 
          isConnected={isConnected} 
        />
        
        <div className="flex flex-col lg:flex-row flex-1">
          <div className="w-full lg:w-3/4 p-4 border-r border-gray-200 dark:border-zinc-700">
            <OrderBook pair={selectedPair} />
          </div>
          
          <div className="w-full lg:w-1/4 p-4 bg-gray-50 dark:bg-zinc-800">
            <MarketSelector 
              selectedPair={selectedPair} 
              onSelectPair={setSelectedPair} 
            />
            <div className="mt-6 p-4 bg-gray-100 dark:bg-zinc-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Trading Pair Info</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                Selected: {selectedPair}
              </p>
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                Status: {isConnected ? 'Connected' : 'Disconnected'}
              </p>
              <p className="text-xs text-gray-500 dark:text-zinc-400 mt-3">
                This view shows the live order book with real-time updates from Kraken's WebSocket API.
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default OrderBookPage;