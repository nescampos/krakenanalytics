'use client';

import React from 'react';
import { TradeData } from '@/types/orderbook';
import { useTradeData } from '@/lib/trade-data-context';

interface TradeHistoryTableProps {
  pair?: string; // Optional since it's provided by context
}

const TradeHistoryTable: React.FC<TradeHistoryTableProps> = ({}) => {
  const { tradeData, connectionStatus } = useTradeData();

  return (
    <div className="mt-6">
      <h3 className="text-lg font-semibold mb-3">Recent Trades</h3>
      <div className="border rounded-lg overflow-hidden">
        <div className="grid grid-cols-5 bg-gray-100 dark:bg-zinc-700 text-gray-800 dark:text-white p-2 text-sm font-semibold">
          <span>Side</span>
          <span>Price</span>
          <span>Quantity</span>
          <span>Type</span>
          <span>Time</span>
        </div>
        <div className="max-h-96 overflow-y-auto">
          {tradeData.length > 0 ? (
            <div className="divide-y divide-gray-200 dark:divide-zinc-700">
              {tradeData.map((trade, index) => (
                <div
                  key={`${trade.trade_id}-${index}`}
                  className={`grid grid-cols-5 text-sm p-2 hover:bg-gray-50 dark:hover:bg-zinc-700 ${trade.side === 'buy' ? 'bg-green-50/30 dark:bg-green-900/10' : 'bg-red-50/30 dark:bg-red-900/10'}`}
                >
                  <span className={trade.side === 'buy' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {trade.side.toUpperCase()}
                  </span>
                  <span className="font-mono">{trade.price.toFixed(5)}</span>
                  <span>{trade.qty.toFixed(5)}</span>
                  <span>{trade.ord_type}</span>
                  <span className="text-xs text-gray-500 dark:text-zinc-400">
                    {new Date(trade.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-500 dark:text-zinc-400">
              {connectionStatus === 'connecting' ? 'Connecting to trade feed...' : 'No trade history available'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TradeHistoryTable;