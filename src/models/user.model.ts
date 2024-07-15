import { Schema, Document, model } from "mongoose";
import { IUser } from "../types/index.type";
import { systemRole } from "../utils/validateRule.util";

const UserSchema = new Schema<IUser>({
  firstName: { type: String, required: true },

  lastName: { type: String, required: true },

  username: {
    type: String,
    default: function () {
      return `${this.firstName}-${this.lastName}`;
    },
  },

  email: { type: String, required: true },

  password: { type: String, required: true },

  isConfirmed: { type: Boolean, default: false },

  otp: { type: String },

  otpExpires: { type: Date },

  recoveryEmail: { type: String, required: true },

  DOB: { type: String, required: true },

  mobileNumber: { type: String, required: true },

  role: { type: String, required: true, enum: Object.values(systemRole) },

  status: {
    type: String,
    required: true,
    enum: ["online", "offline"],
    default: "offline",
  },
});

export type IUserSchema = Document & IUser;

const UserModel = model<IUserSchema>("User", UserSchema);

export default UserModel;
