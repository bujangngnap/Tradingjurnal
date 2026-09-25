import type { Trade, TradeUpdate, TradeStatus, DashboardStats } from '../types/trade';
import { AuthService } from './auth';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

function getHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const token = AuthService.getToken();
  const headers: Record<string, string> = {
    'Accept': 'application/json',
    ...extra,
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
}

export class ApiService {
  /**
   * Fetch all trades for the authenticated user
   */
  static async getTrades(status?: string, pair?: string): Promise<Trade[]> {
    const params = new URLSearchParams();
    if (status && status !== 'ALL') params.append('status', status);
    if (pair && pair !== 'ALL') params.append('pair', pair);

    const res = await fetch(`${API_BASE_URL}/trades?${params.toString()}`, {
      headers: getHeaders(),
    });

    if (res.status === 401) {
      AuthService.clearSession();
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const json = await res.json();
    return json.data.map(this.transformTrade);
  }

  /**
   * Create new trade for the authenticated user
   */
  static async createTrade(data: {
    pair: string;
    side: string;
    entry_price: number;
    sl_price: number;
    tp_price: number;
    lot: number;
    timeframe: string;
    session?: string;
    reason: string;
    screenshot_before?: string;
  }): Promise<Trade> {
    const res = await fetch(`${API_BASE_URL}/trades`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });

    if (res.status === 401) {
      AuthService.clearSession();
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const json = await res.json();
    return this.transformTrade(json.data);
  }

  /**
   * Add timeline milestone update to running trade
   */
  static async addUpdate(
    tradeId: string | number,
    data: {
      update_type: string;
      message: string;
      current_price?: number;
      floating_points?: number;
      floating_money?: number;
    }
  ): Promise<TradeUpdate> {
    const res = await fetch(`${API_BASE_URL}/trades/${tradeId}/updates`, {
      method: 'POST',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify(data),
    });

    if (res.status === 401) {
      AuthService.clearSession();
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const json = await res.json();
    return json.data;
  }

  /**
   * Close a trade and compute realized PnL
   */
  static async closeTrade(
    tradeId: string | number,
    exitPrice: number,
    status: TradeStatus,
    notes?: string
  ): Promise<Trade> {
    const res = await fetch(`${API_BASE_URL}/trades/${tradeId}/close`, {
      method: 'PATCH',
      headers: getHeaders({ 'Content-Type': 'application/json' }),
      body: JSON.stringify({
        exit_price: exitPrice,
        status,
        notes,
      }),
    });

    if (res.status === 401) {
      AuthService.clearSession();
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const json = await res.json();
    return this.transformTrade(json.data);
  }

  /**
   * Delete trade from database
   */
  static async deleteTrade(tradeId: string | number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/trades/${tradeId}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });

    if (res.status === 401) {
      AuthService.clearSession();
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
  }

  /**
   * Get overview statistics for the authenticated user
   */
  static async getOverview(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE_URL}/analytics/overview`, {
      headers: getHeaders(),
    });

    if (res.status === 401) {
      AuthService.clearSession();
      throw new Error('UNAUTHORIZED');
    }

    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const json = await res.json();
    return json.data;
  }

  private static transformTrade(item: any): Trade {
    return {
      id: String(item.id),
      pair: item.pair,
      side: item.side,
      entry_price: parseFloat(item.entry_price),
      sl_price: parseFloat(item.sl_price),
      tp_price: parseFloat(item.tp_price),
      exit_price: item.exit_price ? parseFloat(item.exit_price) : undefined,
      lot: parseFloat(item.lot),
      timeframe: item.timeframe,
      session: item.session,
      reason: item.reason || '',
      status: item.status,
      profit_point: parseFloat(item.profit_point || 0),
      profit_money: parseFloat(item.profit_money || 0),
      rr_ratio: parseFloat(item.rr_ratio || 0),
      screenshot_before: item.screenshot_before,
      screenshot_after: item.screenshot_after,
      opened_at: item.opened_at,
      closed_at: item.closed_at,
      updates: (item.updates || []).map((u: any) => ({
        id: String(u.id),
        trade_id: String(u.trade_id),
        update_type: u.update_type,
        message: u.message,
        current_price: u.current_price ? parseFloat(u.current_price) : undefined,
        floating_points: u.floating_points ? parseFloat(u.floating_points) : undefined,
        floating_money: u.floating_money ? parseFloat(u.floating_money) : undefined,
        screenshot_url: u.screenshot_url,
        created_at: u.created_at,
      })),
    };
  }
}
