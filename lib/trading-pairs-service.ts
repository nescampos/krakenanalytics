// Service for fetching trading pairs from Kraken API

export interface TradingPairInfo {
  altname: string;
  wsname: string;
  aclass_base: string;
  base: string;
  aclass_quote: string;
  quote: string;
  lot: string;
  cost_decimals: number;
  pair_decimals: number;
  lot_decimals: number;
  lot_multiplier: number;
  leverage_buy: number[];
  leverage_sell: number[];
  fees: number[][];
  fees_maker: number[][];
  fee_volume_currency: string;
  margin_call: number;
  margin_stop: number;
  ordermin: string;
  costmin: string;
  tick_size: string;
  status: string;
}

export interface TradingPairsResponse {
  error: string[];
  result: Record<string, TradingPairInfo>;
}

/**
 * Fetches all available trading pairs from Kraken API
 * @returns Promise with trading pairs data
 */
export const fetchTradingPairs = async (): Promise<TradingPairInfo[]> => {
  try {
    const response = await fetch(process.env.NEXT_PUBLIC_KRAKEN_API_PAIRS || "https://api.kraken.com/0/public/AssetPairs");
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: TradingPairsResponse = await response.json();
    
    if (data.error && data.error.length > 0) {
      throw new Error(`API error: ${data.error.join(', ')}`);
    }
    
    // Extract the wsname property from each pair and return it
    return Object.values(data.result).filter(pair => pair.status === 'online');
  } catch (error) {
    console.error('Error fetching trading pairs:', error);
    throw error;
  }
};