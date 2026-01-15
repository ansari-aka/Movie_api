import express from "express";
import { z } from "zod";
import { Movie } from "../models/Movie.js";
import { authRequired } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import {
  listMovies,
  searchMovies,
  sortedMovies,
} from "../services/movieService.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    res.json(await listMovies({ page, limit }));
  } catch (e) {
    next(e);
  }
});

router.get("/sorted", async (req, res, next) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    const by = String(req.query.by || "title");
    const order = String(req.query.order || "asc");
    res.json(await sortedMovies({ by, order, page, limit }));
  } catch (e) {
    next(e);
  }
});

router.get("/search", async (req, res, next) => {
  try {
    const q = String(req.query.q || "");
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 12);
    res.json(await searchMovies({ q, page, limit }));
  } catch (e) {
    next(e);
  }
});

const movieSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional().default(""),
  rating: z.number().min(0).max(10).optional().default(0),
  releaseDate: z.string().optional(),
  durationMinutes: z.number().int().min(1).optional(),
  posterUrl: z.string().url().optional().default(""),
  imdbId: z.string().optional(),
  imdbRank: z.number().int().optional(),
});

router.post("/", authRequired, requireRole("admin"), async (req, res, next) => {
  try {
    const data = movieSchema.parse(req.body);
    const doc = await Movie.create({
      ...data,
      releaseDate: data.releaseDate ? new Date(data.releaseDate) : undefined,
    });
    res.status(201).json(doc);
  } catch (e) {
    next(e);
  }
});

router.put(
  "/:id",
  authRequired,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const data = movieSchema.partial().parse(req.body);
      const updated = await Movie.findByIdAndUpdate(
        req.params.id,
        {
          ...data,
          releaseDate: data.releaseDate
            ? new Date(data.releaseDate)
            : undefined,
        },
        { new: true }
      );
      if (!updated) return res.status(404).json({ message: "Movie not found" });
      res.json(updated);
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  "/:id",
  authRequired,
  requireRole("admin"),
  async (req, res, next) => {
    try {
      const deleted = await Movie.findByIdAndDelete(req.params.id);
      if (!deleted) return res.status(404).json({ message: "Movie not found" });
      res.json({ ok: true });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
