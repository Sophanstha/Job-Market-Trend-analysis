import { Router } from "express";
import protect from "../middleware/AuthMiddleware.ts";
import { deleteHistory, getSearchHistory } from "../controller/history.ts";

const HistoryRouter= Router()
HistoryRouter.route("/history").get(protect, getSearchHistory)
HistoryRouter.route("/delete/:id").delete(protect,deleteHistory)
export default HistoryRouter