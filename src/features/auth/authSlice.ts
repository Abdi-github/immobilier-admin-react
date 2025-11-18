import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { storage } from '@/shared/utils/storage';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone?: string;
  user_type: string;
  preferred_language: string;
  status: string;
  email_verified: boolean;
  roles?: string[];
  permissions?: string[];
  agency_id?: string;
  created_at: string;
}

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Restore user from storage on initial load
const storedUser = storage.getUser<User>();

const initialState: AuthState = {
  user: storedUser,
  accessToken: storage.getToken(),
  refreshToken: storage.getRefreshToken(),
  isAuthenticated: !!storage.getToken(),
  isLoading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{
        user?: User;
        accessToken: string;
        refreshToken: string;
      }>
    ) => {
      const { user, accessToken, refreshToken } = action.payload;
      
      if (user) {
        state.user = user;
        // Persist user to storage
        storage.setUser(user);
      }
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.isLoading = false;

      // Persist tokens
      storage.setToken(accessToken);
      storage.setRefreshToken(refreshToken);
    },
    setUser: (state, action: PayloadAction<User>) => {
      state.user = action.payload;
      // Persist user to storage
      storage.setUser(action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.refreshToken = null;
      state.isAuthenticated = false;
      state.isLoading = false;

      // Clear storage
      storage.clearAuth();
    },
  },
});

export const { setCredentials, setUser, setLoading, logout } = authSlice.actions;
export const authReducer = authSlice.reducer;
