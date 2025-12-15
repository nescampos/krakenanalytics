// Mock service for historical order book data
// This simulates storing and retrieving historical snapshots for time travel functionality

import { OrderBookData, OrderBookEntry } from '@/types/orderbook';

// Generate mock historical snapshots at different times
const generateHistoricalSnapshots = (pair: string = 'XBT/USD', count: number = 50): OrderBookData[] => {
  const snapshots: OrderBookData[] = [];
  const basePrice = pair.includes('BTC') || pair.includes('XBT') ? 40000 : 2000;
  let currentBasePrice = basePrice;

  for (let i = 0; i < count; i++) {
    // Slightly vary the base price for each snapshot to simulate market movement
    currentBasePrice += (Math.random() - 0.5) * 100;
    
    const bids: OrderBookEntry[] = [];
    const asks: OrderBookEntry[] = [];

    // Generate bids (lower prices)
    for (let j = 0; j < 10; j++) {
      bids.push({
        price: currentBasePrice - (j * 100) + (Math.random() * 20 - 10), // Add slight random variation
        volume: Math.random() * 5 + 1,
        numberOfOrders: Math.floor(Math.random() * 10) + 1
      });
    }

    // Generate asks (higher prices)
    for (let j = 0; j < 10; j++) {
      asks.push({
        price: currentBasePrice + 100 + (j * 100) + (Math.random() * 20 - 10), // Add slight random variation
        volume: Math.random() * 5 + 1,
        numberOfOrders: Math.floor(Math.random() * 10) + 1
      });
    }

    snapshots.push({
      bids,
      asks,
      timestamp: Date.now() - (count - i) * 60000 // Each snapshot is 1 minute apart
    });
  }

  return snapshots;
};

// Service class to manage historical data
class HistoricalDataService {
  private snapshots: Map<string, OrderBookData[]> = new Map();

  constructor() {
    // Pre-populate with mock data for common trading pairs
    const pairs = ['XBT/USD', 'ETH/USD', 'XRP/USD', 'LTC/USD'];
    pairs.forEach(pair => {
      this.snapshots.set(pair, generateHistoricalSnapshots(pair, 100));
    });
  }

  // Get all available timestamps for a trading pair
  getAvailableTimestamps(pair: string): number[] {
    const pairSnapshots = this.snapshots.get(pair);
    return pairSnapshots ? pairSnapshots.map(snapshot => snapshot.timestamp) : [];
  }

  // Get order book data for a specific timestamp
  getOrderBookAtTime(pair: string, timestamp: number): OrderBookData | null {
    const pairSnapshots = this.snapshots.get(pair);
    if (!pairSnapshots) {
      return null;
    }

    // Find the closest snapshot to the requested time
    const closestSnapshot = pairSnapshots.reduce((prev, curr) => {
      return Math.abs(curr.timestamp - timestamp) < Math.abs(prev.timestamp - timestamp) 
        ? curr 
        : prev;
    });

    return closestSnapshot;
  }

  // Get the most recent snapshot
  getLatestSnapshot(pair: string): OrderBookData | null {
    const pairSnapshots = this.snapshots.get(pair);
    if (!pairSnapshots || pairSnapshots.length === 0) {
      return null;
    }
    return pairSnapshots[pairSnapshots.length - 1];
  }

  // Add a new snapshot (simulating receiving live data)
  addSnapshot(pair: string, snapshot: OrderBookData): void {
    if (!this.snapshots.has(pair)) {
      this.snapshots.set(pair, []);
    }
    
    const pairSnapshots = this.snapshots.get(pair)!;
    pairSnapshots.push(snapshot);
    
    // Keep only the most recent 1000 snapshots to prevent memory issues
    if (pairSnapshots.length > 1000) {
      pairSnapshots.shift();
    }
  }

  // Get snapshots in a time range
  getOrderBookInRange(pair: string, startTime: number, endTime: number): OrderBookData[] {
    const pairSnapshots = this.snapshots.get(pair);
    if (!pairSnapshots) {
      return [];
    }

    return pairSnapshots.filter(snapshot => 
      snapshot.timestamp >= startTime && snapshot.timestamp <= endTime
    );
  }
}

// Export a singleton instance
export const historicalDataService = new HistoricalDataService();