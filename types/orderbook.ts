export interface OrderBookEntry {
  price: number;
  volume: number;
  numberOfOrders?: number;
}

export interface OrderBookData {
  bids: OrderBookEntry[];
  asks: OrderBookEntry[];
  timestamp: number;
}

export interface OrderBookSnapshot {
  bids: [number, number][]; // [price, volume][]
  asks: [number, number][]; // [price, volume][]
  checksum: number;
}

export interface TickerData {
  symbol: string;
  bid: number;
  bid_qty: number;
  ask: number;
  ask_qty: number;
  last: number;
  volume: number;
  vwap: number;
  low: number;
  high: number;
  change: number;
  change_pct: number;
}

export interface WebSocketOrderBookEntry {
  price: number;
  qty: number;
}

export interface WebSocketOrderBookData {
  symbol: string;
  bids: WebSocketOrderBookEntry[];
  asks: WebSocketOrderBookEntry[];
  checksum: number;
}

export interface TradeData {
  symbol: string;
  side: 'buy' | 'sell';
  price: number;
  qty: number;
  ord_type: string;
  trade_id: number;
  timestamp: string;
}

export interface KrakenWebSocketMessage {
  channelID?: number;
  channelName?: string;
  event?: string;
  pair?: string;
  data?: any;
  error?: string;
}

export interface TradeSubscriptionParams {
  method: 'subscribe' | 'unsubscribe';
  params: {
    channel: 'trade';
    symbol: string[];
    snapshot?: boolean;
  };
}