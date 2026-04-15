import { createSlice, type PayloadAction, } from "@reduxjs/toolkit";

interface CompareState {
  queryA: string;
  queryB: string;
}

const initialState: CompareState = {
  queryA: "",
  queryB: "",
};

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    setQueryA(state, action: PayloadAction<string>) {
      state.queryA = action.payload;
    },
    setQueryB(state, action: PayloadAction<string>) {
      state.queryB = action.payload;
    },
    clearCompare(state) {
      state.queryA = "";
      state.queryB = "";
    },
  },
});

export const { setQueryA, setQueryB, clearCompare } = compareSlice.actions;
export default compareSlice.reducer;