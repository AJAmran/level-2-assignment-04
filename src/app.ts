import express, { Application } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { globalRouter } from "./routes";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import { globalErrorHandler } from "./utils/globalErrorHandler";

const app: Application = express();

/** CORS: restrict to configured origin and allow credentials (cookies) */
app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

/** Parse cookies (used for refresh token rotation) */
app.use(cookieParser());

/** Parse JSON and URL-encoded request bodies */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/** Health-check endpoint */
app.get("/", (req, res) => {
  res.send("Hello World!");
});

/** Mount all feature modules under the /api prefix */
app.use("/api", globalRouter);

/** 404 catch-all for undefined routes (must be after all valid routes) */
app.use(notFoundHandler);

/** Centralized error handler (must be last middleware) */
app.use(globalErrorHandler);

export default app;
