"use client";
import { useState, useEffect, useRef } from "react";
import ShowCard from "./ShowCard";

export default function SearchBar() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    // Clear previous timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // If query is empty, clear results
    if (!q.trim()) {
      setResult(null);
      setError(null);
      setLoading(false);
      return;
    }

    // Set a new timer
    setLoading(true);
    debounceTimer.current = setTimeout(async () => {
      setError(null);
      setResult(null);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (!res.ok) {
          const js = await res.json();
          setError(js?.error ?? "Search failed");
          return;
        }
        const js = await res.json();
        setResult(js);
      } catch (e) {
        setError("Network error");
      } finally {
        setLoading(false);
      }
    }, 500); // 500ms debounce

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [q]);

  return (
    <div className="mb-8">
      <div className="relative">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search for a show (e.g. 'Loki', 'Stranger Things')..."
          className="search-input w-full"
        />
        {loading && (
          <div className="absolute right-4 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-purple-500/30 border-t-purple-500 rounded-full animate-spin" />
          </div>
        )}
      </div>

      <div className="mt-4">
        {error ? <div className="text-sm text-red-400 font-medium">⚠️ {error}</div> : null}
        {result ? (
          <div className="animate-in">
            <ShowCard show={result} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
