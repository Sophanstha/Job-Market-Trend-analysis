import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { SearchResponse } from "../../types";

interface SearchState {
  data: SearchResponse | null;
  query: string;
  recentQueries: string[];
}
const initialState: SearchState = {
  data: null,
  query: "",
  // recentQueries : JSON.parse("recentQueries") || "[]"
  recentQueries: JSON.parse(localStorage.getItem("recentQueries") || "[]"),
};
const searchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    searchQuery: (state, action: PayloadAction<string>) => {
      state.query = action.payload;
    },
    // setSearchResult(state, action: PayloadAction<SearchResponse>) {
    //   state.data = action.payload;
    //   const updated = [
    //     state.query,
    //     ...state.recentQueries.filter((q) => q !== state.query),
    //   ].slice(0, 5);
    //   ((state.recentQueries = updated),
    //     localStorage.setItem("recentQueries", JSON.stringify(updated)));
    // },
    setSearchResult(state, action: PayloadAction<SearchResponse>) {
      state.data = action.payload;

      const updated = [
        state.query,
        ...state.recentQueries.filter((q) => q !== state.query),
      ].slice(0, 5);

      state.recentQueries = updated;
      localStorage.setItem("recentQueries", JSON.stringify(updated));
    },
    
    clearSearch(state) {
      state.data = null;
      state.query = "";
    },
  },
});

export const { clearSearch, searchQuery, setSearchResult } =
  searchSlice.actions;
export default searchSlice.reducer;
