import { Schema, Document, model } from "mongoose";
import { ICompany } from "../types/index.type";

const CompanySchema = new Schema<ICompany>({
  companyName: { type: String, required: true, unique: true },

  description: { type: String, required: true },

  industry: { type: String, required: true },

  address: { type: String, required: true },

  numberOfEmployees: { type: Number },

  companyEmail: { type: String, required: true, unique: true },

  companyHR: { type: Schema.Types.ObjectId, ref: "User" },

  jobsId: [{ type: Schema.Types.ObjectId, ref: "Job" }],
});

export type ICompanySchema = Document & ICompany;

const CompanyModel = model<ICompanySchema>("Company", CompanySchema);

export default CompanyModel;
