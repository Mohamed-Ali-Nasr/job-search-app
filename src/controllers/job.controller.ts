import { NextFunction, Response } from "express";
import { IJob, IRequest } from "../types/index.type";
import CompanyModel from "../models/company.model";
import createHttpError from "http-errors";
import JobModel from "../models/job.model";
import ApplicationModel from "../models/application.model";

export const addJob = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;
  const { userId } = req;
  const { companyId } = req.params;

  try {
    //! Check If Company Exists In Database =>
    const company = await CompanyModel.findById({ _id: companyId });
    if (!company) {
      throw createHttpError(400, "No Company Found By This Id");
    }

    //! Check If Job Title Exists In Database =>
    const existingJobTitle = await JobModel.findOne({ jobTitle });
    if (existingJobTitle) {
      throw createHttpError(
        400,
        "Job Title Already Exists. Please Choose a Different One"
      );
    }

    //! create New Job =>
    const newJob = new JobModel({
      jobTitle,
      jobLocation,
      workingTime,
      seniorityLevel,
      jobDescription,
      technicalSkills,
      softSkills,
      companyInfo: companyId,
      addedBy: userId,
    });

    //! Save New Job To Database =>
    await newJob.save();

    //! Push The Id Of New Job To Jobs Id Array In Company Model =>
    (company?.jobsId as string[]).push(newJob._id as string);
    await company?.save();

    res.status(201).json({
      message: "Job Created Successfully",
      newJob,
    });
  } catch (error) {
    next(error);
  }
};

export const updateJob = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    jobTitle,
    jobLocation,
    workingTime,
    seniorityLevel,
    jobDescription,
    technicalSkills,
    softSkills,
  } = req.body;
  const { companyId, jobId } = req.params;
  const { userId } = req;

  try {
    //! Find Job And Update =>
    const updatedJob = await JobModel.findOneAndUpdate(
      {
        _id: jobId,
        addedBy: userId,
        companyInfo: companyId,
      },
      {
        jobTitle,
        jobLocation,
        workingTime,
        seniorityLevel,
        jobDescription,
        technicalSkills,
        softSkills,
      },
      { new: true }
    );

    //! Check If Job Exists In Database =>
    if (!updatedJob) {
      throw createHttpError(400, "No Jobs Found By This Id");
    }

    //! Save Updated Job To Database =>
    await updatedJob.save();

    res.status(201).json({ message: "Job Updated Successfully", updatedJob });
  } catch (error) {
    next(error);
  }
};

export const deleteJob = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { jobId, companyId } = req.params;
  const { userId } = req;

  try {
    //! Find Job And Delete =>
    const deletedJob = await JobModel.findOneAndDelete({
      _id: jobId,
      addedBy: userId,
      companyInfo: companyId,
    });

    //! Check If Deleted Job Not Exists In Database =>
    if (!deletedJob) {
      throw createHttpError(404, "No Jobs Found By This Id");
    }

    //! Delete This Job From JobsId Array In Company Model =>
    const company = await CompanyModel.findOne({ _id: companyId });
    company!.jobsId = (company?.jobsId as IJob[]).filter(
      (job) => (job._id as string).toString() !== jobId
    );
    await company?.save();

    //! Delete Applications Related To This Job =>
    const applications = await ApplicationModel.find({ jobId });
    applications.forEach(async (application) => {
      await application.deleteOne();
    });

    res.status(201).json({ message: "Job Deleted Successfully", deletedJob });
  } catch (error) {
    next(error);
  }
};

export const getAllJobsWithCompanies = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    //! Find All Jobs With Their Company’s Information =>
    const companies = await CompanyModel.find()
      .select("_id companyName industry address numberOfEmployees companyEmail")
      .populate([
        {
          path: "jobsId",
          model: JobModel,
          select: "_id jobTitle seniorityLevel workingTime",
        },
      ]);

    if (companies.length < 1) {
      throw createHttpError(400, "No Companies Found Yet");
    }

    res.status(200).json(companies);
  } catch (error) {
    next(error);
  }
};

export const getJobsWithOneCompany = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { companyName } = req.query;
  try {
    //! Find All Jobs With Their Company’s Information =>
    const company = await CompanyModel.findOne({
      companyName: { $regex: companyName, $options: "i" },
    })
      .select("_id companyName industry address numberOfEmployees companyEmail")
      .populate([
        {
          path: "jobsId",
          model: JobModel,
          select: "_id jobTitle seniorityLevel workingTime",
        },
      ]);

    if (!company) {
      throw createHttpError(400, "No Company Found By This Name");
    }

    res.status(200).json(company);
  } catch (error) {
    next(error);
  }
};

export const filterJobs = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    workingTime,
    jobLocation,
    seniorityLevel,
    jobTitle,
    technicalSkills,
  } = req.query;

  try {
    //! Build Query Based On The Provided Filters =>
    const query: any = {};
    if (workingTime) query.workingTime = workingTime;
    if (jobLocation) query.jobLocation = jobLocation;
    if (seniorityLevel) query.seniorityLevel = seniorityLevel;
    if (jobTitle) query.jobTitle = new RegExp(jobTitle as string, "i");
    if (technicalSkills)
      query.technicalSkills = { $in: (technicalSkills as string).split(",") };

    const matchedJobs = await JobModel.find(query);

    //! Check If Jobs Exists In Database =>
    if (matchedJobs.length < 1) {
      throw createHttpError(400, "There Is No Jobs Matched With This Query");
    }

    res.status(200).json(matchedJobs);
  } catch (error) {
    next(error);
  }
};

export const applyJob = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userTechSkills, userSoftSkills, userResume } = req.body;
  const { jobId, companyId } = req.params;
  const { userId } = req;

  try {
    //! Find Job By Id In Database =>
    const job = await JobModel.findOne({ _id: jobId, companyInfo: companyId });

    //! Check If Job Exists In Database =>
    if (!job) {
      throw createHttpError(400, "No Job Found By This Id");
    }

    //! Create New Application =>
    const newApplication = new ApplicationModel({
      userTechSkills,
      userSoftSkills,
      userResume,
      userId,
      jobId,
    });

    //! Save New Application To Database =>
    await newApplication.save();

    //! Push The Id Of New Application To Applications Id Array In Jobs Model =>
    (job?.applicationsId as string[]).push(newApplication._id as string);
    await job?.save();

    res.status(201).json({
      message: "Application Created Successfully",
      newApplication,
    });
  } catch (error) {
    next(error);
  }
};
