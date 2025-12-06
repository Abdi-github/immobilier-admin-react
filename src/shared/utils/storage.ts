const TOKEN_KEY = 'immobilier_access_token';
const REFRESH_TOKEN_KEY = 'immobilier_refresh_token';
const USER_KEY = 'immobilier_user';

export const storage = {
  getToken: (): string | null => {
    const val = localStorage.getItem(TOKEN_KEY);
    return val;
  },

  setToken: (token: string): void => {
    try {
      localStorage.setItem(TOKEN_KEY, token);
    } catch (e) {
    }
  },

  removeToken: (): void => {
    localStorage.removeItem(TOKEN_KEY);
  },

  getRefreshToken: (): string | null => {
    const rt = localStorage.getItem(REFRESH_TOKEN_KEY);
    return rt;
  },

  setRefreshToken: (token: string): void => {
    try {
      localStorage.setItem(REFRESH_TOKEN_KEY, token);
    } catch (e) {
    }
  },

  removeRefreshToken: (): void => {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  },

  getUser: <T>(): T | null => {
    const value = localStorage.getItem(USER_KEY);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  setUser: (user: unknown): void => {
    try {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
    } catch (err) {
    }
  },

  removeUser: (): void => {
    localStorage.removeItem(USER_KEY);
  },

  clearAuth: (): void => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  },

  get: <T>(key: string): T | null => {
    const value = localStorage.getItem(key);
    if (!value) return null;
    try {
      return JSON.parse(value) as T;
    } catch {
      return null;
    }
  },

  set: (key: string, value: unknown): void => {
    localStorage.setItem(key, JSON.stringify(value));
  },

  remove: (key: string): void => {
    localStorage.removeItem(key);
  },
};
