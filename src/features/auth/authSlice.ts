import {
  createAsyncThunk,
  createSlice,
  type PayloadAction,
} from '@reduxjs/toolkit';

import { loginUser } from '../../api/auth.api';

import type {
  LoginRequest,
  LoginResponse,
  UserResponse,
} from '../../types/auth.types';

interface AuthState {
  user: UserResponse | null;
  accessToken: string | null;
  tokenType: string | null;
  expiresIn: number | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}
const getStoredUser = (): UserResponse | null => {
  const value = localStorage.getItem('user');

  if (!value) {
    return null;
  }

  try {
    return JSON.parse(value) as UserResponse;
  } catch {
    localStorage.removeItem('user');
    return null;
  }
};

const storedToken = localStorage.getItem('accessToken');
const storedTokenType = localStorage.getItem('tokenType');
const storedExpiresIn = localStorage.getItem('expiresIn');

const initialState: AuthState = {
  user: getStoredUser(),
  accessToken: storedToken,
  tokenType: storedTokenType,
  expiresIn: storedExpiresIn
    ? Number(storedExpiresIn)
    : null,
  isAuthenticated: !!storedToken,
  loading: false,
  error: null,
};

export const login = createAsyncThunk<
  LoginResponse,
  LoginRequest,
  { rejectValue: string }
>(
  'auth/login',
  async (request, { rejectWithValue }) => {
    try {
      return await loginUser(request);
    } catch (error: unknown) {
      const err = error as { response?: { data?: { message?: string } } };
      return rejectWithValue(
        err.response?.data?.message ??
        'Login failed. Please try again.'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<LoginResponse>
    ) => {
      const data = action.payload;

      state.user = data.user;
      state.accessToken = data.accessToken;
      state.tokenType = data.tokenType;
      state.expiresIn = data.expiresIn;
      state.isAuthenticated = true;
      state.error = null;

      localStorage.setItem(
        'accessToken',
        data.accessToken
      );

      localStorage.setItem(
        'tokenType',
        data.tokenType
      );

      localStorage.setItem(
        'expiresIn',
        String(data.expiresIn)
      );

      localStorage.setItem(
        'user',
        JSON.stringify(data.user)
      );
    },

    logout: (state) => {
      state.user = null;
      state.accessToken = null;
      state.tokenType = null;
      state.expiresIn = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;

      localStorage.removeItem('accessToken');
      localStorage.removeItem('tokenType');
      localStorage.removeItem('expiresIn');
      localStorage.removeItem('user');
    },

    clearAuthError: (state) => {
      state.error = null;
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(login.fulfilled, (state, action) => {
        const data = action.payload;

        state.loading = false;
        state.user = data.user;
        state.accessToken = data.accessToken;
        state.tokenType = data.tokenType;
        state.expiresIn = data.expiresIn;
        state.isAuthenticated = true;

        localStorage.setItem(
          'accessToken',
          data.accessToken
        );

        localStorage.setItem(
          'tokenType',
          data.tokenType
        );

        localStorage.setItem(
          'expiresIn',
          String(data.expiresIn)
        );

        localStorage.setItem(
          'user',
          JSON.stringify(data.user)
        );
      })

      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.payload ??
          'Invalid email or password.';
      });
  },
});

export const {
  setCredentials,
  logout,
  clearAuthError,
} = authSlice.actions;

export default authSlice.reducer;