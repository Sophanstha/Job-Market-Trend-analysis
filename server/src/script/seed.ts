import dotenv from "dotenv"
import mongoose from "mongoose";
import JobData from "../models/JobData.model.ts";
// import jobDataJson from "../data/jobData.js" 
// import {jsonData} from "../data/jobData.ts"
import jsonData from "../data/jobData.ts";
dotenv.config()
const seed = async():Promise<void> =>{
    try {
        // db connection
        await mongoose.connect(process.env.MONGO_URI as string)
        console.log("connected to the mongoDb")
        // clear the existing job data
        await JobData.deleteMany({});
        console.log("Cleared existing job data");
        // Inserting the fresh data
       await JobData.insertMany(jsonData)
        console.log(`Seeded ${jsonData.length} job categories`);
        // verify
        const count = await JobData.countDocuments()
        console.log(`Total documents in DB: ${count}`);
        // preview wwhat was insert
    const preview = await JobData.find({}, "category title demandScore trend").lean();
    console.log("\nSeeded categories:");
    preview.forEach((job) => {
      console.log(`   ${job.trend === "rising" ? "↑" : job.trend === "declining" ? "↓" : "→"} ${job.title} — score: ${job.demandScore}`);
    });


    } catch (error) {
            console.error("Seed failed:", (error as Error).message);
    process.exit(1);
    }
}
seed()