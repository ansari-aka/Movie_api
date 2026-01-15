import express from "express";
import { authRequired } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { fetchImdbTop250 } from "../services/imdbScraper.js";
import { movieQueue } from "../queue/movieQueue.js";

const router = express.Router();

router.post(
  "/imdb-top250",
  authRequired,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const movies = await fetchImdbTop250();

      await movieQueue.addBulk(
        movies.map((m) => ({
          name: "upsert-movie",
          data: m,
          opts: { removeOnComplete: true, attempts: 3 },
        }))
      );

      res.json({ queued: movies.length });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
