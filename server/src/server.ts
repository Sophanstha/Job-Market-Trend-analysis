import express from "express"
import dotenv from "dotenv"
import mongoose from "mongoose"
import morgan from "morgan"
import cookieParser from "cookie-parser"
import session from "express-session"
import connectDb from "./confog/db.ts"
import authRouter from "./router/authRouter.ts"
import searchRouter from "./router/searchRoute.ts"
import HistoryRouter from "./router/history.ts"
import analysisRouter from "./router/analysis.ts"
import cors from "cors"
dotenv.config()

const app = express();
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true, // if using cookies/auth
  })
);
// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || "default-secret",
  resave: false,
  saveUninitialized: false,
}));

// connect Db
connectDb().then(()=>{
    console.log("database connected succesfully")
}).catch((error)=>{
    console.log("cannot connect to database : "+(error as Error).message)
})

// Basic route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Job Market Trend System API" });
});
// auth route
app.use("/api/auth",authRouter)
app.use("/api/search",searchRouter)
app.use("/api/history",HistoryRouter)
app.use("/api/analysis",analysisRouter)
// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


