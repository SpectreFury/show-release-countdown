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
    <article className="card flex flex-col sm:flex-row w-full gap-4 rounded-2xl p-5 relative overflow-hidden group">
      {/* Background accent */}
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Left: Image */}
      <div className="h-32 w-44 flex-shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-purple-500/20 via-blue-500/10 to-pink-500/10 relative z-10">
        {show.image?.medium && !imgError ? (
          <img
            src={show.image.medium}
            alt={show.name}
            className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            decoding="async"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-amber-400 via-pink-500 to-purple-600 text-white">
            <span className="text-base font-bold">
              {show.name
                .split(" ")
                .map((s: string) => s[0])
                .slice(0, 2)
                .join("")}
            </span>
          </div>
        )}
      </div>

      {/* Middle: Show info */}
      <div className="flex flex-1 flex-col justify-between min-w-0 relative z-10 gap-2">
        <div className="min-w-0">
          <h3 className="text-xl font-extrabold tracking-tight line-clamp-1">{show.name}</h3>
          <p className="mt-1 text-xs text-muted line-clamp-1">
            {show.network?.name ?? show.type ?? "Streaming"} • {show.premiered ?? "—"}
          </p>
        </div>

        <div>
          <div className="text-xs text-muted font-semibold">Next</div>
          <div className="text-sm font-semibold text-accent-purple">{next ? `S${next.season} E${next.number}` : "TBA"}</div>
        </div>
      </div>

      {/* Right: Countdown (COMPACT) */}
      <div className="flex items-center justify-center sm:justify-end flex-shrink-0 relative z-10">
        <Countdown targetIso={airstamp} size="large" />
      </div>
    </article>
  );
}
