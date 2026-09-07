import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import User from "../models/User..model.ts";
import SearchHistory from "../models/SearchHistory.ts";
if (!mongoose.models["User"]) {
  mongoose.model("User", User.schema);
}

async function run() {
  await mongoose.connect(process.env.MONGO_URI as string);
  console.log("Connected to Mongo");

  console.log("Testing 1: Stats");
  try {
    const totalUsers = await User.countDocuments();
    const totalSearches = await SearchHistory.countDocuments();
    console.log("Stats ok:", { totalUsers, totalSearches });
  } catch (e) {
    console.error("Stats error:", e);
  }

  console.log("Testing 2: Users");
  try {
    const users = await User.find({})
      .select("name email role createdAt searchHistory")
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();
    console.log("Users ok, count:", users.length);
  } catch (e) {
    console.error("Users error:", e);
  }

  console.log("Testing 3: Searches (with populate)");
  try {
    const searches = await SearchHistory.find({})
      .populate("userId", "name email")
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();
    console.log("Searches ok, count:", searches.length);
  } catch (e) {
    console.error("Searches error:", e);
  }

  console.log("Testing 4: Top Categories");
  try {
    const results = await SearchHistory.aggregate([
      { $group: { _id: "$topResult", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);
    console.log("Top categories ok, count:", results.length);
  } catch (e) {
    console.error("Top categories error:", e);
  }

  await mongoose.disconnect();
}

run();
