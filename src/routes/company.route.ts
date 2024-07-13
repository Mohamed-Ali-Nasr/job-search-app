import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import {
  addCompany,
  companyApplications,
  deleteCompany,
  getApplicationsJobs,
  getCompanyJobs,
  searchCompanyByName,
  updateCompany,
} from "../controllers/company.controller";
import { authorization } from "../middlewares/authorization.middleware";
import { roles } from "../utils/validateRule.util";
import { validationMiddleware } from "../middlewares/validation.middleware";
import {
  addCompanySchema,
  deleteCompanySchema,
  searchCompanySchema,
  updateCompanySchema,
} from "../schemas/company.schema";

export default (router: Router) => {
  router.post(
    "/company/create",
    authMiddleware,
    authorization(roles.COMPANY),
    validationMiddleware(addCompanySchema),
    addCompany
  );

  router.put(
    "/company/update/:companyId",
    authMiddleware,
    authorization(roles.COMPANY),
    validationMiddleware(updateCompanySchema),
    updateCompany
  );

  router.delete(
    "/company/delete/:companyId",
    authMiddleware,
    authorization(roles.COMPANY),
    validationMiddleware(deleteCompanySchema),
    deleteCompany
  );

  router.get(
    "/company/get-company-jobs/:companyId",
    authMiddleware,
    authorization(roles.COMPANY),
    validationMiddleware(deleteCompanySchema),
    getCompanyJobs
  );

  router.get(
    "/company/search-company",
    authMiddleware,
    authorization(roles.USER_COMPANY),
    validationMiddleware(searchCompanySchema),
    searchCompanyByName
  );

  router.get(
    "/company/applications-jobs",
    authMiddleware,
    authorization(roles.COMPANY),
    getApplicationsJobs
  );

  router.get(
    "/company/applications/excel",
    validationMiddleware(searchCompanySchema),
    companyApplications
  );
};
