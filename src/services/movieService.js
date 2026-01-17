import { Movie } from "../models/Movie.js";

const allowedSort = new Set([
  "title",
  "rating",
  "releaseDate",
  "durationMinutes",
]);

export async function listMovies({ page = 1, limit = 12 }) {
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Movie.find().sort({ _id: -1 }).skip(skip).limit(limit),
    Movie.countDocuments(),
  ]);

  return { items, total, page, limit };
}

export async function sortedMovies({
  by = "title",
  order = "asc",
  page = 1,
  limit = 12,
}) {
  if (!allowedSort.has(by)) by = "title";
  const dir = order === "desc" ? -1 : 1;
  const skip = (page - 1) * limit;

  const [items, total] = await Promise.all([
    Movie.find()
      .sort({ [by]: dir })
      .skip(skip)
      .limit(limit),
    Movie.countDocuments(),
  ]);

  return { items, total, page, limit, sort: { by, order } };
}

export async function searchMovies({ q = "", page = 1, limit = 12 }) {
  const skip = (page - 1) * limit;
  const filter = q ? { $text: { $search: q } } : {};
  const sort = q ? { score: { $meta: "textScore" } } : { _id: -1 }; // or createdAt:-1

  const [items, total] = await Promise.all([
    Movie.find(filter).sort(sort).skip(skip).limit(limit),
    Movie.countDocuments(filter),
  ]);

  return { items, total, page, limit, q };
}
