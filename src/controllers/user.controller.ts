import { RequestHandler, NextFunction, Response } from "express";
import UserModel from "../models/user.model";
import createHttpError from "http-errors";
import bcrypt from "bcryptjs";
import { sendEmailService } from "../services/sendEmail.service";
import { generateTokens } from "../utils/generateTokens.util";
import jwt from "jsonwebtoken";
import UserTokenModel from "../models/userToken.model";
import env from "../utils/validateEnv.util";
import { IRequest } from "../types/index.type";
import CompanyModel from "../models/company.model";
import JobModel from "../models/job.model";
import ApplicationModel from "../models/application.model";

export const signup: RequestHandler = async (req, res, next) => {
  const {
    firstName,
    lastName,
    username,
    email,
    password,
    DOB,
    mobileNumber,
    recoveryEmail,
    role,
  } = req.body;

  try {
    //! Check If Email Exists In Database =>
    const existingUser = await UserModel.findOne({
      $or: [{ mobileNumber }, { email }],
    });
    if (existingUser) {
      throw createHttpError(
        400,
        "User Already Exists. Please Choose a Different Or Log In Instead."
      );
    }

    //! Hash The Password =>
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //! create New User =>
    const newUser = new UserModel({
      firstName,
      lastName,
      username,
      email,
      password: hashedPassword,
      DOB,
      mobileNumber,
      recoveryEmail,
      role,
    });

    //! Generate Token For New User =>
    const token = jwt.sign({ userId: newUser._id }, env.JWT_VERIFIED_EMAIL, {
      expiresIn: "10m",
    });

    //! Generate Email Confirmation Link =>
    const confirmationLink = `${req.protocol}://${req.headers.host}/api/user/verify-email/${token}`;

    //! Sending Email To Verify If Email Is Valid =>
    const isEmailSent = await sendEmailService({
      to: email as string,
      subject: "Welcome To Job Search App, Verify Your Email Address",
      textMessage: "Please Verify Your Email Address",
      htmlMessage: `<a href=${confirmationLink}>Please Verify Your Email Address</a>`,
    });
    if (isEmailSent.rejected.length) {
      throw createHttpError(500, "Verification Email Sending Is Failed");
    }

    //! Save New User To Database =>
    await newUser.save();

    res.status(201).json({
      message: "User Created Successfully, Please Verify Your Email",
      newUser,
    });
  } catch (error) {
    next(error);
  }
};

export const verifyEmail: RequestHandler = async (req, res, next) => {
  const { token } = req.params;

  try {
    //! Verify Token Param To Get The data
    const data = jwt.verify(token, env.JWT_VERIFIED_EMAIL);

    //! Find The User Account Ans Update Confirmation Status =>
    const confirmedUser = await UserModel.findOneAndUpdate(
      { _id: (data as any)?.userId, isConfirmed: false },
      { isConfirmed: true },
      { new: true }
    );

    //! Check If The User Account Not Exist =>
    if (!confirmedUser) {
      throw createHttpError(404, "No Users Found By This Id");
    }

    res
      .status(200)
      .json({ message: "User Verified Successfully", confirmedUser });
  } catch (error) {
    next(error);
  }
};

export const signin: RequestHandler = async (req, res, next) => {
  const { email, password, mobileNumber } = req.body;

  try {
    //! Find User By Email =>
    const user = await UserModel.findOne({
      $or: [{ mobileNumber }, { email }, { recoveryEmail: email }],
    });
    if (!user) {
      throw createHttpError(400, "Invalid Email Or Password.");
    }

    //! compare password =>
    const isPasswordValid = await bcrypt.compare(password, user.password!);
    if (!isPasswordValid) {
      throw createHttpError(400, "Invalid Email Or Password.");
    }

    //! Ensure User Email Is Already Verified =>
    if (!user.isConfirmed) {
      throw createHttpError(
        400,
        "Your Email Address Is Not Verified Yet, Please Verify It First And Then Login Again"
      );
    }

    //! Add Authenticated User To Request =>

    //! Change The Status Of User =>
    user.status = "online";

    //! Generate Token For Existing User =>
    const { accessToken } = await generateTokens(user);

    //! Save User To Database =>
    await user.save();

    res.status(201).json({ accessToken, user });
  } catch (error) {
    next(error);
  }
};

