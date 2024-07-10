import { CustomHelpers } from "joi";
import { Types } from "mongoose";

export const objectIdRule = (value: string, helpers: CustomHelpers) => {
  const isValidObject = Types.ObjectId.isValid(value);

  return isValidObject
    ? value
    : helpers.message({ custom: "Invalid Object Id" });
};

//! Handle System Roles For Authorizations =>
export const systemRole = {
  USER: "User",
  HR_COMPANY: "Company_HR",
};

const { USER, HR_COMPANY } = systemRole;

export const roles = {
  USER: [USER],
  COMPANY: [HR_COMPANY],
  USER_COMPANY: [USER, HR_COMPANY],
};
