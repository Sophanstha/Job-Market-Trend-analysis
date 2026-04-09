import type { Response } from "express";
import type { AuthRequest, IJobData } from "../type/types.ts";
import JobData from "../models/JobData.model.ts";
import rankJobsByQuery from "../algorithms/tfitdf.ts";
import { calculateDemandSccore } from "../algorithms/demandScore.ts.ts";
import { getRecommendations } from "../algorithms/recommend.ts";
import SearchHistory from "../models/SearchHistory.ts";
import mongoose from "mongoose";
import { title } from "node:process";

export const search = async (req: AuthRequest, res: Response) => {
  try {
    const { query } = req.body;
    //  Load all jobs from MongoDB
    const allJobs = await JobData.find({});
    if (!JobData) {
      res
        .status(404)
        .json({ message: "No job data found. Please seed the database." });
      return;
    }
    // Run TF-IDF search
    const tfidfResults = rankJobsByQuery(query, allJobs);
    if (tfidfResults.length === 0) {
      res
        .status(404)
        .json({ message: "No matching results found for your query." });
      return;
    }
    //   take a top resilt
    const topMatch = tfidfResults[0];
    if (!topMatch) {
      res.status(404).json({ message: "No matching results found." });
      return;
    }
    const topResult = topMatch.job;

    // 4 Calculate demand score
    const demandResult = calculateDemandSccore(topResult);

    // 5  Get recommendations
    const recommendation = getRecommendations(topResult, allJobs, 3);

    //6 save to the history data
    const userid = req.user?._id;
    const historyEntry = await SearchHistory.create
    ({
        userId : userid ?? null,
        query,
        resultsCount : tfidfResults.length,
        topResult : topResult.title
    })
    // link to user if login
    if(req.user){
        await req.user.updateOne({
            $push : {searchHistory : historyEntry._id}
        })
    }
    res.status(200).json({
            success: true,
        query,
        result: {
          job: topResult,
          relevanceScore: Math.round((topMatch.score ?? 0) * 100) / 100,
          demand: demandResult,
        },
        otherMatches: tfidfResults.slice(1, 4).map((r) => ({
          title: r.job.title,
          category: r.job.category,
          score: Math.round(r.score * 100) / 100,
        })),
        recommendations: recommendation.map((r) => ({
          title: r.job.title,
          category: r.job.category,
          demandScore: r.job.demandScore,
          similarityScore: r.similarityScore,
          reason: r.reason,
        })),
    })

  } catch (error) {
    res.status(500).json({ message: (error as Error).message });
  }
};

export const compare = async(req:AuthRequest,res:Response):Promise<void>=>{
    try {
        const {a,b} = req.query;
    if (!a || !b) {
      res.status(400).json({ message: "Provide two categories: ?a=ai&b=cloud" });
      return;
    }
   const jobA = await JobData.findOne({category : a as string}) 
    const jobB = await JobData.findOne({ category: b as string });
      if (!jobA || !jobB) {
        res.status(404).json({ message: "One or both categories not found" });
        return;
      }    
    const demandA = calculateDemandSccore(jobA);
      const demandB = calculateDemandSccore(jobB);

     res.status(200).json({
        success : true,
        comparsion :{
            categoryA:{
            title : jobA.title,
            category:      jobA.category,
            demand:        demandA,
            averageSalary: jobA.averageSalary,
            growthRate:    jobA.growthRate,
            trend:         jobA.trend,
            topSkills:     jobA.topSkills,
            }
        },
           categoryB: {
            title:         jobB.title,
            category:      jobB.category,
            demand:        demandB,
            averageSalary: jobB.averageSalary,
            growthRate:    jobB.growthRate,
            trend:         jobB.trend,
            topSkills:     jobB.topSkills,
          },
          winner : demandA.score > demandB.score ? jobA.title : jobB.title ,
          salaryDiff : Math.abs(jobA.averageSalary - jobB.averageSalary),
          growthDiff : Math.abs(jobA.growthRate = jobB.growthRate)
          
     })
    } catch (error) {
         res.status(500).json({ message: (error as Error).message });
    }
}