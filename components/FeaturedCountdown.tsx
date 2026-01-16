"use client";
import Countdown from "./Countdown";

export default function FeaturedCountdown({ iso }: { iso?: string | null }) {
  return <Countdown targetIso={iso} size="large" />;
}
