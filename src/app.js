import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";

import authRoutes from "./routes/auth.routes.js";
import moviesRoutes from "./routes/movies.routes.js";
// import importRoutes from "./routes/import.routes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export const app = express();

app.set("trust proxy", 2);

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:2000, 
  standardHeaders: true,
  legacyHeaders: false,
});

app.use(helmet());
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(morgan("dev"));
app.use(rateLimit(limiter));

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/auth", authRoutes);
app.use("/movies", moviesRoutes);

app.use(notFound);
app.use(errorHandler);
