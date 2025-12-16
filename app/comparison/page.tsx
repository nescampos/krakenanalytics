'use client';

import React, { useState, useEffect } from 'react';
import { fetchTradingPairs, TradingPairInfo } from '@/lib/trading-pairs-service';
import { useWebSocket, subscribeToTicker, unsubscribeFromTicker, addTickerListener } from '@/lib/websocket-manager';
import { TickerData } from '@/types/orderbook';

const ComparisonPage = () => {
  const [availablePairs, setAvailablePairs] = useState<TradingPairInfo[]>([]);
  const [pair1, setPair1] = useState('XBT/USD');
  const [pair2, setPair2] = useState('ETH/USD');
  const [isLoading, setIsLoading] = useState(true);
  const [isComparing, setIsComparing] = useState(false);
  const [tickerData1, setTickerData1] = useState<TickerData | null>(null);
  const [tickerData2, setTickerData2] = useState<TickerData | null>(null);

  // Load available trading pairs on component mount
  useEffect(() => {
    const loadTradingPairs = async () => {
      try {
        const pairs = await fetchTradingPairs();
        setAvailablePairs(pairs);
      } catch (error) {
        console.error('Error fetching trading pairs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadTradingPairs();
  }, []);

  // Setup WebSocket listeners when comparing starts
  useEffect(() => {
    if (!isComparing) return;

    let unsubscribePair1: (() => void) | null = null;
    let unsubscribePair2: (() => void) | null = null;

    // Subscribe to ticker data for both pairs
    subscribeToTicker(pair1);
    subscribeToTicker(pair2);

    // Add listeners for ticker updates
    unsubscribePair1 = addTickerListener(({ symbol, data }) => {
      if (symbol === pair1) {
        setTickerData1(data);
      }
    });

    unsubscribePair2 = addTickerListener(({ symbol, data }) => {
      if (symbol === pair2) {
        setTickerData2(data);
      }
    });

    // Cleanup function
    return () => {
      if (unsubscribePair1) unsubscribePair1();
      if (unsubscribePair2) unsubscribePair2();
      unsubscribeFromTicker(pair1);
      unsubscribeFromTicker(pair2);
    };
  }, [isComparing, pair1, pair2]);

  const handleCompare = () => {
    if (pair1 === pair2) {
      alert('Please select two different trading pairs');
      return;
    }

    setTickerData1(null);
    setTickerData2(null);
    setIsComparing(true);
  };

  // Calculate comparison metrics
  const calculateComparisonMetrics = () => {
    if (!tickerData1 || !tickerData2) return null;

    return {
      lastPriceDiff: tickerData1.last - tickerData2.last,
      lastPricePercentDiff: ((tickerData1.last - tickerData2.last) / tickerData2.last) * 100,
      volumeDiff: tickerData1.volume - tickerData2.volume,
      changePercentDiff: tickerData1.change_pct - tickerData2.change_pct,
      spread1: tickerData1.ask - tickerData1.bid,
      spread2: tickerData2.ask - tickerData2.bid,
      spreadDiff: (tickerData1.ask - tickerData1.bid) - (tickerData2.ask - tickerData2.bid),
    };
  };

  const comparisonMetrics = calculateComparisonMetrics();

  const getComparisonColor = (value: number, isPositiveGood: boolean = true) => {
    if (value > 0) {
      return isPositiveGood ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400';
    } else if (value < 0) {
      return isPositiveGood ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400';
    }
    return 'text-gray-600 dark:text-zinc-300';
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="flex min-h-[90vh] w-full max-w-6xl flex-col bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
          <h1 className="text-xl font-bold">Trading Pair Comparison</h1>
          <p className="text-sm opacity-80">Compare real-time market data between two trading pairs</p>
        </div>

        <div className="p-4 border-b border-gray-200 dark:border-zinc-700 bg-gray-50 dark:bg-zinc-800">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <h2 className="text-2xl font-bold">Pair Comparison</h2>

            <div className="flex items-center space-x-4">
              <span className="text-sm">
                Status: {isComparing ? 'Comparing live data' : 'Select pairs to compare'}
              </span>
            </div>
          </div>
        </div>

        <div className="p-4 bg-gray-50 dark:bg-zinc-800">
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                First Trading Pair
              </label>
              {isLoading ? (
                <div className="h-10 bg-gray-200 dark:bg-zinc-700 animate-pulse rounded"></div>
              ) : (
                <select
                  value={pair1}
                  onChange={(e) => setPair1(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  disabled={isComparing}
                >
                  {availablePairs
                    .filter(pair => pair.wsname !== pair2) // Exclude the second selected pair
                    .map((pair) => (
                      <option key={`pair1-${pair.wsname}`} value={pair.wsname}>
                        {pair.wsname}
                      </option>
                    ))}
                </select>
              )}
            </div>

            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
                Second Trading Pair
              </label>
              {isLoading ? (
                <div className="h-10 bg-gray-200 dark:bg-zinc-700 animate-pulse rounded"></div>
              ) : (
                <select
                  value={pair2}
                  onChange={(e) => setPair2(e.target.value)}
                  className="w-full p-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                  disabled={isComparing}
                >
                  {availablePairs
                    .filter(pair => pair.wsname !== pair1) // Exclude the first selected pair
                    .map((pair) => (
                      <option key={`pair2-${pair.wsname}`} value={pair.wsname}>
                        {pair.wsname}
                      </option>
                    ))}
                </select>
              )}
            </div>

            <div className="flex items-end">
              <button
                onClick={handleCompare}
                disabled={isComparing || isLoading}
                className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                  isComparing || isLoading
                    ? 'bg-gray-300 dark:bg-zinc-600 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                Compare
              </button>
            </div>
          </div>

          {isComparing && (
            <div className="mt-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* First Pair Data */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold mb-4 text-center">{pair1}</h3>

                  {tickerData1 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">Last Price:</span>
                        <span className="font-mono">{tickerData1.last?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">Bid:</span>
                        <span className="font-mono text-green-600 dark:text-green-400">{tickerData1.bid?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">Ask:</span>
                        <span className="font-mono text-red-600 dark:text-red-400">{tickerData1.ask?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">24h Change:</span>
                        <span className={tickerData1.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {tickerData1.change >= 0 ? '+' : ''}{tickerData1.change?.toFixed(5)} ({tickerData1.change_pct?.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">24h High:</span>
                        <span className="font-mono">{tickerData1.high?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">24h Low:</span>
                        <span className="font-mono">{tickerData1.low?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">Volume:</span>
                        <span className="font-mono">{tickerData1.volume?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">VWAP:</span>
                        <span className="font-mono">{tickerData1.vwap?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">Spread:</span>
                        <span className="font-mono">{(tickerData1.ask - tickerData1.bid).toFixed(5)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>

                {/* Second Pair Data */}
                <div className="bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold mb-4 text-center">{pair2}</h3>

                  {tickerData2 ? (
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">Last Price:</span>
                        <span className="font-mono">{tickerData2.last?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">Bid:</span>
                        <span className="font-mono text-green-600 dark:text-green-400">{tickerData2.bid?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">Ask:</span>
                        <span className="font-mono text-red-600 dark:text-red-400">{tickerData2.ask?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">24h Change:</span>
                        <span className={tickerData2.change >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                          {tickerData2.change >= 0 ? '+' : ''}{tickerData2.change?.toFixed(5)} ({tickerData2.change_pct?.toFixed(2)}%)
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">24h High:</span>
                        <span className="font-mono">{tickerData2.high?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">24h Low:</span>
                        <span className="font-mono">{tickerData2.low?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">Volume:</span>
                        <span className="font-mono">{tickerData2.volume?.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">VWAP:</span>
                        <span className="font-mono">{tickerData2.vwap?.toFixed(5)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600 dark:text-zinc-300">Spread:</span>
                        <span className="font-mono">{(tickerData2.ask - tickerData2.bid).toFixed(5)}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center items-center py-4">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-500"></div>
                    </div>
                  )}
                </div>
              </div>

              {/* Comparison Metrics */}
              {comparisonMetrics && (
                <div className="mt-6 bg-white dark:bg-zinc-800 rounded-lg shadow p-4">
                  <h3 className="text-lg font-semibold mb-4 text-center">Comparison Analysis</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-gray-100 dark:bg-zinc-700 p-3 rounded">
                      <p className="text-sm text-gray-600 dark:text-zinc-300">Last Price Diff</p>
                      <p className={`font-mono text-lg ${getComparisonColor(comparisonMetrics.lastPriceDiff, true)}`}>
                        {comparisonMetrics.lastPriceDiff.toFixed(5)}
                      </p>
                      <p className={`text-xs ${getComparisonColor(comparisonMetrics.lastPricePercentDiff, true)}`}>
                        {comparisonMetrics.lastPricePercentDiff.toFixed(2)}% difference
                      </p>
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-700 p-3 rounded">
                      <p className="text-sm text-gray-600 dark:text-zinc-300">Volume Difference</p>
                      <p className={`font-mono text-lg ${getComparisonColor(comparisonMetrics.volumeDiff, true)}`}>
                        {comparisonMetrics.volumeDiff.toFixed(2)}
                      </p>
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-700 p-3 rounded">
                      <p className="text-sm text-gray-600 dark:text-zinc-300">24h Change Diff</p>
                      <p className={`font-mono text-lg ${getComparisonColor(comparisonMetrics.changePercentDiff, true)}`}>
                        {comparisonMetrics.changePercentDiff.toFixed(2)}%
                      </p>
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-700 p-3 rounded">
                      <p className="text-sm text-gray-600 dark:text-zinc-300">Spread 1</p>
                      <p className="font-mono text-lg">
                        {(tickerData1?.ask || 0 - tickerData1?.bid || 0).toFixed(5)}
                      </p>
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-700 p-3 rounded">
                      <p className="text-sm text-gray-600 dark:text-zinc-300">Spread 2</p>
                      <p className="font-mono text-lg">
                        {(tickerData2?.ask || 0 - tickerData2?.bid || 0).toFixed(5)}
                      </p>
                    </div>

                    <div className="bg-gray-100 dark:bg-zinc-700 p-3 rounded">
                      <p className="text-sm text-gray-600 dark:text-zinc-300">Spread Diff</p>
                      <p className={`font-mono text-lg ${getComparisonColor(comparisonMetrics.spreadDiff, false)}`}>
                        {comparisonMetrics.spreadDiff.toFixed(5)}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-zinc-400">Negative = tighter spread</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {!isComparing && (
          <div className="p-4 bg-gray-50 dark:bg-zinc-800 border-t border-gray-200 dark:border-zinc-700">
            <div className="max-w-2xl mx-auto text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Compare Trading Pairs
              </h3>
              <p className="text-gray-600 dark:text-zinc-300 mb-4">
                Select two different trading pairs from the dropdown menus and click "Compare"
                to view real-time market data side by side along with comparative analysis.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
                <div className="bg-white dark:bg-zinc-700 p-4 rounded-lg shadow">
                  <div className="text-2xl mb-2">📊</div>
                  <h4 className="font-semibold mb-1">Real-time Data</h4>
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    Live ticker data from Kraken exchange
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-700 p-4 rounded-lg shadow">
                  <div className="text-2xl mb-2">⚖️</div>
                  <h4 className="font-semibold mb-1">Side-by-Side</h4>
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    Compare metrics across different pairs
                  </p>
                </div>

                <div className="bg-white dark:bg-zinc-700 p-4 rounded-lg shadow">
                  <div className="text-2xl mb-2">🔍</div>
                  <h4 className="font-semibold mb-1">Analysis</h4>
                  <p className="text-sm text-gray-600 dark:text-zinc-300">
                    Key differences and insights
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default ComparisonPage;