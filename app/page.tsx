'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { fetchTradingPairs, TradingPairInfo } from '@/lib/trading-pairs-service';

const DashboardPage = () => {
  const [tradingPairs, setTradingPairs] = useState<TradingPairInfo[]>([]);
  const [filteredPairs, setFilteredPairs] = useState<TradingPairInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadTradingPairs = async () => {
      try {
        setLoading(true);
        const pairs = await fetchTradingPairs();
        setTradingPairs(pairs);
        setFilteredPairs(pairs); // Initially show all pairs
        setError(null);
      } catch (err) {
        console.error('Error fetching trading pairs:', err);
        setError('Failed to load trading pairs');
      } finally {
        setLoading(false);
      }
    };

    loadTradingPairs();
  }, []);

  // Filter pairs based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredPairs(tradingPairs);
    } else {
      const filtered = tradingPairs.filter(pair =>
        pair.wsname.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredPairs(filtered);
    }
  }, [searchTerm, tradingPairs]);

  // Pagination logic
  const itemsPerPage = 30;
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(filteredPairs.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentPairs = filteredPairs.slice(startIndex, startIndex + itemsPerPage);

  const goToPage = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
            Kraken Analytics Visualizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-zinc-300 mb-8">
            Real-time trading data visualization with order book and pair comparison features
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/" className="bg-blue-500 hover:bg-blue-600 text-white py-6 px-8 rounded-lg transition-colors duration-200 flex flex-col items-center justify-center">
              <div className="text-2xl mb-2">📊</div>
              <h2 className="text-xl font-semibold">Live Order Book</h2>
              <p className="mt-2 text-sm opacity-90">View real-time bid/ask orders, including trades and prices</p>
            </Link>

            <Link href="/comparison" className="bg-purple-500 hover:bg-purple-600 text-white py-6 px-8 rounded-lg transition-colors duration-200 flex flex-col items-center justify-center">
              <div className="text-2xl mb-2">🔄</div>
              <h2 className="text-xl font-semibold">Pair Comparison</h2>
              <p className="mt-2 text-sm opacity-90">Compare multiple trading pairs side by side</p>
            </Link>
          </div>

          <div className="mt-10 p-6 bg-gray-100 dark:bg-zinc-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-3">Current Features</h3>
            <ul className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-left">
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Real-time WebSocket connection to Kraken</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Interactive order book visualization</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Real-time data streaming and updates</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Multiple trading pairs support</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Spread calculation</span>
              </li>
            </ul>
          </div>

          {/* Trading Pairs Section */}
          <div className="mt-10 p-6 bg-gray-100 dark:bg-zinc-800 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Available Trading Pairs</h3>
            
            <p className="text-sm text-gray-600 dark:text-zinc-300 mb-4">
              Search and select a pair to view real-time order book data and analytics
            </p>

            {/* Search Input */}
            <div className="mb-4">
              <input
                type="text"
                placeholder="Search trading pairs..."
                className="w-full p-3 rounded-lg border border-gray-300 dark:border-zinc-600 bg-white dark:bg-zinc-700 text-gray-900 dark:text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loading ? (
              <div className="flex justify-center items-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 text-center py-4">{error}</div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 max-h-80 overflow-y-auto p-2">
                  {currentPairs.map((pair, index) => (
                    <Link
                      key={`${startIndex + index}-${pair.wsname}`}
                      href={`/orderbook?pair=${encodeURIComponent(pair.wsname)}`}
                      className="bg-white dark:bg-zinc-700 p-3 rounded text-sm truncate text-center hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-200 cursor-pointer"
                      title={pair.wsname}
                    >
                      {pair.wsname}
                    </Link>
                  ))}
                </div>

                {/* Pagination Controls */}
                {totalPages > 1 && (
                  <div className="mt-4 flex flex-col items-center">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded ${currentPage === 1 ? 'bg-gray-300 dark:bg-zinc-600 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                      >
                        Previous
                      </button>

                      <span className="mx-2 text-sm text-gray-600 dark:text-zinc-300">
                        Page {currentPage} of {totalPages}
                      </span>

                      <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded ${currentPage === totalPages ? 'bg-gray-300 dark:bg-zinc-600 cursor-not-allowed' : 'bg-blue-500 text-white hover:bg-blue-600'}`}
                      >
                        Next
                      </button>
                    </div>

                    {/* Page numbers for small number of pages */}
                    {totalPages <= 7 && (
                      <div className="mt-2 flex space-x-1">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 rounded ${
                              currentPage === page
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-500'
                            }`}
                          >
                            {page}
                          </button>
                        ))}
                      </div>
                    )}

                    {/* Ellipsis for many pages */}
                    {totalPages > 7 && (
                      <div className="mt-2 flex space-x-1">
                        {currentPage > 3 && (
                          <>
                            <button
                              onClick={() => goToPage(1)}
                              className={`px-3 py-1 rounded ${
                                currentPage === 1
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-500'
                              }`}
                            >
                              1
                            </button>
                            {currentPage > 4 && <span className="px-2">...</span>}
                          </>
                        )}

                        {Array.from(
                          { length: Math.min(totalPages, 5) },
                          (_, i) => Math.max(2, Math.min(currentPage - 2, totalPages - 3)) + i
                        )
                        .filter(page => page > 1 && page < totalPages)
                        .map(page => (
                          <button
                            key={page}
                            onClick={() => goToPage(page)}
                            className={`px-3 py-1 rounded ${
                              currentPage === page
                                ? 'bg-blue-500 text-white'
                                : 'bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-500'
                            }`}
                          >
                            {page}
                          </button>
                        ))}

                        {currentPage < totalPages - 2 && (
                          <>
                            {currentPage < totalPages - 3 && <span className="px-2">...</span>}
                            <button
                              onClick={() => goToPage(totalPages)}
                              className={`px-3 py-1 rounded ${
                                currentPage === totalPages
                                  ? 'bg-blue-500 text-white'
                                  : 'bg-gray-200 dark:bg-zinc-600 text-gray-800 dark:text-white hover:bg-gray-300 dark:hover:bg-zinc-500'
                              }`}
                            >
                              {totalPages}
                            </button>
                          </>
                        )}
                      </div>
                    )}

                    <div className="mt-2 text-sm text-gray-500 dark:text-zinc-400">
                      Showing {Math.min(startIndex + 1, filteredPairs.length)}-{Math.min(startIndex + itemsPerPage, filteredPairs.length)} of {filteredPairs.length} pairs
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;