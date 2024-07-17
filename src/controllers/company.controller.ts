import { NextFunction, Response } from "express";
import CompanyModel from "../models/company.model";
import createHttpError from "http-errors";
import { IApplication, IRequest } from "../types/index.type";
import JobModel from "../models/job.model";
import ApplicationModel from "../models/application.model";
import XLSX from "xlsx";

export const addCompany = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
  } = req.body;
  const { userId } = req;

  try {
    //! Check If Company Name Or Email Exists In Database =>
    const existingCompany = await CompanyModel.findOne({
      $or: [{ companyName }, { companyEmail }],
    });
    if (existingCompany) {
      throw createHttpError(
        400,
        "Company Already Exists. Please Choose a Different Name Or Email"
      );
    }

    //! create New Company =>
    const newCompany = new CompanyModel({
      companyName,
      description,
      industry,
      address,
      numberOfEmployees,
      companyEmail,
      companyHR: userId,
    });

    //! Save New Company To Database =>
    await newCompany.save();

    res.status(201).json({
      message: "Company Created Successfully",
      newCompany,
    });
  } catch (error) {
    next(error);
  }
};

export const updateCompany = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const {
    companyName,
    description,
    industry,
    address,
    numberOfEmployees,
    companyEmail,
  } = req.body;
  const { userId } = req;
  const { companyId } = req.params;

  try {
    //! Find Company And Update =>
    const updatedCompany = await CompanyModel.findOneAndUpdate(
      { _id: companyId, companyHR: userId },
      {
        companyName,
        description,
        industry,
        address,
        numberOfEmployees,
        companyEmail,
      },
      { new: true }
    );

    //! Check If Updated Company Not Exists In Database =>
    if (!updatedCompany) {
      throw createHttpError(404, "No Company Found By This Id");
    }

    //! Save Updated Company To Database =>
    await updatedCompany.save();

    res
      .status(201)
      .json({ message: "Company Updated Successfully", updatedCompany });
  } catch (error) {
    next(error);
  }
};

export const deleteCompany = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { companyId } = req.params;

  try {
    //! Find Company And Delete =>
    const deletedCompany = await CompanyModel.findOneAndDelete({
      _id: companyId,
      companyHR: userId,
    });

    //! Check If Deleted Company Not Exists In Database =>
    if (!deletedCompany) {
      throw createHttpError(404, "No Company Found By This Id");
    }

    //! Delete Jobs Added By This User =>
    const companyJobs = await JobModel.find({ companyInfo: companyId });

    companyJobs?.forEach(async (job) => {
      await ApplicationModel.find({ jobId: job._id }).deleteMany();
    });

    await JobModel.find({ companyInfo: companyId }).deleteMany();

    res
      .status(201)
      .json({ message: "Company Deleted Successfully", deletedCompany });
  } catch (error) {
    next(error);
  }
};

export const getCompanyJobs = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { companyId } = req.params;

  try {
    //! Find Company With It's Jobs In Database =>
    const company = await CompanyModel.findById({ _id: companyId })
      .select("_id companyName industry address numberOfEmployees companyEmail")
      .populate({
        path: "jobsId",
        model: JobModel,
        select: "_id jobTitle seniorityLevel workingTime",
      });

    //! Check If Company Exists In Database =>
    if (!company) {
      throw createHttpError(400, "There Is No Companies With This Id");
    }

    //! Check If There Is Jobs With This Company =>
    if (company.jobsId.length < 1) {
      throw createHttpError(400, "There Is No Jobs By This Company Yet");
    }

    res.status(200).json(company);
  } catch (error) {
    next(error);
  }
};

export const searchCompanyByName = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { companyName } = req.query;
  try {
    //! Find Companies By Name In Database =>
    const companies = await CompanyModel.find({
      companyName: { $regex: companyName, $options: "i" },
    }).select(
      "_id companyName industry address numberOfEmployees companyEmail"
    );

    //! Check If These Companies Exist In Database =>
    if (companies.length < 1) {
      throw createHttpError(400, "There Is No Companies With This Name");
    }

    res.status(200).json(companies);
  } catch (error) {
    next(error);
  }
};

export const getApplicationsJobs = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  try {
    //! Find Applications for specific Jobs For Company Owner =>
    const applicationsJobs = await JobModel.find({ addedBy: userId })
      .select("_id jobTitle seniorityLevel workingTime")
      .populate({
        path: "applicationsId",
        model: ApplicationModel,
        select: "_id userTechSkills userSoftSkills userResume",
      });

    //! Check If These Applications Exist In Database =>
    if (applicationsJobs.length < 1) {
      throw createHttpError(400, "There Is No Companies Found");
    }

    res.status(200).json(applicationsJobs);
  } catch (error) {
    next(error);
  }
};

export const companyApplications = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { companyName } = req.query;
  try {
    //! Find All Jobs With Their Application Company’s Information =>
    const company = await CompanyModel.findOne({
      companyName: { $regex: companyName, $options: "i" },
    })
      .select("_id companyName industry address companyEmail")
      .populate([
        {
          path: "jobsId",
          model: JobModel,
          select: "_id jobTitle seniorityLevel workingTime",
          populate: {
            path: "applicationsId",
            model: ApplicationModel,
            select: "_id userTechSkills userSoftSkills userResume createdAt",
          },
        },
      ]);

    if (!company) {
      throw createHttpError(400, "No Company Found By This Name");
    }

    let application: any[] = [];

    company.jobsId.forEach((job: any) => {
      job.applicationsId.map((app: IApplication) => {
        application.push({
          _id: app._id,
          userTechSkills: app.userTechSkills,
          userSoftSkills: app.userSoftSkills,
          userResume: app.userResume,
          createdAt: app.createdAt,
        });
      });
    });

    //! Create A Workbook And Worksheet =>
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet([
      ["_id", "userTechSkills", "userSoftSkills", "userResume", "publishDate"],
      ...application.map((app) => [
        app._id.toString(),
        app.userTechSkills.join(", "),
        app.userSoftSkills.join(", "),
        app.userResume,
        new Date(app.createdAt).toISOString(),
      ]),
    ]);

    //! Add The Worksheet To The Workbook =>
    XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");

    //! Generate A Buffer For The Excel File =>
    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "buffer",
    });

    //! Set Headers And Send The Excel File As A Response =>
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${companyName}-applications.xlsx`
    );

    res.send(excelBuffer);
  } catch (error) {
    next(error);
  }
};
