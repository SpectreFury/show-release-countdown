"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import ShowCard from "./ShowCard";
import PlatformFilter from "./PlatformFilter";

type Props = {
  shows: any[];
};

export default function ShowsGrid({ shows }: Props) {
  const [selectedPlatform, setSelectedPlatform] = useState<string | null>(null);
  const [displayedShows, setDisplayedShows] = useState<any[]>(shows);
  const [isLoading, setIsLoading] = useState(false);
  const [page, setPage] = useState(1); // TMDB uses 1-based pagination
  const [hasMore, setHasMore] = useState(true);
  const observerTarget = useRef<HTMLDivElement>(null);

  // When platform is selected, reset and fetch from API
  useEffect(() => {
    if (selectedPlatform) {
      setPage(1); // Start at page 1 for TMDB
      setDisplayedShows([]);
      setHasMore(true);
      fetchShowsFromPlatform(selectedPlatform, 1);
    } else {
      // Show default shows
      setDisplayedShows(shows);
      setPage(1);
      setHasMore(false);
    }
  }, [selectedPlatform]);

  const fetchShowsFromPlatform = useCallback(
    async (platform: string, pageNum: number) => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `/api/shows?platform=${encodeURIComponent(platform)}&page=${pageNum}`
        );
        const data = await response.json();

        if (data.error) {
          console.error('API Error:', data.error);
          setHasMore(false);
          setIsLoading(false);
          return;
        }

        if (data.shows && data.shows.length > 0) {
          setDisplayedShows((prev) => [...prev, ...data.shows]);
          setPage(pageNum + 1);
          // TMDB returns up to 20 per page, if less assume we're done
          if (data.shows.length < 20) {
            setHasMore(false);
          }
        } else {
          setHasMore(false);
        }
      } catch (error) {
        console.error("Error fetching shows:", error);
        setHasMore(false);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!selectedPlatform || !hasMore || isLoading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        fetchShowsFromPlatform(selectedPlatform, page);
      }
    });

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      if (observerTarget.current) {
        observer.unobserve(observerTarget.current);
      }
    };
  }, [selectedPlatform, page, hasMore, isLoading, fetchShowsFromPlatform]);

  return (
    <>
      <PlatformFilter onFilterChange={setSelectedPlatform} />

      <section className="show-grid">
        <div className="col-span-full">
          <h2 className="text-2xl font-extrabold mb-4">
            {selectedPlatform ? `${selectedPlatform} Shows` : "Top Rated Upcoming Shows"}
          </h2>
          <p className="text-muted text-sm">
            {selectedPlatform
              ? `Showing all upcoming shows on ${selectedPlatform}`
              : `${displayedShows.length} shows with ratings ≥ 7.0 and upcoming episodes`}
          </p>
        </div>

        {displayedShows.length === 0 && !isLoading ? (
          <div className="col-span-full text-center py-12">
            <p className="text-muted text-lg">
              {selectedPlatform
                ? `No upcoming shows found on ${selectedPlatform}. Try another platform!`
                : "No shows found. Try searching for one!"}
            </p>
          </div>
        ) : (
          <>
            {displayedShows.map((s, idx) => (
              <div
                key={`${s.id}-${idx}`}
                style={{ animationDelay: `${(idx % 20) * 50}ms` }}
                className="animate-in"
              >
                <ShowCard show={s} />
              </div>
            ))}

            {/* Infinite scroll trigger */}
            {selectedPlatform && hasMore && (
              <div ref={observerTarget} className="col-span-full py-8 text-center">
                {isLoading ? (
                  <p className="text-muted">Loading more shows...</p>
                ) : (
                  <p className="text-muted text-sm">Scroll to load more</p>
                )}
              </div>
            )}

            {/* No more shows message */}
            {selectedPlatform && !hasMore && displayedShows.length > 0 && (
              <div className="col-span-full text-center py-8">
                <p className="text-muted text-sm">No more upcoming shows available</p>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}
