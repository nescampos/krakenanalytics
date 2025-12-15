'use client';

import React, { useState } from 'react';
import TimeTravelControls from '@/components/TimeTravelControls';
import OrderBook from '@/components/OrderBook';
import MarketSelector from '@/components/MarketSelector';
import { historicalDataService } from '@/lib/historical-data-service';
import { OrderBookData } from '@/types/orderbook';

const HistoryPage = () => {
  const [selectedPair, setSelectedPair] = useState('XBT/USD');
  const [selectedTime, setSelectedTime] = useState<number | null>(null);
  const [orderBookData, setOrderBookData] = useState<OrderBookData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleTimeTravel = (timeParam: string) => {
    setIsLoading(true);
    
    // Simulate loading time
    setTimeout(() => {
      const timestamps = historicalDataService.getAvailableTimestamps(selectedPair);
      if (timestamps.length > 0) {
        // Get the most recent timestamp as an example
        const mostRecentTime = Math.max(...timestamps);
        const data = historicalDataService.getOrderBookAtTime(selectedPair, mostRecentTime);
        if (data) {
          setOrderBookData(data);
          setSelectedTime(mostRecentTime);
        }
      }
      setIsLoading(false);
    }, 500);
  };

  // Reset order book data when pair changes
  useEffect(() => {
    setOrderBookData(null);
    setSelectedTime(null);
  }, [selectedPair]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex min-h-[90vh] w-full max-w-6xl flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
          <h1 className="text-xl font-bold">Historical Order Book Explorer</h1>
          <p className="text-sm opacity-80">Navigate through past market conditions with time travel</p>
        </div>
        
        <div className="p-4 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold">
              {selectedPair} Historical Data
            </h2>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Status: {selectedTime ? `Viewing data from ${new Date(selectedTime).toLocaleString()}` : 'Select a time period'}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex flex-col lg:flex-row flex-1">
          <div className="w-full lg:w-3/4 p-4 border-r border-gray-200 dark:border-zinc-700">
            <TimeTravelControls />
            
            <div className="mt-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-96">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                </div>
              ) : orderBookData ? (
                <div className="border rounded-lg overflow-hidden">
                  <div className="grid grid-cols-3 bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-white p-2 text-sm font-semibold">
                    <span>Price ({selectedPair.split('/')[1]})</span>
                    <span className="text-right">Amount ({selectedPair.split('/')[0]})</span>
                    <span className="text-right">Total</span>
                  </div>
                  
                  {/* Bids section */}
                  <div className="border border-green-500 max-h-80 overflow-y-auto">
                    <div className="divide-y divide-gray-200 dark:divide-zinc-700">
                      {orderBookData.bids
                        .slice(0, 10) // Show only top 10 bids
                        .map((bid, index) => (
                          <div 
                            key={`hist-bid-${index}`} 
                            className="grid grid-cols-3 text-sm p-2 hover:bg-green-50 dark:hover:bg-green-900/20"
                          >
                            <span className="font-mono text-green-600 dark:text-green-400">
                              {bid.price.toFixed(2)}
                            </span>
                            <span className="text-right">{bid.volume.toFixed(4)}</span>
                            <span className="text-right font-mono">{(bid.price * bid.volume).toFixed(2)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                  
                  {/* Asks section */}
                  <div className="border border-red-500 max-h-80 overflow-y-auto">
                    <div className="divide-y divide-gray-200 dark:divide-zinc-700">
                      {orderBookData.asks
                        .slice(0, 10) // Show only top 10 asks
                        .map((ask, index) => (
                          <div 
                            key={`hist-ask-${index}`} 
                            className="grid grid-cols-3 text-sm p-2 hover:bg-red-50 dark:hover:bg-red-900/20"
                          >
                            <span className="font-mono text-red-600 dark:text-red-400">
                              {ask.price.toFixed(2)}
                            </span>
                            <span className="text-right">{ask.volume.toFixed(4)}</span>
                            <span className="text-right font-mono">{(ask.price * ask.volume).toFixed(2)}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg p-8 text-center">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    No historical data loaded
                  </h3>
                  <p className="text-gray-500 dark:text-zinc-400 mb-4">
                    Select a time period using the controls above to view historical order book data
                  </p>
                  <button
                    onClick={() => handleTimeTravel('now')} // Using 'now' as an example
                    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                  >
                    Load Sample Historical Data
                  </button>
                </div>
              )}
            </div>
          </div>
          
          <div className="w-full lg:w-1/4 p-4 bg-gray-50 dark:bg-zinc-800">
            <MarketSelector 
              selectedPair={selectedPair} 
              onSelectPair={setSelectedPair} 
            />
            
            <div className="mt-6 p-4 bg-gray-100 dark:bg-zinc-700 rounded-lg">
              <h3 className="text-lg font-semibold mb-2">About Historical Data</h3>
              <p className="text-sm text-gray-600 dark:text-zinc-300">
                This page allows you to travel through time and view historical order book snapshots 
                from Kraken exchange. Select a trading pair and time period to explore past market conditions.
              </p>
              
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-600">
                <h4 className="font-medium mb-2">Available Data</h4>
                <ul className="text-xs space-y-1 text-gray-500 dark:text-zinc-400">
                  <li>• Snapshots updated every 1-10 seconds</li>
                  <li>• Depth: Top 100 levels of bids/asks</li>
                  <li>• Historical range: Up to 3 months</li>
                  <li>• Time travel precision: Sub-second accuracy</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default HistoryPage;