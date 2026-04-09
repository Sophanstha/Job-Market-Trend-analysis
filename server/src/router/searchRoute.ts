import { Router } from "express";
import { handleValidation, searchRule } from "../middleware/validate.ts";
import protect from "../middleware/AuthMiddleware.ts";
import { compare, search } from "../controller/search.ts";

const searchRouter = Router()
searchRouter.route("/search").post(searchRule,handleValidation,protect,search)
searchRouter.route("/compare").get(compare)
export default searchRouter