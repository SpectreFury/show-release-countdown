export type ShowWithNext = {
  id: number | string;
  name: string;
  url?: string;
  image?: { medium?: string; original?: string } | null;
  summary?: string | null;
  premiered?: string | null;
  status?: string | null;
  network?: { name?: string } | null;
  _embedded?: any;
  nextAirstamp?: string | null;
  nextEpisode?: any | null;
};

async function fetchJson(url: string, options?: any) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.json();
}

// Fetch using TMDB (if API key is present) to get popular shows and their next episodes
async function fetchFromTmdb(apiKey: string): Promise<ShowWithNext[]> {
  const baseImage = "https://image.tmdb.org/t/p/w500";
  const popularUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`;
  const pop = await fetchJson(popularUrl);
  const results = pop.results ?? [];

  const detailPromises = results.map(async (r: any) => {
    try {
      const detail = await fetchJson(
        `https://api.themoviedb.org/3/tv/${r.id}?api_key=${apiKey}&language=en-US`
      );
      const next = detail.next_episode_to_air ?? null;
      const nextAirstamp = next ? (next.air_date ? `${next.air_date}T00:00:00Z` : null) : null;
      return {
        id: `tmdb-${detail.id}`,
        name: detail.name,
        url: `https://www.themoviedb.org/tv/${detail.id}`,
        image: detail.poster_path
          ? { medium: `${baseImage}${detail.poster_path}`, original: `${baseImage}${detail.poster_path}` }
          : null,
        summary: detail.overview ?? null,
        premiered: detail.first_air_date ?? null,
        status: detail.status ?? null,
        network: detail.network ? { name: detail.network.name } : null,
        nextAirstamp,
        nextEpisode: next,
      } as ShowWithNext;
    } catch (e) {
      return null;
    }
  });

  const detailed = await Promise.all(detailPromises);
  return (detailed.filter(Boolean) as ShowWithNext[]);
}

// Fallback: query TVMaze schedule for the next N days and aggregate shows with upcoming episodes
async function fetchFromTvmazeSchedule(days = 14): Promise<ShowWithNext[]> {
  const map = new Map<number, ShowWithNext>();
  const today = new Date();

  for (let i = 0; i < days; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    const iso = d.toISOString().slice(0, 10);
    try {
      const episodes = await fetchJson(`https://api.tvmaze.com/schedule?country=US&date=${iso}`);
      for (const ep of episodes) {
        const show = ep.show;
        if (!show) continue;
        const existing = map.get(show.id) as ShowWithNext | undefined;
        const airstamp = ep.airstamp ?? null;
        if (!existing || (airstamp && (!existing.nextAirstamp || new Date(airstamp) < new Date(existing.nextAirstamp)))) {
          map.set(show.id, {
            id: show.id,
            name: show.name,
            url: show.url,
            image: show.image ?? null,
            summary: show.summary ?? null,
            premiered: show.premiered ?? null,
            status: show.status ?? null,
            network: show.network ?? null,
            nextAirstamp: airstamp,
            nextEpisode: ep,
          });
        }
      }
    } catch (e) {
      // Ignore single-day failures
      continue;
    }
  }

  // Convert to array and return
  return Array.from(map.values());
}

export async function fetchShows(): Promise<ShowWithNext[]> {
  const tmdbKey = process.env.TMDB_API_KEY;
  try {
    if (tmdbKey) {
      const res = await fetchFromTmdb(tmdbKey);
      return res;
    }
  } catch (e) {
    // fall back to tvmaze schedule
  }

  return fetchFromTvmazeSchedule(14);
}
