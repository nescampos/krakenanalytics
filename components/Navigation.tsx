'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

const Navigation: React.FC = () => {
  const pathname = usePathname();
  
  const navItems = [
    { name: 'Dashboard', path: '/' },
    { name: 'Order Book', path: '/orderbook' },
    { name: 'Comparison', path: '/comparison' },
  ];

  return (
    <nav className="bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-white">
      <div className="container mx-auto flex flex-col sm:flex-row justify-between items-center">
        <div className="mb-4 sm:mb-0">
          <Link href="/">
            <h1 className="text-xl font-bold">Kraken Order Book Visualizer</h1>
            <p className="text-xs opacity-80">Real-time trading data with time travel capabilities</p>
          </Link>
        </div>
        
        <div className="flex space-x-1 sm:space-x-4">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
              className={`px-3 py-1.5 rounded text-sm transition-colors ${
                pathname === item.path 
                  ? 'bg-white/20 font-medium' 
                  : 'hover:bg-white/10'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;