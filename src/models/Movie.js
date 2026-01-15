import mongoose from "mongoose";

const movieSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, index: true },
    description: { type: String, default: "" },
    rating: { type: Number, default: 0, index: true },
    releaseDate: { type: Date, index: true },
    durationMinutes: { type: Number, index: true },
    posterUrl: { type: String, default: "" },
    imdbId: { type: String, index: true },
    imdbRank: { type: Number, index: true },
  },
  { timestamps: true }
);

movieSchema.index({ title: "text", description: "text" });

export const Movie = mongoose.model("Movie", movieSchema);
