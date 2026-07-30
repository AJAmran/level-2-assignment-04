import express, { Application } from "express";
import cors from "cors";
import config from "./config";
import cookieParser from "cookie-parser";
import { globalRouter } from "./routes";
import { notFoundHandler } from "./middlewares/notFoundHandler";
import { globalErrorHandler } from "./utils/globalErrorHandler";

const app: Application = express();

const allowedOrigins = [
  config.frontend_url,
  config.app_url,
  // Allow all Vercel preview/production deployments
  ...(process.env.ADDITIONAL_ORIGINS ? process.env.ADDITIONAL_ORIGINS.split(",") : []),
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, Postman)
      if (!origin) return callback(null, true);
      // Allow explicitly configured origins
      if (allowedOrigins.includes(origin)) return callback(null, true);
      // Allow any Vercel deployment
      if (origin.endsWith(".vercel.app")) return callback(null, true);
      // Allow localhost on any port (for local development)
      if (/^http:\/\/localhost:\d+$/.test(origin)) return callback(null, true);
      callback(new Error(`CORS: Origin '${origin}' not allowed`));
    },
    credentials: true,
  }),
);

app.use(cookieParser());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.use("/api", globalRouter);

app.use(notFoundHandler);

app.use(globalErrorHandler);

export default app;
