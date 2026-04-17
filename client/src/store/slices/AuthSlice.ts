import { createAsyncThunk, createSlice, type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";
import { type AuthResponse, type User } from "../../types";

interface AuthState {
  user:    User | null;
  token:   string | null;
  error:   string | null;
  loading: boolean;
}

const initialState: AuthState = {
  user:    JSON.parse(localStorage.getItem("user") || "null"),
  token:   localStorage.getItem("token"),
  loading: false,
  error:   null,
};

export const login = createAsyncThunk(
  "auth/login",
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post<AuthResponse>("/auth/login", {
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Login failed"
      );
    }
  }
);

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    { name, email, password }: { name: string; email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const { data } = await api.post<AuthResponse>("/auth/register", {
        name,
        email,
        password,
      });
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      return data;
    } catch (error) {
      return rejectWithValue(
        (error as { response?: { data?: { message?: string } } })
          ?.response?.data?.message ?? "Registration failed"
      );
    }
  }
);

const authSlice = createSlice({
  name:         "auth",
  initialState,
  reducers: {
    logout(state) {
      state.user    = null;
      state.token   = null;
      state.error   = null;
      state.loading = false;
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user    = action.payload.user;
        state.token   = action.payload.token;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      })
      .addCase(registerUser.pending, (state) => {
        state.loading = true;
        state.error   = null;
      })
      .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) => {
        state.loading = false;
        state.user    = action.payload.user;
        state.token   = action.payload.token;
      })
      .addCase(registerUser.rejected, (state, action) => {
        state.loading = false;
        state.error   = action.payload as string;
      });
  },
});

export const { clearAuthError, logout } = authSlice.actions;
export default authSlice.reducer;