import express, { Router } from "express";
import user from "./user.route";
import company from "./company.route";
import job from "./job.route";

const router = express.Router();

export default (): Router => {
  user(router);
  company(router);
  job(router);

  return router;
};