export const updateAccount = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;
  const { firstName, lastName, email, DOB, mobileNumber, recoveryEmail } =
    req.body;

  try {
    //! Find User Account By Id And Update =>
    const updatedAccount = await UserModel.findByIdAndUpdate(
      { _id: userId },
      { firstName, lastName, email, DOB, mobileNumber, recoveryEmail },
      { new: true }
    );

    //! Check If Updated User Account Not Exists In Database =>
    if (!updatedAccount) {
      throw createHttpError(404, "No User Account Found By This Id");
    }

    //! Verify User Account Email Address If Updated It =>
    if (email) {
      //! Change Email Confirmation =>
      updatedAccount.isConfirmed = false;
      await updatedAccount.save();

      //! Generate Token For Updated User Account =>
      const token = jwt.sign({ userId }, "5a2d20453d7dbc7e80c9128923fe8614", {
        expiresIn: "5m",
      });

      //! Generate Email Confirmation Link =>
      const confirmationLink = `${req.protocol}://${req.headers.host}/api/user/verify-email/${token}`;

      //! Sending Email To Verify If Email Is Valid =>
      const isEmailSent = await sendEmailService({
        to: email as string,
        subject: "Welcome To Job Search App, Verify Your Email Address",
        textMessage: "Please Verify Your Email Address",
        htmlMessage: `<a href=${confirmationLink}>Please Verify Your Email Address</a>`,
      });
      if (isEmailSent.rejected.length) {
        throw createHttpError(500, "Verification Email Sending Is Failed");
      }

      throw createHttpError(
        400,
        "You May Want To Update Your Email Address Please Verify It First And Then Login Again"
      );
    }

    //! Save Updated User Account To Database =>
    await updatedAccount.save();

    res
      .status(201)
      .json({ message: "User Account Updated Successfully", updatedAccount });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  try {
    //! Find User Account By Id And Delete =>
    const deletedAccount = await UserModel.findByIdAndDelete({
      _id: userId,
    });

    //! Check If Deleted User Account Not Exists In Database =>
    if (!deletedAccount) {
      throw createHttpError(404, "No User Account Found By This Id");
    }

    //! Delete All Related To This User Account =>
    const userCompanies = await CompanyModel.find({ companyHR: userId });
    userCompanies?.forEach(async (company) => {
      await company.deleteOne();
    });

    const companyJobs = await JobModel.find({ addedBy: userId });
    companyJobs?.forEach(async (job) => {
      const applications = await ApplicationModel.find({
        jobId: job._id,
      });
      applications?.forEach(async (application) => {
        await application.deleteOne();
      });
      await job.deleteOne();
    });

    //! Delete Token Created By This User Account =>
    await UserTokenModel.findOneAndDelete({ userId });

    res
      .status(201)
      .json({ message: "User Account Deleted Successfully", deletedAccount });
  } catch (error) {
    next(error);
  }
};

export const getUserAccountData = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { userId } = req;

  try {
    //! Find User Account By Id =>
    const userAccount = await UserModel.findById({ _id: userId });

    //! Check If User Account Not Exists In Database =>
    if (!userAccount) {
      throw createHttpError(404, "No User Account Found By This Id");
    }

    res.status(200).json(userAccount);
  } catch (error) {
    next(error);
  }
};

export const getProfileData: RequestHandler = async (req, res, next) => {
  const { userId } = req.params;

  try {
    //! Find User Account By Id =>
    const profileData = await UserModel.findById({ _id: userId });

    //! Check If User Account Not Exists In Database =>
    if (!profileData) {
      throw createHttpError(404, "No Profile data Found By This Id");
    }

    res.status(200).json(profileData);
  } catch (error) {
    next(error);
  }
};

