'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderBook from '@/components/OrderBook';
import MarketSelector from '@/components/MarketSelector';
import OrderBookHeader from '@/components/OrderBookHeader';
import TradeHistoryTable from '@/components/TradeHistoryTable';
import OHLCChart from '@/components/OHLCChart';
import { useTicker, TickerProvider } from '@/lib/orderbook-context';
import { OrderBookProvider } from '@/lib/orderbook-data-context';
import { TradeDataProvider } from '@/lib/trade-data-context';
import { useWebSocket, subscribeToOHLC, unsubscribeFromOHLC, addOHLCListener } from '@/lib/websocket-manager';
import { OHLCData } from '@/lib/websocket-manager';


const OrderBookContent = ({ pair }: { pair: string }) => {
  const { connectionStatus, error, tickerData } = useTicker();
  const { ohlcData } = useWebSocket();
  const [selectedInterval, setSelectedInterval] = useState<number>(5);
  const [isLoadingOHLC, setIsLoadingOHLC] = useState<boolean>(true);
  const [ohlcError, setOHLCError] = useState<string | null>(null);

  const isConnected = connectionStatus === 'connected';
  const currentOHLCData = ohlcData[pair] || [];

  // Setup OHLC subscription when component mounts or pair changes
  useEffect(() => {
    let unsubscribeOHLC: (() => void) | null = null;

    const initializeSubscription = () => {
      try {
        setIsLoadingOHLC(true);
        subscribeToOHLC(pair, selectedInterval);

        unsubscribeOHLC = addOHLCListener(({ symbol, data, isSnapshot }) => {
          if (symbol === pair) {
            setIsLoadingOHLC(false);
            setOHLCError(null);
          }
        });
      } catch (err) {
        console.error('Error subscribing to OHLC data:', err);
        setIsLoadingOHLC(false);
        setOHLCError('Failed to load OHLC data');
      }
    };

    initializeSubscription();

    // Cleanup function
    return () => {
      if (unsubscribeOHLC) unsubscribeOHLC();
      unsubscribeFromOHLC(pair, selectedInterval);
    };
  }, [pair]); // Only subscribe when the pair changes, not interval


  return (
    <>
      <div className="w-full lg:w-3/4 p-4 border-r border-gray-200 dark:border-zinc-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold mb-2">Chart</h3>

          <div className="flex space-x-2 mb-4">
            {[1, 5, 15, 30, 60, 240,1440, 10080, 21600].map((interval) => (
              <button
                key={interval}
                onClick={() => {
                  if (pair) {
                    // Unsubscribe from the current interval
                    unsubscribeFromOHLC(pair, selectedInterval);

                    // Update the selected interval
                    setSelectedInterval(interval);

                    // Subscribe to the new interval after a small delay
                    setTimeout(() => {
                      try {
                        setIsLoadingOHLC(true);
                        subscribeToOHLC(pair, interval);
                      } catch (err) {
                        console.error('Error resubscribing to OHLC data:', err);
                        setIsLoadingOHLC(false);
                        setOHLCError('Failed to resubscribe to OHLC data');
                      }
                    }, 100); // Small delay to ensure unsubscribe completes
                  }
                }}
                className={`px-3 py-1 rounded text-sm ${
                  selectedInterval === interval
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 dark:bg-zinc-700 text-gray-800 dark:text-white'
                }`}
              >
                {interval < 60 ? `${interval}m` : interval === 1440 ? '1d' : interval === 10080 ? '1w' : interval === 21600 ? '15d' : `${interval / 60}h`}
              </button>
            ))}
          </div>

          {isLoadingOHLC ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : ohlcError ? (
            <div className="text-red-500 text-center py-4">{ohlcError}</div>
          ) : currentOHLCData.length > 0 ? (
            <OHLCChart
              data={currentOHLCData}
              title={`Chart - ${pair} (${selectedInterval}m)`}
            />
          ) : (
            <div className="border-2 border-dashed border-gray-300 dark:border-zinc-600 rounded-lg p-8 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                No OHLC data available
              </h3>
              <p className="text-gray-500 dark:text-zinc-400">
                Waiting for OHLC data from Kraken API
              </p>
            </div>
          )}
        </div>

        <TradeDataProvider pair={pair}>
          <TradeHistoryTable pair={pair} />
        </TradeDataProvider>

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