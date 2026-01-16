"use client";
import { useEffect, useState } from "react";

type Props = {
  targetIso?: string | null;
  size?: "normal" | "large";
};

function msToParts(ms: number) {
  if (ms <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0 };
  const total = Math.floor(ms / 1000);
  const days = Math.floor(total / 86400);
  const hours = Math.floor((total % 86400) / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;
  return { days, hours, minutes, seconds };
}

export default function Countdown({ targetIso, size = "normal" }: Props) {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!targetIso) {
    return <div className="muted text-sm">No date</div>;
  }

  const target = new Date(targetIso).getTime();
  const diff = target - now;
  const { days, hours, minutes, seconds } = msToParts(diff);

  if (diff <= 0) {
    const cls = size === "large" ? "countdown-pill-large" : "countdown-pill";
    return <div className={cls}>Dropped</div>;
  }

  const withinHour = diff <= 1000 * 60 * 60;
  const cls = size === "large" ? `countdown-pill-large ${withinHour ? 'pulse' : ''}` : 'countdown-pill';

  if (size === 'large') {
    return (
      <div className={cls} aria-hidden>
        <div className="text-xs text-muted font-semibold" style={{ lineHeight: '1' }}>ETA</div>
        <div className="countdown-strong" style={{ marginTop: '2px' }}>
          {days > 0 ? `${days}d ` : ""}
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className={cls} aria-hidden>
        <div className="text-xs muted">ETA</div>
        <div className="countdown-strong" style={{ fontSize: 18 }}>
          {days > 0 ? `${days}d ` : ""}
          {String(hours).padStart(2, "0")}:{String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
        </div>
      </div>
    </div>
  );
}
