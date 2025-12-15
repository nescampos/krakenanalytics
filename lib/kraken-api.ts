// Mock API utility for Kraken WebSocket connection
// In a real implementation, this would connect to Kraken's actual WebSocket API

export const krakenWebSocketUrl = process.env.NEXT_PUBLIC_KRAKEN_WS_URL || 'wss://ws.kraken.com/v2';

export interface SubscribeParams {
  event: 'subscribe' | 'unsubscribe';
  pair: string[];
  subscription: {
    name: 'book';
    depth?: number;
  };
}

/**
 * Creates a WebSocket connection to Kraken API
 * @param params Subscription parameters
 * @returns WebSocket connection
 */
export const createKrakenWebSocket = (params: SubscribeParams): WebSocket => {
  const ws = new WebSocket(krakenWebSocketUrl);
  
  // In a real implementation, we would send the subscription params
  // ws.onopen = () => ws.send(JSON.stringify(params));
  
  return ws;
};

/**
 * Generates a mock order book snapshot for demonstration
 * @param pair Trading pair
 * @returns Mock order book data
 */
export const generateMockOrderBook = (pair: string = 'XBT/USD'): any => {
  const bids = [];
  const asks = [];
  const basePrice = pair.includes('BTC') || pair.includes('XBT') ? 40000 : 2000;
  
  // Generate mock bids (lower prices)
  for (let i = 0; i < 10; i++) {
    bids.push([
      basePrice - (i * 100),
      Math.random() * 5 + 1 // Random volume between 1-6
    ]);
  }
  
  // Generate mock asks (higher prices)
  for (let i = 0; i < 10; i++) {
    asks.push([
      basePrice + 100 + (i * 100),
      Math.random() * 5 + 1 // Random volume between 1-6
    ]);
  }
  
  return {
    bids,
    asks,
    timestamp: Date.now(),
    pair
  };
};