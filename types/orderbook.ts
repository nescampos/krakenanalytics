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

export interface KrakenWebSocketMessage {
  channelID?: number;
  channelName?: string;
  event?: string;
  pair?: string;
  data?: any;
  error?: string;
}