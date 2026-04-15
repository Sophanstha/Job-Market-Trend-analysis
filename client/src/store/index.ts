import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./slices/AuthSlice"
import searchReducer from "./slices/SearchSlice"
import compareReducer from "./slices/CompareSlice"

export const store =configureStore({
    reducer : {
        auth : authReducer,
        search : searchReducer,
        compare : compareReducer
    }
})

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch