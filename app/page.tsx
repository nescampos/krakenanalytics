'use client';

import React, { useState } from 'react';
import OrderBook from '@/components/OrderBook';
import TimeTravelControls from '@/components/TimeTravelControls';
import WebSocketManager from '@/components/WebSocketManager';
import MarketSelector from '@/components/MarketSelector';
import OrderBookHeader from '@/components/OrderBookHeader';

export default function Home() {
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
        
        <div className="flex flex-col md:flex-row flex-1">
          <div className="w-full md:w-2/3 p-4 border-r border-gray-200 dark:border-zinc-700">
            <TimeTravelControls />
            <OrderBook pair={selectedPair} />
          </div>
          
          <div className="w-full md:w-1/3 p-4">
            <MarketSelector 
              selectedPair={selectedPair} 
              onSelectPair={setSelectedPair} 
            />
            <div className="mt-6 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">Trading Pair Info</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                Selected: {selectedPair}
              </p>
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                Status: {isConnected ? 'Connected' : 'Disconnected'}
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}