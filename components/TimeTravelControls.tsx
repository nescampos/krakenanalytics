'use client';

import React, { useState } from 'react';

const TimeTravelControls: React.FC = () => {
  const [selectedTime, setSelectedTime] = useState<string>('now');
  const [customTime, setCustomTime] = useState<string>('');
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const timeOptions = [
    { label: 'Live', value: 'now' },
    { label: 'Last 5 minutes', value: '5min' },
    { label: 'Last 15 minutes', value: '15min' },
    { label: 'Last 30 minutes', value: '30min' },
    { label: 'Last 1 hour', value: '1h' },
    { label: 'Last 6 hours', value: '6h' },
    { label: 'Last 24 hours', value: '24h' },
    { label: 'Custom', value: 'custom' },
  ];

  const handleTimeTravel = () => {
    // In a real implementation, this would trigger fetching historical data
    console.log(`Traveling to time: ${selectedTime === 'custom' ? customTime : selectedTime}`);
  };

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
    // In a real implementation, this would control replaying historical data
  };

  const handleStep = (direction: 'forward' | 'backward') => {
    // In a real implementation, this would move forward/backward in time
    console.log(`Stepping ${direction} in time`);
  };

  return (
    <div className="mb-6 p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg">
      <h3 className="text-lg font-semibold mb-3">Time Travel Controls</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2">
          <label htmlFor="time-select" className="block text-sm font-medium mb-1">
            Select Time Period
          </label>
          <select
            id="time-select"
            value={selectedTime}
            onChange={(e) => setSelectedTime(e.target.value)}
            className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
          >
            {timeOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          
          {selectedTime === 'custom' && (
            <div className="mt-2">
              <input
                type="datetime-local"
                value={customTime}
                onChange={(e) => setCustomTime(e.target.value)}
                className="w-full p-2 border border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-700"
              />
            </div>
          )}
        </div>
        
        <div className="flex flex-col space-y-2">
          <button
            onClick={handleTimeTravel}
            className="w-full py-2 px-4 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Load Time
          </button>
          
          <div className="flex space-x-2">
            <button
              onClick={() => handleStep('backward')}
              className="flex-1 py-2 px-3 bg-gray-200 dark:bg-zinc-700 rounded hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
            >
              ← Step
            </button>
            <button
              onClick={handlePlayPause}
              className={`flex-1 py-2 px-3 rounded transition-colors ${
                isPlaying 
                  ? 'bg-yellow-500 hover:bg-yellow-600 text-white' 
                  : 'bg-green-500 hover:bg-green-600 text-white'
              }`}
            >
              {isPlaying ? '⏸ Pause' : '▶ Play'}
            </button>
            <button
              onClick={() => handleStep('forward')}
              className="flex-1 py-2 px-3 bg-gray-200 dark:bg-zinc-700 rounded hover:bg-gray-300 dark:hover:bg-zinc-600 transition-colors"
            >
              Step →
            </button>
          </div>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-700">
        <div className="flex items-center justify-between">
          <span className="text-sm">
            Status: {isPlaying ? 'Playing historical data' : 'Paused at selected time'}
          </span>
          <span className="text-sm">
            Current: {selectedTime === 'custom' ? customTime : selectedTime}
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimeTravelControls;