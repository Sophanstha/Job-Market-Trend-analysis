import mongoose, { Schema } from "mongoose";
import type { ISearchHistory } from "../type/types.ts";

const SearchHistorySchema = new Schema<ISearchHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    query: {
      type: String,
      required: true,
      trim: true,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
    topResult: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

const SearchHistory = mongoose.model<ISearchHistory>('serachHistory',SearchHistorySchema)

export default SearchHistory 