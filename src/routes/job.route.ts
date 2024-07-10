import { Router } from "express";
import { authMiddleware } from "../middlewares/auth.middleware";
import { authorization } from "../middlewares/authorization.middleware";
import { roles } from "../utils/validateRule.util";
import { validationMiddleware } from "../middlewares/validation.middleware";
import {
  addJob,
  applyJob,
  deleteJob,
  filterJobs,
  getAllJobsWithCompanies,
  getJobsWithOneCompany,
  updateJob,
} from "../controllers/job.controller";
import {
  addJobSchema,
  applyJobSchema,
  deleteJobSchema,
  filterJobsSchema,
  updateJobSchema,
} from "../schemas/job.schema";
import { searchCompanySchema } from "../schemas/company.schema";

export default (router: Router) => {
  router.post(
    "/job/:companyId/create",
    authMiddleware,
    authorization(roles.COMPANY),
    validationMiddleware(addJobSchema),
    addJob
  );

  router.put(
    "/job/:companyId/update/:jobId",
    authMiddleware,
    authorization(roles.COMPANY),
    validationMiddleware(updateJobSchema),
    updateJob
  );

  router.delete(
    "/job/:companyId/delete/:jobId",
    authMiddleware,
    authorization(roles.COMPANY),
    validationMiddleware(deleteJobSchema),
    deleteJob
  );

  router.get(
    "/job/jobs-with-companies",
    authMiddleware,
    authorization(roles.USER_COMPANY),
    getAllJobsWithCompanies
  );

  router.get(
    "/job/jobs-with-one-company",
    authMiddleware,
    authorization(roles.USER_COMPANY),
    validationMiddleware(searchCompanySchema),
    getJobsWithOneCompany
  );

  router.get(
    "/job/filter-jobs",
    authMiddleware,
    authorization(roles.USER_COMPANY),
    validationMiddleware(filterJobsSchema),
    filterJobs
  );

  router.post(
    "/job/:companyId/apply-job/:jobId",
    authMiddleware,
    authorization(roles.USER),
    validationMiddleware(applyJobSchema),
    applyJob
  );
};
