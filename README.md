# Kraken Analytics Visualizer

A real-time cryptocurrency trading data visualization application that connects to the Kraken exchange's WebSocket API to display live order book information, trading pair comparisons, and historical data analysis.

- For this project, the Rest API is used to obtain the list of pairs (considering that it does not change very often), and WebSockets are used for the rest.

## Features

- **Real-time Order Book Visualization**: Displays live bid/ask orders showing current market depth
- **Multi-Pair Support**: Allows users to select from multiple trading pairs (e.g., ETH/USDT)
- **Trading Pair Comparison**: Compare metrics between two different trading pairs side by side
- **OHLC Chart Visualization**: Interactive charts with Open, High, Low, and Close data for various time intervals
- **Historical Data Exploration**: Time travel feature to view historical order book snapshots
- **Comprehensive Trading Pair List**: Shows all available trading pairs with search and pagination
- **Trade History Display**: Shows real-time trade execution data
- **Ticker Information**: Displays key metrics like last price, bid/ask, 24h change, volume, etc.

## Tech Stack

- **Framework**: Next.js 16
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **WebSocket**: Real-time connection to Kraken API
- **Charts**: Custom Canvas-based OHLC visualization

## Prerequisites

- Node.js 18 or higher
- npm, yarn, pnpm, or bun

## Installation

1. Clone the repository:

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the root directory and add the Kraken API URLs:
   ```
   NEXT_PUBLIC_KRAKEN_API_PAIRS=https://api.kraken.com/0/public/AssetPairs
   NEXT_PUBLIC_KRAKEN_WS_URL=wss://ws.kraken.com/v2
   ```

## Running the Application

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Dashboard
- The main dashboard displays available trading pairs with search and pagination

### Live Order Book
- Select a trading pair from the list
- View real-time order book data with bids and asks
- See OHLC charts with interval selection
- Access detailed trading pair information in the sidebar

### Trading Pair Comparison
- Select two different trading pairs to compare
- View side-by-side ticker data
- Analyze comparison metrics including price differences, volume differences, and spread analysis


## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.


Created by [Néstor Campos](https://www.linkedin.com/in/nescampos/)