export const updatePassword = async (
  req: IRequest,
  res: Response,
  next: NextFunction
) => {
  const { authUser } = req;
  const { password } = req.body;

  try {
    //! Hash The Password =>
    const salt = await bcrypt.genSalt(10);
    const newPassword = await bcrypt.hash(password, salt);

    //! Update The Old Password With New Password =>
    authUser!.password = newPassword;

    //! Save New Password Account To Database =>
    await authUser!.save();

    res.status(201).json({
      message: "Password Updated Successfully",
      authUser,
    });
  } catch (error) {
    next(error);
  }
};

export const forgetPassword: RequestHandler = async (req, res, next) => {
  const { recoveryEmail } = req.body;

  try {
    //! Find User By Email =>
    const user = await UserModel.findOne({ recoveryEmail });
    if (!user) {
      throw createHttpError(400, "No User Account Found By This Email");
    }

    //! Generate Token For Exist User =>
    const token = jwt.sign({ userId: user._id }, env.JWT_RESET_PASSWORD, {
      expiresIn: "20m",
    });

    //! Generate Email Confirmation Link =>
    const confirmationLink = `${req.protocol}://${req.headers.host}/api/user/verify-recovery-email/${token}`;

    //! Sending Email To Verify If Email Is Valid =>
    const isEmailSent = await sendEmailService({
      to: recoveryEmail as string,
      subject: "Password Reset Instructions",
      textMessage: "Please use the following link to reset your password",
      htmlMessage: `<a href=${confirmationLink}>Please use the following link to reset your password</a>`,
    });
    if (isEmailSent.rejected.length) {
      throw createHttpError(500, "Verification Email Sending Is Failed");
    }

    res
      .status(201)
      .json({ message: "Password reset details sent to your email" });
  } catch (error) {
    next(error);
  }
};

export const verifyRecoveryEmail: RequestHandler = async (req, res, next) => {
  const { token } = req.params;

  try {
    //! Verify Token Param To Get The data
    const data = jwt.verify(token, env.JWT_RESET_PASSWORD);

    //! Find The User Account And Update Reset Password Status =>
    const resetPassUser = await UserModel.findOneAndUpdate(
      { _id: (data as any)?.userId, isPasswordReset: false },
      { isPasswordReset: true },
      { new: true }
    );

    //! Check If The User Account Not Exist =>
    if (!resetPassUser) {
      throw createHttpError(404, "No Users Found By This Id");
    }

    res.status(200).json({
      message:
        "User Account Verified Successfully, Now You Can Reset Yor Password With New One",
      userId: (data as any)?.userId,
    });
  } catch (error) {
    next(error);
  }
};

export const resetPassword: RequestHandler = async (req, res, next) => {
  const { userId } = req.params;
  const { newPassword } = req.body;

  try {
    //! Find The User Account By Id =>
    const user = await UserModel.findById({ _id: userId });

    //! Check If The User Account Not Exist =>
    if (!user) {
      throw createHttpError(404, "No Users Found By This Id");
    }

    //! Check If Password Reset Status Is Not True =>
    if (!user.isPasswordReset) {
      throw createHttpError(
        400,
        "Failed To Reset Password, Please Verify Your Recovery Email First And Then Try Again"
      );
    }

    //! Hash The Password =>
    const salt = await bcrypt.genSalt(10);
    const hashedNewPassword = await bcrypt.hash(newPassword, salt);

    //! Update The Old Password With The New Password =>
    user.password = hashedNewPassword;

    //! Update Reset Password Status To The Default =>
    user.isPasswordReset = false;

    //! Save User To Database =>
    await user.save();

    res.status(201).json({
      message: "New Password Is Updated Successfully, You Can Signin Now",
    });
  } catch (error) {
    next(error);
  }
};

export const getAssocRecEmail: RequestHandler = async (req, res, next) => {
  const { recoveryEmail } = req.body;

  try {
    //! Get All Accounts Data Associated With Recovery Email =>
    const accData = await UserModel.find({ recoveryEmail }).select(
      "email username"
    );

    //! Check if Recovery Email Is Already Exists =>
    if (accData.length < 1) {
      throw createHttpError(
        400,
        "There Is No Data Associated With This Recovery Email"
      );
    }

    res.status(200).json(accData);
  } catch (error) {
    next(error);
  }
};
