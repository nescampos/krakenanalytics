'use client';

import React, { useState, useEffect } from 'react';
import OrderBookRow from './OrderBookRow';
import { OrderBookData } from '@/types/orderbook';
import { generateMockOrderBook } from '@/lib/kraken-api';

interface OrderBookProps {
  pair: string;
}

const OrderBook: React.FC<OrderBookProps> = ({ pair }) => {
  const [orderBook, setOrderBook] = useState<OrderBookData | null>(null);
  const [maxVolume, setMaxVolume] = useState(0);

  // Initialize with mock data
  useEffect(() => {
    const mockData = generateMockOrderBook(pair);
    
    // Convert Kraken format to our OrderBookData
    const formattedData: OrderBookData = {
      bids: mockData.bids.map(([price, volume]: [number, number]) => ({
        price,
        volume,
        numberOfOrders: Math.floor(Math.random() * 10) + 1
      })),
      asks: mockData.asks.map(([price, volume]: [number, number]) => ({
        price,
        volume,
        numberOfOrders: Math.floor(Math.random() * 10) + 1
      })),
      timestamp: Date.now()
    };

    // Calculate max volume for percentage bars
    const allVolumes = [
      ...mockData.bids.map(([, vol]) => vol),
      ...mockData.asks.map(([, vol]) => vol)
    ];
    const newMaxVolume = Math.max(...allVolumes);
    setMaxVolume(newMaxVolume);

    setOrderBook(formattedData);
  }, [pair]);

  if (!orderBook) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading order book...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-200px)]">
      {/* Asks (Sell orders) - highest at top */}
      <div className="flex-1 overflow-y-auto border border-red-500 rounded-t-md">
        <div className="grid grid-cols-3 bg-red-500 text-white text-sm uppercase font-bold p-2">
          <span>Price ({pair.split('/')[1]})</span>
          <span className="text-right">Amount ({pair.split('/')[0]})</span>
          <span className="text-right">Total</span>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-zinc-700">
          {orderBook.asks
            .sort((a, b) => b.price - a.price) // Sort highest price first
            .map((ask, index) => (
              <OrderBookRow
                key={`ask-${index}`}
                entry={ask}
                type="ask"
                maxVolume={maxVolume}
              />
            ))}
        </div>
      </div>

      {/* Spread indicator */}
      <div className="bg-gray-100 dark:bg-zinc-800 py-2 text-center text-sm font-semibold border-l border-r border-gray-200 dark:border-zinc-700">
        {orderBook.asks.length > 0 && orderBook.bids.length > 0 ? (
          <span>
            Spread: {(orderBook.asks[0].price - orderBook.bids[0].price).toFixed(2)} (
            {(((orderBook.asks[0].price - orderBook.bids[0].price) / orderBook.bids[0].price) * 100).toFixed(2)}%)
          </span>
        ) : (
          <span>No spread data</span>
        )}
      </div>

      {/* Bids (Buy orders) - highest at top */}
      <div className="flex-1 overflow-y-auto border border-green-500 rounded-b-md">
        <div className="grid grid-cols-3 bg-green-500 text-white text-sm uppercase font-bold p-2">
          <span>Price ({pair.split('/')[1]})</span>
          <span className="text-right">Amount ({pair.split('/')[0]})</span>
          <span className="text-right">Total</span>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-zinc-700">
          {orderBook.bids
            .sort((a, b) => b.price - a.price) // Sort highest price first
            .map((bid, index) => (
              <OrderBookRow
                key={`bid-${index}`}
                entry={bid}
                type="bid"
                maxVolume={maxVolume}
              />
            ))}
        </div>
      </div>
    </div>
  );
};

export default OrderBook;