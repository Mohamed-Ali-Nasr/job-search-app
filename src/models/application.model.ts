import { Schema, Document, model } from "mongoose";
import { IApplication } from "../types/index.type";

const ApplicationSchema = new Schema<IApplication>(
  {
    jobId: { type: Schema.Types.ObjectId, ref: "Job" },

    userId: { type: Schema.Types.ObjectId, ref: "User" },

    userTechSkills: [{ type: String, required: true }],

    userSoftSkills: [{ type: String, required: true }],

    userResume: { type: String, required: true },
  },
  { timestamps: true }
);

export type IApplicationSchema = Document & IApplication;

const ApplicationModel = model<IApplicationSchema>(
  "Application",
  ApplicationSchema
);

export default ApplicationModel;
