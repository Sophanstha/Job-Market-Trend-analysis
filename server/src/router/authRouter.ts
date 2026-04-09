import { Router } from "express";
import { handleValidation, loginRule, registerRule } from "../middleware/validate.ts";
import { getProfile, login, register } from "../controller/auth.ts";
import protect from "../middleware/AuthMiddleware.ts";

const authRouter = Router()
authRouter.route("/register").post(registerRule,handleValidation, register)
authRouter.route("/login").post(loginRule,handleValidation, login)
authRouter.route("/profile").get(protect,getProfile)

export default authRouter