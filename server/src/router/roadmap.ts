import express from "express";
import { generateRoadmap } from "../controller/roadmapController.ts";

const roadmapRouter = express.Router();

roadmapRouter.route("/generate").post(generateRoadmap);

export default roadmapRouter;
