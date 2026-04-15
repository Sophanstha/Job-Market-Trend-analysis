import type { Request , Response } from "express";
import SearchHistory from "../models/SearchHistory.ts";
import JobData from "../models/JobData.model.ts";
import { calculateDemandSccore } from "../algorithms/demandScore.ts.ts";

const trending = async(req:Request , res:Response)=>{
    try {
        const sevenDayago = new Date()
        sevenDayago.setDate(sevenDayago.getDate() - 7)

 const trending = await SearchHistory.aggregate([
  { $match: { createdAt: { $gte: sevenDayago } } },
  { $group: { _id: "$topResult", count: { $sum: 1 } } }, // ✅ FIX
  { $sort: { count: -1 } },
  { $limit: 5 },
  { $project: { _id: 0, title: "$_id", searchCount: "$count" } }
]);
    console.log("trending : ",trending)

    const totalSearches = await SearchHistory.countDocuments({
        createdAt : {$gte : sevenDayago}
    })
    
    const allJob = await JobData.find({})
    const topDemand = allJob.map((job)=>({
        title : job.title,
        category : job.category,
        demandScore : calculateDemandSccore(job).score,
        trend : job.trend
    })).sort((a,b)=>b.demandScore - a.demandScore).slice(0,5)
    res.json({
        success:true,
         period: "Last 7 days",
         totalSearches,
        trendingSearches: trending,
         topDemandJobs:topDemand 
    })

    } catch (error) {
          res.status(500).json({ message: (error as Error).message });
    }
}
export default  trending