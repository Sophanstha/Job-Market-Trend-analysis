import { Schema } from "mongoose";
import mongoose from "mongoose";
import type { IJobData } from "../type/types.ts";

const JobDataSchema = new Schema<IJobData>(
  {
    category: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    title: { type: String, required: true },
    demandScore: { type: Number, required: true, min: 0, max: 100 },
    growthRate: { type: Number, required: true },
    averageSalary: { type: Number, required: true },
    jobOpenings: { type: Number, required: true },
      trend: {
      type: String,
      enum: ["rising", "declining", "stable"],
      required: true,
    },
    topSkills: [{ type: String }],
    topRoles: [{ type: String }],
    industries: [{ type: String }],
    education: { type: String },
    remoteAvailability: { type: Number, min: 0, max: 100 },
    entryLevelSalary: { type: Number },
    seniorLevelSalary: { type: Number },
    summary: { type: String, required: true },
    keywords: [{ type: String }],
    historicalDemand: [{ type: Number }],
    years: [{ type: Number }],
},{
    timestamps : true
})

const JobData = mongoose.model("jobData",JobDataSchema)
export default JobData