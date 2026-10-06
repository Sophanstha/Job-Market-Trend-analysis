import express from "express";
import { generateQuestions } from "../controller/interviewController.ts";

const interviewrouter = express.Router();

interviewrouter.route("/generate").post(generateQuestions);

export default interviewrouter;