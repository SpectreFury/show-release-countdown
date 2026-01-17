import ShowCard from "../components/ShowCard";
import SearchBar from "../components/SearchBar";
import FeaturedCountdown from "../components/FeaturedCountdown";
import ShowsGrid from "../components/ShowsGrid";
import { fetchShows } from "../lib/tvmaze";

export default async function Home() {
  const shows = await fetchShows();

  // Minimum rating threshold for high-quality shows (7.0 out of 10)
  const MIN_RATING = 7.0;

  // Filter shows: must have a high rating
  // Note: TMDB shows often don't have scheduled next episodes, so we include all highly rated shows
  const now = Date.now();
  const filtered = shows.filter((s) => {
    // Only include shows with rating at or above threshold
    if (!s.rating || s.rating < MIN_RATING) return false;
    
    // Include the show if it has an upcoming episode, or if it just has a high rating
    if (s.nextAirstamp) {
      const t = new Date(s.nextAirstamp).getTime();
      return t > now;
    }
    // TMDB shows often don't have scheduled next episodes, so include highly rated ones
    return true;
  });

  // Sort by rating (highest first), then by nearest airstamp
  const sorted = filtered.slice().sort((a, b) => {
    // Primary sort: by rating (descending)
    const ratingDiff = (b.rating ?? 0) - (a.rating ?? 0);
    if (ratingDiff !== 0) return ratingDiff;
    
    // Secondary sort: by nearest airstamp (shows with upcoming episodes first)
    const aHasAir = a.nextAirstamp ? new Date(a.nextAirstamp).getTime() : Infinity;
    const bHasAir = b.nextAirstamp ? new Date(b.nextAirstamp).getTime() : Infinity;
    return aHasAir - bHasAir;
  });

  const featured = sorted[0] ?? null;

  return (
    <div className="min-h-screen px-8 py-16">
      <main className="mx-auto max-w-5xl">
        <div className="mb-12 flex items-center justify-between">
          <div>
            <h1 className="text-6xl font-extrabold tracking-tight">Show Release Countdown</h1>
            <p className="mt-4 text-lg text-muted max-w-2xl">
              A modern, beautiful countdown to the next episode — updated in real-time. Shows sorted by the most imminent releases.
            </p>
          </div>
        </div>

        <div className="mb-8">
          <SearchBar />
        </div>

        {featured ? (
          <section className="mb-12 hero animate-in">
            <div className="featured-hero">
              <div
                className="featured-bg"
                style={{ backgroundImage: `url(${featured.image?.original ?? featured.image?.medium ?? ''})` }}
              />
              <div className="featured-overlay">
                <div className="flex items-start justify-between gap-8">
                  <div className="flex-1">
                    <div className="badge upcoming">🎬 Upcoming</div>
                    <h2 className="text-5xl font-extrabold mt-4 leading-tight">{featured.name}</h2>
                    <p className="mt-3 text-base text-muted leading-relaxed max-w-lg">
                      {featured.summary ? featured.summary.replace(/<[^>]+>/g, '').slice(0, 220) + '...' : 'No description available'}
                    </p>
                  </div>

                  <div className="text-right flex-shrink-0">
                    <div className="text-muted text-sm font-semibold">Next episode airs in</div>
                    <div className="mt-4">
                      <FeaturedCountdown iso={featured.nextAirstamp} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
        ) : null}

        <ShowsGrid shows={sorted} />
      </main>
    </div>
  );
}
