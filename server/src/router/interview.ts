import express from "express";
import {
  generateQuestions,
  evaluateAnswer,
  getInterviewRoles,
} from "../controller/interviewController.ts";

const interviewrouter = express.Router();

interviewrouter.route("/roles").get(getInterviewRoles);
interviewrouter.route("/generate").post(generateQuestions);
interviewrouter.route("/evaluate").post(evaluateAnswer);

export default interviewrouter;