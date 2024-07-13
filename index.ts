import "dotenv/config";
import express, { NextFunction, Request, Response } from "express";
import http from "http";
import createHttpError, { isHttpError } from "http-errors";
import routes from "./src/routes/index.route";
import morgan from "morgan";
import mongoose from "mongoose";
import env from "./src/utils/validateEnv.util";

/* Configuration and Middlewares */
const app = express();
app.use(express.json());
app.use(morgan("dev"));

/* Creating Server */
const PORT = env.PORT || 8080;
const server = http.createServer(app);
server.listen(PORT, () => {
  console.log(`Server running on port: ${PORT}`);
});
app.get("/", (req, res) => res.send("Express on Vercel"));

/* Mongoose Setup */
mongoose.Promise = Promise;
mongoose
  .connect(env.MONGODB_URI)
  .then(() => {
    console.log("Connected to Mongo");
  })
  .catch((error) => {
    console.log("Unable to connect to Mongo : ");
    console.log(error);
  });
mongoose.connection.on("error", (error: Error) => console.log(error));

/* Routes */
app.use("/api", routes());

/* Error Handling */
app.use((req, res, next) => {
  next(createHttpError(404, "Endpoint not found"));
});

app.use((error: unknown, req: Request, res: Response, next: NextFunction) => {
  console.error(error);
  let errorMessage = "An unknown error occurred";
  let statusCode = 500;
  if (isHttpError(error)) {
    statusCode = error.status;
    errorMessage = error.message;
  }
  res.status(statusCode).json({ error: errorMessage });
});
