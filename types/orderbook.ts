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

export interface KrakenWebSocketMessage {
  channelID?: number;
  channelName?: string;
  event?: string;
  pair?: string;
  data?: any;
  error?: string;
}