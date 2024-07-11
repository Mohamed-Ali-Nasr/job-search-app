import jwt from "jsonwebtoken";
import env from "./validateEnv.util";
import { IUserSchema } from "../models/user.model";
import UserTokenModel from "../models/userToken.model";

export const generateTokens = async (
  user: IUserSchema
): Promise<{ accessToken?: string; err?: Error }> => {
  try {
    const accessToken = jwt.sign({ id: user._id }, env.JWT_SIGNIN, {
      expiresIn: "1d",
    });

    const userToken = await UserTokenModel.findOne({ userId: user._id });

    if (userToken) await userToken.deleteOne();

    await new UserTokenModel({ userId: user._id, token: accessToken }).save();

    return { accessToken };
  } catch (err: any) {
    return err;
  }
};
