import React from 'react';
import { OrderBookEntry } from '@/types/orderbook';

interface OrderBookRowProps {
  entry: OrderBookEntry;
  type: 'bid' | 'ask';
  maxVolume: number;
}

const OrderBookRow: React.FC<OrderBookRowProps> = ({ entry, type, maxVolume }) => {
  const isBid = type === 'bid';
  const percentFilled = (entry.volume / maxVolume) * 100;
  const total = entry.price * entry.volume;

  return (
    <div 
      className={`grid grid-cols-3 text-sm p-2 relative ${
        isBid 
          ? 'hover:bg-green-50 dark:hover:bg-green-900/20' 
          : 'hover:bg-red-50 dark:hover:bg-red-900/20'
      }`}
    >
      {/* Volume bar in background */}
      <div 
        className={`absolute inset-y-0 left-0 z-0 ${
          isBid 
            ? 'bg-green-500/10 dark:bg-green-900/20' 
            : 'bg-red-500/10 dark:bg-red-900/20'
        }`}
        style={{ width: `${percentFilled}%` }}
      ></div>
      
      <span className={`relative z-10 font-mono ${isBid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
        {entry.price.toFixed(2)}
      </span>
      <span className="text-right relative z-10">{entry.volume.toFixed(4)}</span>
      <span className="text-right relative z-10 font-mono">{total.toFixed(2)}</span>
    </div>
  );
};

export default OrderBookRow;