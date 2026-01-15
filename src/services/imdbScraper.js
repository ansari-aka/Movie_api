import axios from "axios";
import * as cheerio from "cheerio";

/**
 * IMDb HTML can change anytime. This is a best-effort scraper.
 * If it breaks, update selectors.
 */
export async function fetchImdbTop250() {
  const url = "https://www.imdb.com/chart/top?ref_=nv_mv_250";
  const { data: html } = await axios.get(url, {
    headers: { "User-Agent": "Mozilla/5.0" },
  });

  const $ = cheerio.load(html);

  // Newer IMDb layouts typically list items in a <ul> list.
  const rows = $("ul.ipc-metadata-list li");
  const movies = [];

  rows.each((i, el) => {
    const rawTitle = $(el).find("h3").first().text().trim();
    const title = rawTitle.replace(/^\d+\.\s*/, "").trim();

    const ratingText = $(el)
      .find('[data-testid="ratingGroup--imdb-rating"] span')
      .first()
      .text()
      .trim();

    const rating = Number(ratingText) || 0;

    const href = $(el).find("a.ipc-title-link-wrapper").attr("href") || "";
    const match = href.match(/\/title\/(tt\d+)/);
    const imdbId = match ? match[1] : undefined;

    if (title) movies.push({ title, rating, imdbId, imdbRank: i + 1 });
  });

  // Fallback: if rows selector fails, return empty
  return movies;
}
