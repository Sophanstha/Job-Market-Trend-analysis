import { asyncThunkCreator, createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import {type PayloadAction } from "@reduxjs/toolkit";
import api from "../../api/axios";
import {type AuthResponse, type User } from "../../types";

// interface User {
//   name: string;
//   email: string;
//   password: string;
// }

interface AuthState {
  User: User | null;
  token: string | null;
  error: string | null;
  loading: boolean;
}

const initialState: AuthState = {
  User: JSON.parse(localStorage.getItem("user") || "null"),
  token: localStorage.getItem("token"),
  loading: false,
  error: null,
};

export const registerUser = createAsyncThunk(
  "auth/register",
  async (
    {
      name,
      email,
      password,
    }: {
      name: string;
      email: string;
      password: string;
    },
    { rejectWithValue },
  ) => {
    try {
        const {data} = await api.post<AuthResponse>("/auth/register",{name , email , password})
        localStorage.setItem("token",data.token)
        localStorage.setItem("user",JSON.stringify(data.user))
        return data
    } catch (error : unknown) {
        return rejectWithValue(
            (
                (error as {response?:{data?:{message : string}}}).response?.data?.message ?? "Registration failed"

            )
        )

    }
  },
);

export const login = createAsyncThunk(
    "/auth/login",
    async(
   { email, password }: { email: string; password: string },
    { rejectWithValue }
    )=>{
        try {
            const {data} = await api.post<AuthResponse>("/auth/login",{email , password})
            localStorage.setItem("token",data.token)
            localStorage.setItem("user",JSON.stringify(data.user))
            return data
        } catch (error) {
            return(
                rejectWithValue(
                    (error as {response? : {data? :{message : string}}})
                )
            )
        }
    }
)

const authSlice = createSlice({
    name : "auth",
    initialState : initialState,
    reducers :{
        logout(state){
            state.User = null,
            state.loading = false,
            state.error = null,
            localStorage.removeItem("token"),
            localStorage.removeItem("user")
        },
    clearAuthError(state) {
      state.error = null;
    },
    },
    extraReducers: (builder) => {
        builder.addCase(login.pending,(state)=>{
            state.loading = true,
            state.error = null
        })
        .addCase(login.fulfilled, (state, action: PayloadAction<AuthResponse>) =>{
            state.loading = false
            state.User = action.payload.user,
            state.token = action.payload.token
        }) 
        .addCase(login.rejected,(state , action)=>{
            state.loading = false,
            state.error = action.payload as string
        })
        .addCase(registerUser.pending , (state)=>{
            state.loading = true,
            state.error = null
        })
           .addCase(registerUser.fulfilled, (state, action: PayloadAction<AuthResponse>) =>{
            state.loading = false
            state.User = action.payload.user,
            state.token = action.payload.token
        }) 
        .addCase(registerUser.rejected,(state , action)=>{
            state.loading = false,
            state.error = action.payload as string
        })
    }
})

export const {clearAuthError , logout} = authSlice.actions
export default  authSlice.reducer  