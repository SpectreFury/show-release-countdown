import ShowCard from "../components/ShowCard";
import SearchBar from "../components/SearchBar";
import FeaturedCountdown from "../components/FeaturedCountdown";
import { fetchShows } from "../lib/tvmaze";

export default async function Home() {
  const shows = await fetchShows();

  // sort: shows with nextAirstamp first, nearest date first
  const sorted = shows.slice().sort((a, b) => {
    if (a.nextAirstamp && b.nextAirstamp) {
      return new Date(a.nextAirstamp).getTime() - new Date(b.nextAirstamp).getTime();
    }
    if (a.nextAirstamp) return -1;
    if (b.nextAirstamp) return 1;
    return 0;
  });

  // Only keep shows that have a future nextAirstamp or that haven't premiered yet
  const now = Date.now();
  const filtered = sorted.filter((s) => {
    if (s.nextAirstamp) {
      const t = new Date(s.nextAirstamp).getTime();
      return t > now;
    }
    // if no nextAirstamp but no premiered date, it's an upcoming premiere
    if (!s.premiered) return true;
    return false;
  });

  const featured = filtered[0] ?? null;

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

        <section className="show-grid">
          <div className="col-span-full">
            <h2 className="text-2xl font-extrabold mb-4">Up Next</h2>
            <p className="text-muted text-sm">{filtered.length} shows with upcoming episodes</p>
          </div>
          {filtered.map((s, idx) => (
            <div key={s.id} style={{ animationDelay: `${idx * 50}ms` }} className="animate-in">
              <ShowCard show={s} />
            </div>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12">
              <p className="text-muted text-lg">No upcoming shows found. Try searching for one!</p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
