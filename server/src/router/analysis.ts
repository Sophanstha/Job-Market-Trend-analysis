import { Router } from "express";
import trending from "../controller/analytics.ts";

const analysisRouter = Router()
analysisRouter.route("/trending").get(trending)
export default analysisRouter