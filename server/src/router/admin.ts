import express from "express";
import protect, { requireAdmin } from "../middleware/AuthMiddleware.ts";
import { getAdminStats, getAllSearches, getAllUsers, getTopCategoriesAllTime } from "../controller/adminController.ts";


const Adminrouter = express.Router();

Adminrouter.use(protect, requireAdmin);

Adminrouter.route("/stats").get(getAdminStats);
Adminrouter.route("/users").get(getAllUsers );
Adminrouter.route("/searches").get(getAllSearches);
Adminrouter.route("/top-categories").get(getTopCategoriesAllTime);

export default Adminrouter;