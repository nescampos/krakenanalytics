'use client';

import React, { useMemo } from 'react';
import OrderBookRow from './OrderBookRow';
import { OrderBookEntry, WebSocketOrderBookData } from '@/types/orderbook';
import { useOrderBook } from '@/lib/orderbook-data-context';

interface OrderBookProps {
  pair: string;
}

const OrderBook: React.FC<OrderBookProps> = ({ pair }) => {
  const { orderBookData, connectionStatus } = useOrderBook();

  // Convert WebSocket format to our internal format
  const convertedOrderBook = useMemo(() => {
    if (!orderBookData) return null;

    // Convert WebSocket format to our internal format
    const bids: OrderBookEntry[] = orderBookData.bids.map(bid => ({
      price: bid.price,
      volume: bid.qty,
      numberOfOrders: 1 // Default to 1 since WebSocket doesn't provide this
    }));

    const asks: OrderBookEntry[] = orderBookData.asks.map(ask => ({
      price: ask.price,
      volume: ask.qty,
      numberOfOrders: 1 // Default to 1 since WebSocket doesn't provide this
    }));

    return {
      bids,
      asks,
      timestamp: Date.now()
    };
  }, [orderBookData]);

  // Calculate max volume for percentage bars
  const maxVolume = useMemo(() => {
    if (!convertedOrderBook) return 1;
    const allVolumes = [
      ...convertedOrderBook.bids.map(bid => bid.volume),
      ...convertedOrderBook.asks.map(ask => ask.volume)
    ];
    return allVolumes.length > 0 ? Math.max(...allVolumes) : 1;
  }, [convertedOrderBook]);

  // Memoize the sorted asks and bids to prevent unnecessary re-renders
  const sortedAsks = useMemo(() => {
    if (!convertedOrderBook) return [];
    return [...convertedOrderBook.asks].sort((a, b) => b.price - a.price);
  }, [convertedOrderBook]);

  const sortedBids = useMemo(() => {
    if (!convertedOrderBook) return [];
    return [...convertedOrderBook.bids].sort((a, b) => b.price - a.price);
  }, [convertedOrderBook]);

  if (!convertedOrderBook) {
    return (
      <div className="flex justify-center items-center h-96">
        <p>Loading order book... {connectionStatus !== 'connected' && `(${connectionStatus})`}</p>
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
          {sortedAsks.map((ask, index) => (
            <OrderBookRow
              key={`ask-${ask.price}-${ask.volume}`}
              entry={ask}
              type="ask"
              maxVolume={maxVolume}
            />
          ))}
        </div>
      </div>

      {/* Spread indicator */}
      <div className="bg-gray-100 dark:bg-zinc-800 py-2 text-center text-sm font-semibold border-l border-r border-gray-200 dark:border-zinc-700">
        {convertedOrderBook.asks.length > 0 && convertedOrderBook.bids.length > 0 ? (
          <span>
            Spread: {(convertedOrderBook.asks[0].price - convertedOrderBook.bids[0].price).toFixed(5)} (
            {(((convertedOrderBook.asks[0].price - convertedOrderBook.bids[0].price) / convertedOrderBook.bids[0].price) * 100).toFixed(2)}%)
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
          {sortedBids.map((bid, index) => (
            <OrderBookRow
              key={`bid-${bid.price}-${bid.volume}`}
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