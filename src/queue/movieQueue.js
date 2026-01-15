import { Queue } from "bullmq";
import { redis } from "../config/redis.js";

export const movieQueue = new Queue("movie-import", { connection: redis });
