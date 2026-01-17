"use client";
import { useState } from "react";
import Countdown from "../components/Countdown";

type Props = {
  show: any;
};

export default function ShowCard({ show }: Props) {
  const next = show.nextEpisode ?? null;
  const airstamp = show.nextAirstamp ?? null;

  const [imgError, setImgError] = useState(false);

  return (
    <article className="card-large group overflow-hidden rounded-2xl border border-purple-500/10 bg-gradient-to-br from-slate-900/40 via-purple-900/20 to-slate-900/40 backdrop-blur-md transition-all duration-300 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/20">
      {/* Image Container */}
      <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 via-blue-500/5 to-pink-500/10">
        <div className="aspect-video overflow-hidden">
          {show.image?.original ? (
            <img
              src={show.image.original}
              alt={show.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : show.image?.medium && !imgError ? (
            <img
              src={show.image.medium}
              alt={show.name}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              loading="lazy"
              decoding="async"
              onError={() => setImgError(true)}
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600">
              <span className="text-4xl font-bold text-white">
                {show.name
                  .split(" ")
                  .map((s: string) => s[0])
                  .slice(0, 2)
                  .join("")}
              </span>
            </div>
          )}
        </div>
        
        {/* Rating Badge - Overlay on image */}
        {show.rating && (
          <div className="absolute top-3 right-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-amber-400/90 to-yellow-400/90 backdrop-blur-sm text-xs font-bold text-amber-950 shadow-lg">
            ★ {show.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Content Container */}
      <div className="flex flex-col gap-4 p-5">
        {/* Title and Network */}
        <div className="space-y-2">
          <h3 className="text-2xl font-extrabold leading-tight text-white">
            {show.name}
          </h3>
          <div className="flex items-center gap-3 text-sm text-slate-400">
            <span className="inline-flex items-center">
              {show.network?.name ? (
                <>
                  <span className="text-purple-400 font-semibold">{show.network.name}</span>
                </>
              ) : (
                <span className="text-slate-500">Streaming</span>
              )}
            </span>
            {show.premiered && (
              <>
                <span className="text-slate-600">•</span>
                <span className="text-slate-500">Premiered {show.premiered}</span>
              </>
            )}
          </div>
        </div>

        {/* Summary */}
        {show.summary && (
          <p className="text-sm leading-relaxed text-slate-300 line-clamp-2">
            {show.summary.replace(/<[^>]+>/g, '')}
          </p>
        )}

        {/* Next Episode Info and Countdown */}
        <div className="flex items-end justify-between gap-4 pt-2 border-t border-slate-700/50">
          <div className="space-y-1">
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-500">Next Episode</div>
            <div className="text-lg font-bold text-accent-purple">
              {next ? (
                `Season ${next.season_number ?? next.season} • Episode ${next.episode_number ?? next.number}`
              ) : (
                "TBA"
              )}
            </div>
            {airstamp && (
              <div className="text-xs text-slate-400">
                {new Date(airstamp).toLocaleDateString('en-US', { 
                  month: 'short', 
                  day: 'numeric', 
                  year: 'numeric' 
                })}
              </div>
            )}
          </div>

          {/* Countdown */}
          <div className="flex-shrink-0">
            <Countdown targetIso={airstamp} size="large" />
          </div>
        </div>
      </div>
    </article>
  );
}
