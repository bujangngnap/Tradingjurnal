import type { User, AuthResponse } from '../types/auth';

const TOKEN_KEY = 'trading_journal_token';
const USER_KEY = 'trading_journal_user';

const API_BASE_URL = (import.meta as any).env?.VITE_API_BASE_URL || '/api/v1';

export class AuthService {
  /**
   * Retrieve JWT token from localStorage
   */
  static getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem(TOKEN_KEY);
  }

  /**
   * Retrieve stored user object from localStorage
   */
  static getUser(): User | null {
    if (typeof window === 'undefined') return null;
    const raw = localStorage.getItem(USER_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /**
   * Save session token and user info
   */
  static setSession(token: string, user: User): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  /**
   * Remove session token and user info
   */
  static clearSession(): void {
    if (typeof window === 'undefined') return;
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }

  /**
   * Check if user currently has a valid session token
   */
  static isAuthenticated(): boolean {
    return Boolean(this.getToken());
  }

  /**
   * Register a new user account
   */
  static async register(name: string, email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ name, email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Registrasi gagal (Status ${res.status})`);
    }

    if (data.token && data.user) {
      this.setSession(data.token, data.user);
    }

    return data;
  }

  /**
   * Login with email and password
   */
  static async login(email: string, password: string): Promise<AuthResponse> {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || `Login gagal (Status ${res.status})`);
    }

    if (data.token && data.user) {
      this.setSession(data.token, data.user);
    }

    return data;
  }

  /**
   * Verify session & fetch fresh user data
   */
  static async fetchCurrentUser(): Promise<User | null> {
    const token = this.getToken();
    if (!token) return null;

    try {
      const res = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!res.ok) {
        if (res.status === 401) {
          this.clearSession();
        }
        return null;
      }

      const data = await res.json();
      if (data.user) {
        localStorage.setItem(USER_KEY, JSON.stringify(data.user));
        return data.user;
      }
      return null;
    } catch {
      return this.getUser();
    }
  }

  /**
   * Log out user
   */
  static logout(): void {
    this.clearSession();
  }
}
