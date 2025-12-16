'use client';

import React, { useEffect, useRef } from 'react';
import { OHLCData } from '@/lib/websocket-manager';

interface OHLCChartProps {
  data: OHLCData[];
  width?: number;
  height?: number;
  title?: string;
}

// Utility function to format date for display
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const OHLCChart: React.FC<OHLCChartProps> = ({ 
  data, 
  width = 800, 
  height = 400, 
  title = 'OHLC Chart' 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!data || data.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = width;
    canvas.height = height;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Set background
    ctx.fillStyle = '#f9fafb'; // light gray background
    ctx.fillRect(0, 0, width, height);

    // Set text color based on theme
    ctx.fillStyle = '#1f2937'; // dark gray text

    // Draw chart title
    ctx.font = 'bold 16px sans-serif';
    ctx.fillText(title, 10, 25);

    if (data.length < 2) return;

    // Calculate min and max values for scaling
    let minPrice = Math.min(...data.map(d => Math.min(d.low, d.open, d.close)));
    let maxPrice = Math.max(...data.map(d => Math.max(d.high, d.open, d.close)));

    // Add a small margin to the price range
    const priceRange = maxPrice - minPrice;
    minPrice -= priceRange * 0.02;
    maxPrice += priceRange * 0.02;

    // Calculate x and y scale factors
    const xScale = (width - 60) / (data.length - 1); // Leave space for labels
    const yScale = (height - 80) / (maxPrice - minPrice); // Leave space for labels and title

    // Draw axes
    ctx.strokeStyle = '#9ca3af'; // gray
    ctx.lineWidth = 1;

    // Y-axis
    ctx.beginPath();
    ctx.moveTo(50, 40);
    ctx.lineTo(50, height - 40);
    ctx.stroke();

    // X-axis
    ctx.beginPath();
    ctx.moveTo(50, height - 40);
    ctx.lineTo(width - 10, height - 40);
    ctx.stroke();

    // Draw grid lines and labels
    ctx.strokeStyle = '#e5e7eb'; // light gray
    ctx.lineWidth = 0.5;

    // Draw horizontal grid lines and price labels
    const priceSteps = 5;
    for (let i = 0; i <= priceSteps; i++) {
      const price = minPrice + (maxPrice - minPrice) * (i / priceSteps);
      const y = height - 40 - (price - minPrice) * yScale;

      // Draw grid line
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(width - 10, y);
      ctx.stroke();

      // Draw price label
      ctx.fillStyle = '#6b7280'; // medium gray
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'right';
      ctx.fillText(price.toFixed(2), 45, y + 4);
    }

    // Draw time labels
    const timeSteps = Math.min(data.length, 5);
    for (let i = 0; i < timeSteps; i++) {
      const index = Math.floor((data.length - 1) * (i / Math.max(1, timeSteps - 1)));
      const timeLabel = formatDate(data[index].timestamp);
      const x = 50 + index * xScale;

      ctx.fillStyle = '#6b7280'; // medium gray
      ctx.font = '12px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(timeLabel, x, height - 15);
    }

    // Draw OHLC bars
    for (let i = 0; i < data.length; i++) {
      const d = data[i];
      const x = 50 + i * xScale;

      // Determine the y positions based on price values
      const openY = height - 40 - (d.open - minPrice) * yScale;
      const closeY = height - 40 - (d.close - minPrice) * yScale;
      const highY = height - 40 - (d.high - minPrice) * yScale;
      const lowY = height - 40 - (d.low - minPrice) * yScale;

      // Determine color based on open and close prices
      const isGreen = d.close >= d.open;
      ctx.strokeStyle = isGreen ? '#10b981' : '#ef4444'; // green for up, red for down
      ctx.fillStyle = isGreen ? '#10b981' : '#ef4444';
      ctx.lineWidth = 1;

      // Draw high-low line (wicks)
      ctx.beginPath();
      ctx.moveTo(x, highY);
      ctx.lineTo(x, lowY);
      ctx.stroke();

      // Draw open-close bar (body)
      const barWidth = Math.max(xScale * 0.8, 3); // Ensure minimum width
      const bodyHeight = Math.abs(closeY - openY);
      const bodyTop = Math.min(openY, closeY);

      // Draw filled rectangle for body
      ctx.fillRect(x - barWidth / 2, bodyTop, barWidth, bodyHeight);

      // Add border to the rectangle
      ctx.strokeRect(x - barWidth / 2, bodyTop, barWidth, bodyHeight);
    }
  }, [data, width, height, title]);

  return (
    <div className="border rounded-lg p-4 bg-white dark:bg-zinc-800">
      <canvas 
        ref={canvasRef} 
        className="w-full border rounded"
      />
      <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 text-center">
        {title} - {data.length} data points
      </p>
    </div>
  );
};

export default OHLCChart;