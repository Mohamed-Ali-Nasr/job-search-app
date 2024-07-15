import { Request } from "express";
import { Document, ObjectId } from "mongoose";
import { Attachment } from "nodemailer/lib/mailer";
import { IUserSchema } from "../models/user.model";

export interface IRequest extends Request {
  userId?: string;
  authUser?: IUserSchema;
}

export type SendEmailServiceParams = {
  to: string;
  subject: string;
  textMessage: string;
  htmlMessage: string;
  attachments?: Attachment[];
};

export interface IUser extends Document {
  _id: string;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  isConfirmed: boolean;
  otp: string;
  otpExpires: Date;
  recoveryEmail: string;
  DOB: string;
  mobileNumber: string;
  role: "User" | "Company_HR";
  status: "online" | "offline";
}

export interface IUserToken extends Document {
  _id: string;
  userId: ObjectId;
  token: string;
}

export interface ICompany extends Document {
  _id: string;
  companyName: string;
  description: string;
  industry: string;
  address: string;
  numberOfEmployees: number;
  companyEmail: string;
  companyHR: ObjectId | IUser;
  jobsId: string[] | IJob[];
}

export interface IJob extends Document {
  _id: string;
  jobTitle: string;
  jobLocation: "onsite" | "remotely" | "hybrid";
  workingTime: "part-time" | "full-time";
  seniorityLevel: "Junior" | "Mid-Level" | "Senior" | "Team-Lead" | "CTO";
  jobDescription: string;
  technicalSkills: string[];
  softSkills: string[];
  addedBy: ObjectId | IUser;
  companyInfo: ObjectId | ICompany;
  applicationsId: string[] | IApplication[];
}

export interface IApplication extends Document {
  _id: string;
  jobId: ObjectId | IJob;
  userId: ObjectId | IUser;
  userTechSkills: string[];
  userSoftSkills: string[];
  userResume: string;
  createdAt: Date;
}
