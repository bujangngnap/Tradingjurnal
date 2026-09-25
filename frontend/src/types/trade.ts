export type TradeSide = 'BUY' | 'SELL';

export type TradeStatus = 'OPEN' | 'CLOSED_TP' | 'CLOSED_SL' | 'CLOSED_BE' | 'CLOSED_MANUAL';

export type UpdateType = 'ENTRY' | 'PROGRESS' | 'SL_TO_BE' | 'PARTIAL_TP' | 'EXIT' | 'NOTE';

export interface TradeUpdate {
  id: string;
  trade_id: string;
  update_type: UpdateType;
  message: string;
  current_price?: number;
  floating_points?: number;
  floating_money?: number;
  screenshot_url?: string;
  created_at: string;
}

export interface Trade {
  id: string;
  pair: string;
  side: TradeSide;
  entry_price: number;
  sl_price: number;
  tp_price: number;
  exit_price?: number;
  lot: number;
  timeframe: string;
  session?: 'Asian' | 'London' | 'New York';
  reason: string;
  status: TradeStatus;
  profit_point: number;
  profit_money: number;
  rr_ratio: number;
  screenshot_before?: string;
  screenshot_after?: string;
  opened_at: string;
  closed_at?: string;
  updates: TradeUpdate[];
}

export interface DashboardStats {
  totalTrades: number;
  winRate: number;
  winCount: number;
  lossCount: number;
  netProfitMoney: number;
  netProfitPoints: number;
  avgRR: number;
  profitToday: number;
  bestPair: string;
  bestTimeframe: string;
  bestSession: string;
}

export interface CalendarDaySummary {
  date: string; // YYYY-MM-DD
  tradesCount: number;
  netProfit: number;
  isWin: boolean;
  trades: Trade[];
}
