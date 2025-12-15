'use client';

import React from 'react';

interface MarketSelectorProps {
  selectedPair: string;
  onSelectPair: (pair: string) => void;
}

const MarketSelector: React.FC<MarketSelectorProps> = ({ selectedPair, onSelectPair }) => {
  const tradingPairs = [
    'XBT/USD',
    'ETH/USD',
    'XRP/USD',
    'LTC/USD',
    'BCH/USD',
    'DOT/USD',
    'ADA/USD',
    'LINK/USD',
    'XLM/USD',
    'MATIC/USD',
  ];

  return (
    <div className="mb-6">
      {/* <h3 className="text-lg font-semibold mb-3">Select Trading Pair</h3>
      <div className="grid grid-cols-2 gap-2 max-h-96 overflow-y-auto">
        {tradingPairs.map((pair) => (
          <button
            key={pair}
            onClick={() => onSelectPair(pair)}
            className={`py-2 px-3 rounded text-sm text-center transition-colors ${
              selectedPair === pair
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200 dark:bg-zinc-700 hover:bg-gray-300 dark:hover:bg-zinc-600'
            }`}
          >
            {pair}
          </button>
        ))}
      </div> */}
    </div>
  );
};

export default MarketSelector;