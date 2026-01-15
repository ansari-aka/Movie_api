import { connectDB } from "../config/db.js";
import { env } from "../config/env.js";
import { Movie } from "../models/Movie.js";

if (!env.TMDB_API_KEY) {
  console.log("❌ Missing TMDB_API_KEY in .env");
  process.exit(1);
}

const TMDB_BASE = "https://api.themoviedb.org/3";

// Simple sleep for rate limiting
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function tmdbGet(path) {
  const url =
    `${TMDB_BASE}${path}` +
    (path.includes("?") ? "&" : "?") +
    `api_key=${env.TMDB_API_KEY}&language=en-US`;

  const res = await fetch(url);
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`TMDB ${res.status}: ${txt}`);
  }
  return res.json();
}

async function seed() {
  try {
    await connectDB();

    // Optional: clear old data
    await Movie.deleteMany({});
    console.log("🗑️ Cleared movies collection");

    // Fetch configuration to build poster URLs correctly
    const cfg = await tmdbGet("/configuration"); // image base + sizes :contentReference[oaicite:2]{index=2}
    const base = cfg?.images?.secure_base_url || "https://image.tmdb.org/t/p/";
    const posterSize = (cfg?.images?.poster_sizes || []).includes("w500")
      ? "w500"
      : cfg?.images?.poster_sizes?.[0] || "w500";

    // 13 pages × 20 = 260, we take first 250
    const list = [];
    for (let page = 1; page <= 13; page++) {
      const data = await tmdbGet(`/movie/top_rated?page=${page}`);
      list.push(...(data.results || []));
      await sleep(250); // small pause between list pages
    }

    const top250 = list.slice(0, 250);

    // Fetch runtime from /movie/{id} for each movie
    const docs = [];
    for (let i = 0; i < top250.length; i++) {
      const m = top250[i];

      // Movie details includes runtime (minutes) :contentReference[oaicite:3]{index=3}
      const details = await tmdbGet(`/movie/${m.id}`);

      docs.push({
        title: details.title || details.original_title || "Untitled",
        description: details.overview || "",
        rating:
          typeof details.vote_average === "number"
            ? Number(details.vote_average.toFixed(1))
            : 0,
        releaseDate: details.release_date
          ? new Date(details.release_date)
          : undefined,
        durationMinutes:
          typeof details.runtime === "number" ? details.runtime : undefined,
        posterUrl: details.poster_path
          ? `${base}${posterSize}${details.poster_path}`
          : "",
        imdbId: details.imdb_id || "", // sometimes TMDB includes imdb_id in details; keep optional
        imdbRank: i + 1,
      });

      // Safe rate limiting: ~3 requests/sec
      await sleep(350);
    }

    await Movie.insertMany(docs);
    console.log(
      `✅ Seeded ${docs.length} real movies with durationMinutes (runtime)`
    );

    process.exit(0);
  } catch (err) {
    console.error("❌ Seeding failed:", err.message);
    process.exit(1);
  }
}

seed();
