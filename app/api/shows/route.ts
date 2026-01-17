import { NextRequest, NextResponse } from 'next/server';

// Map of streaming platforms to their TMDB provider IDs
// Reference: https://www.themoviedb.org/settings/apps
const TMDB_PROVIDER_IDS: Record<string, number> = {
  'Netflix': 8,
  'Amazon Prime Video': 10,
  'Hulu': 15,
  'HBO': 236,
  'Apple TV+': 350,
  'Disney+': 337,
  'Peacock': 386,
};

// Map of provider IDs to platform names
const PROVIDER_TO_NAME: Record<number, string> = {
  8: 'Netflix',
  10: 'Amazon Prime Video',
  15: 'Hulu',
  236: 'HBO',
  350: 'Apple TV+',
  337: 'Disney+',
  386: 'Peacock',
};

async function fetchJson(url: string, options?: any) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${url}`);
  return res.json();
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const platform = searchParams.get('platform');
  const page = parseInt(searchParams.get('page') || '1', 10);

  if (!platform || !TMDB_PROVIDER_IDS[platform]) {
    return NextResponse.json(
      { error: 'Invalid platform' },
      { status: 400 }
    );
  }

  try {
    const tmdbKey = process.env.TMDB_API_KEY;
    if (!tmdbKey) {
      return NextResponse.json(
        { error: 'TMDB_API_KEY not configured' },
        { status: 500 }
      );
    }

    const providerId = TMDB_PROVIDER_IDS[platform];
    const baseImage = 'https://image.tmdb.org/t/p/w500';

    // Discover TV shows available on the specified platform in US region
    const discoverUrl = `https://api.themoviedb.org/3/discover/tv?api_key=${tmdbKey}&language=en-US&region=US&sort_by=popularity.desc&with_watch_providers=${providerId}&watch_region=US&page=${page}`;
    const discoverResults = await fetchJson(discoverUrl);
    const shows = discoverResults.results ?? [];

    // Enrich shows with detailed information
    const enrichedShows = await Promise.all(
      shows.map(async (show: any) => {
        try {
          // Get detailed show info including next episode
          const detailUrl = `https://api.themoviedb.org/3/tv/${show.id}?api_key=${tmdbKey}&language=en-US&append_to_response=next_episode_to_air`;
          const details = await fetchJson(detailUrl);
          
          const nextEpisode = details.next_episode_to_air;
          const nextAirstamp = nextEpisode?.air_date ? `${nextEpisode.air_date}T00:00:00Z` : null;

          return {
            id: `tmdb-${show.id}`,
            name: details.name,
            url: `https://www.themoviedb.org/tv/${show.id}`,
            image: show.poster_path
              ? { 
                  medium: `${baseImage}${show.poster_path}`,
                  original: `${baseImage}${show.poster_path}`
                }
              : null,
            summary: details.overview ?? null,
            premiered: details.first_air_date ?? null,
            status: details.status ?? null,
            webChannel: { name: platform },
            network: details.networks?.[0] ? { name: details.networks[0].name } : null,
            nextAirstamp,
            nextEpisode,
            rating: details.vote_average ?? null,
            platform,
          };
        } catch (e) {
          console.error(`Error fetching details for show ${show.id}:`, e);
          return null;
        }
      })
    );

    const filtered = enrichedShows.filter((s) => s !== null);

    return NextResponse.json({
      shows: filtered,
      page,
      total: discoverResults.total_results || filtered.length,
    });
  } catch (error) {
    console.error('Error fetching platform shows:', error);
    return NextResponse.json(
      { error: 'Failed to fetch shows' },
      { status: 500 }
    );
  }
}
