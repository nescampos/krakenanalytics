'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderBook from '@/components/OrderBook';
import MarketSelector from '@/components/MarketSelector';
import OrderBookHeader from '@/components/OrderBookHeader';
import { useTicker, TickerProvider } from '@/lib/orderbook-context';
import { OrderBookProvider } from '@/lib/orderbook-data-context';


const OrderBookContent = ({ pair }: { pair: string }) => {
  const { connectionStatus, error, tickerData } = useTicker();

  const isConnected = connectionStatus === 'connected';

  return (
    <>
      <div className="w-full lg:w-3/4 p-4 border-r border-gray-200 dark:border-zinc-700">
        <OrderBookProvider pair={pair}>
          <OrderBook pair={pair} />
        </OrderBookProvider>
      </div>

      <div className="w-full lg:w-1/4 p-4 bg-gray-50 dark:bg-zinc-800">
        <MarketSelector
          selectedPair={pair}
          onSelectPair={(newPair) => window.location.href = `/orderbook?pair=${encodeURIComponent(newPair)}`}
        />

        <div className="mt-6 p-4 bg-gray-100 dark:bg-zinc-700 rounded-lg">
          <h3 className="text-lg font-semibold mb-2">Trading Pair Info</h3>

          {error && (
            <div className="text-red-500 text-sm mb-2">{error}</div>
          )}

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-zinc-300">Pair:</span>
              <span className="font-medium">{pair}</span>
            </div>

            <div className="flex justify-between text-sm">
              <span className="text-gray-600 dark:text-zinc-300">Status:</span>
              <span className={isConnected ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                {connectionStatus.charAt(0).toUpperCase() + connectionStatus.slice(1)}
              </span>
            </div>

            {tickerData && (
              <>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">Last Price:</span>
                  <span className="font-mono">{tickerData.last?.toFixed(5)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">Bid:</span>
                  <span className="font-mono text-green-600 dark:text-green-400">{tickerData.bid?.toFixed(5)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">Ask:</span>
                  <span className="font-mono text-red-600 dark:text-red-400">{tickerData.ask?.toFixed(5)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">24h Change:</span>
                  <span className={tickerData.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {tickerData.change >= 0 ? '+' : ''}{tickerData.change?.toFixed(5)} ({tickerData.change_pct?.toFixed(2)}%)
                  </span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">24h High:</span>
                  <span className="font-mono">{tickerData.high?.toFixed(5)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">24h Low:</span>
                  <span className="font-mono">{tickerData.low?.toFixed(5)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">Volume:</span>
                  <span className="font-mono">{tickerData.volume?.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">VWAP:</span>
                  <span className="font-mono">{tickerData.vwap?.toFixed(5)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">Bid Qty:</span>
                  <span className="font-mono">{tickerData.bid_qty?.toFixed(2)}</span>
                </div>

                <div className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-zinc-300">Ask Qty:</span>
                  <span className="font-mono">{tickerData.ask_qty?.toFixed(2)}</span>
                </div>
              </>
            )}
          </div>

          <p className="text-xs text-gray-500 dark:text-zinc-400 mt-3">
            This view shows real-time data from Kraken's WebSocket API.
          </p>
        </div>
      </div>
    </>
  );
};

const OrderBookPage = () => {
  const searchParams = useSearchParams();
  const initialPair = searchParams?.get('pair') ?? 'XBT/USD';

  const [selectedPair, setSelectedPair] = useState(initialPair);

  // Update selected pair when URL parameter changes
  useEffect(() => {
    const urlPair = searchParams?.get('pair');
    if (urlPair && urlPair !== selectedPair) {
      setSelectedPair(urlPair);
    }
  }, [searchParams, selectedPair]);

  return (
    <TickerProvider pair={selectedPair}>
      <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
        <main className="flex min-h-[90vh] w-full max-w-6xl flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
          <OrderBookHeader
            selectedPair={selectedPair}
          />

          <div className="flex flex-col lg:flex-row flex-1">
            <OrderBookContent pair={selectedPair} />
          </div>
        </main>
      </div>
    </TickerProvider>
  );
};

export default OrderBookPage;