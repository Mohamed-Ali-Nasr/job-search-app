import { Router } from "express";
import {
  deleteAccount,
  forgetPassword,
  getAssocRecEmail,
  getProfileData,
  getUserAccountData,
  resetPassword,
  signin,
  signup,
  updateAccount,
  updatePassword,
  verifyEmail,
} from "../controllers/user.controller";
import { authMiddleware } from "../middlewares/auth.middleware";
import { validationMiddleware } from "../middlewares/validation.middleware";
import {
  forgetPasswordSchema,
  getAssocRecEmailSchema,
  getProfileDataSchema,
  resetPasswordSchema,
  signinSchema,
  signupSchema,
  updateAccountSchema,
  updatePasswordSchema,
  verifyEmailSchema,
} from "../schemas/user.schema";

export default (router: Router) => {
  router.post("/user/signup", validationMiddleware(signupSchema), signup);

  router.get(
    "/user/verify-email/:token",
    validationMiddleware(verifyEmailSchema),
    verifyEmail
  );

  router.post("/user/signin", validationMiddleware(signinSchema), signin);

  router.put(
    "/user/update-account",
    authMiddleware,
    validationMiddleware(updateAccountSchema),
    updateAccount
  );

  router.delete("/user/delete-account", authMiddleware, deleteAccount);

  router.get("/user/user-account", authMiddleware, getUserAccountData);

  router.get(
    "/user/profile-data/:userId",
    validationMiddleware(getProfileDataSchema),
    getProfileData
  );

  router.post(
    "/user/update-password",
    authMiddleware,
    validationMiddleware(updatePasswordSchema),
    updatePassword
  );

  router.post(
    "/user/forget-password",
    validationMiddleware(forgetPasswordSchema),
    forgetPassword
  );

  router.post(
    "/user/reset-password",
    validationMiddleware(resetPasswordSchema),
    resetPassword
  );

  router.get(
    "/user/recovery-email-associated",
    validationMiddleware(getAssocRecEmailSchema),
    getAssocRecEmail
  );
};
