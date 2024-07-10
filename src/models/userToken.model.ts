import { Schema, model, Document } from "mongoose";
import { IUserToken } from "../types/index.type";

const UserTokenSchema = new Schema<IUserToken>({
  userId: { type: Schema.Types.ObjectId, required: true },

  token: { type: String, required: true },
});

export type IUserTokenSchema = Document & IUserToken;

const UserTokenModel = model<IUserTokenSchema>("UserToken", UserTokenSchema);

export default UserTokenModel;
