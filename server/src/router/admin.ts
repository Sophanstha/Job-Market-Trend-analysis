import express from "express";
import protect, { requireAdmin } from "../middleware/AuthMiddleware.ts";
import { createUser, deleteUser, getAdminStats, getAllSearches, getAllUsers, getSearchTrend, getTopCategoriesAllTime, updateUser } from "../controller/adminController.ts";


const Adminrouter = express.Router();

Adminrouter.use(protect, requireAdmin);

Adminrouter.route("/stats").get(getAdminStats);
Adminrouter.route("/users").get(getAllUsers );
Adminrouter.route("/searches").get(getAllSearches);
Adminrouter.route("/top-categories").get(getTopCategoriesAllTime);
Adminrouter.route("/search-trend").get(getSearchTrend);

Adminrouter.route("/users")
  .get(getAllUsers)
  .post(createUser);

Adminrouter.route("/users/:id")
  .patch(updateUser)
  .delete(deleteUser);
export default Adminrouter;