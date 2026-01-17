export type ShowWithNext = {
  id: number | string;
  name: string;
  url?: string;
  image?: { medium?: string; original?: string } | null;
  summary?: string | null;
  premiered?: string | null;
  status?: string | null;
  network?: { name?: string } | null;
  webChannel?: { name?: string } | null;
  _embedded?: any;
  nextAirstamp?: string | null;
  nextEpisode?: any | null;
  rating?: number | null;
  platform?: string | null;
};

async function fetchJson(url: string, options?: any) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.json();
}

// Fetch popular shows from TMDB
async function fetchFromTmdb(apiKey: string): Promise<ShowWithNext[]> {
  const baseImage = "https://image.tmdb.org/t/p/w500";
  const popularUrl = `https://api.themoviedb.org/3/tv/popular?api_key=${apiKey}&language=en-US&page=1`;
  const pop = await fetchJson(popularUrl);
  const results = pop.results ?? [];

  const detailPromises = results.map(async (r: any) => {
    try {
      const detail = await fetchJson(
        `https://api.themoviedb.org/3/tv/${r.id}?api_key=${apiKey}&language=en-US&append_to_response=next_episode_to_air`
      );
      const next = detail.next_episode_to_air ?? null;
      const nextAirstamp = next ? (next.air_date ? `${next.air_date}T00:00:00Z` : null) : null;
      const rating = detail.vote_average ?? null;
      
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
        network: detail.networks?.[0] ? { name: detail.networks[0].name } : null,
        nextAirstamp,
        nextEpisode: next,
        rating,
      } as ShowWithNext;
    } catch (e) {
      return null;
    }
  });

  const detailed = await Promise.all(detailPromises);
  return (detailed.filter(Boolean) as ShowWithNext[]);
}

export async function fetchShows(): Promise<ShowWithNext[]> {
  const tmdbKey = process.env.TMDB_API_KEY;
  if (!tmdbKey) {
    throw new Error('TMDB_API_KEY environment variable is required');
  }
  
  return fetchFromTmdb(tmdbKey);
}
