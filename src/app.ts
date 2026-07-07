import express, { Application } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { globalRouter } from "./routes";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import { globalErrorHandler } from "./utils/globalErrorHandler";

const app: Application = express();

app.use(
  cors({
    origin: config.app_url,
    credentials: true,
  }),
);

app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

//Primary Central Route
app.use("/api", globalRouter);

app.use(notFoundHandler);

app.use(globalErrorHandler);

export default app;
