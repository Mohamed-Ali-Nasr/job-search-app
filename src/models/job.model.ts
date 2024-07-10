import { Schema, Document, model } from "mongoose";
import { IJob } from "../types/index.type";

const JobSchema = new Schema<IJob>({
  jobTitle: { type: String, required: true, unique: true },

  jobLocation: {
    type: String,
    required: true,
    enum: ["onsite", "remotely", "hybrid"],
  },

  workingTime: {
    type: String,
    required: true,
    enum: ["part-time", "full-time"],
  },

  seniorityLevel: {
    type: String,
    required: true,
    enum: ["Junior", "Mid-Level", "Senior", "Team-Lead", "CTO"],
  },

  jobDescription: { type: String },

  technicalSkills: [{ type: String, required: true }],

  softSkills: [{ type: String, required: true }],

  addedBy: { type: Schema.Types.ObjectId, ref: "User" },

  companyInfo: { type: Schema.Types.ObjectId, ref: "Company" },

  applicationsId: [{ type: Schema.Types.ObjectId, ref: "Job" }],
});

export type IJobSchema = Document & IJob;

const JobModel = model<IJobSchema>("Job", JobSchema);

export default JobModel;
