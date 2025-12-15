import React from 'react';

interface OrderBookHeaderProps {
  selectedPair: string;
  isConnected: boolean;
}

const OrderBookHeader: React.FC<OrderBookHeaderProps> = ({ selectedPair, isConnected }) => {
  return (
    <div className="p-4 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold">
            {selectedPair} Order Book
          </h2>
          <p className="text-sm text-gray-600 dark:text-zinc-400">
            Real-time depth chart and order book visualization
          </p>
        </div>
        
        <div className="mt-2 sm:mt-0 flex items-center space-x-4">
          <div className="text-sm">
            <span className="inline-block w-2 h-2 rounded-full bg-green-500 mr-1"></span>
            <span>Live Data</span>
          </div>
          
          <div className="text-sm">
            <span>Status:</span>{' '}
            <span className={isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderBookHeader;