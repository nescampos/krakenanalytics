'use client';

import React from 'react';
import Link from 'next/link';

const DashboardPage = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black p-4">
      <main className="w-full max-w-4xl bg-white dark:bg-zinc-900 rounded-xl shadow-lg overflow-hidden">
        <div className="p-8 text-center">
          <h1 className="text-3xl font-bold mb-4 text-gray-800 dark:text-white">
            Kraken Order Book Visualizer
          </h1>
          <p className="text-lg text-gray-600 dark:text-zinc-300 mb-8">
            Real-time trading data visualization with historical time travel capabilities
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/orderbook" className="bg-blue-500 hover:bg-blue-600 text-white py-6 px-8 rounded-lg transition-colors duration-200 flex flex-col items-center justify-center">
              <div className="text-2xl mb-2">📊</div>
              <h2 className="text-xl font-semibold">Live Order Book</h2>
              <p className="mt-2 text-sm opacity-90">View real-time bid/ask orders</p>
            </Link>
            
            <Link href="/history" className="bg-purple-500 hover:bg-purple-600 text-white py-6 px-8 rounded-lg transition-colors duration-200 flex flex-col items-center justify-center">
              <div className="text-2xl mb-2">⏱️</div>
              <h2 className="text-xl font-semibold">Time Travel</h2>
              <p className="mt-2 text-sm opacity-90">Explore historical market data</p>
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
                <span>Historical data playback</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Multiple trading pairs support</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Time range selection</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <span>Spread calculation</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;