"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { TIME_ZONE_COOKIE } from "@/lib/timezone";

// The server can't see the browser's time zone, so store it in a cookie and
// re-render once if it was missing or has changed (e.g. after travelling).
export function TimeZoneSync() {
  const router = useRouter();

  useEffect(() => {
    const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
    const current = document.cookie
      .split("; ")
      .find((c) => c.startsWith(`${TIME_ZONE_COOKIE}=`))
      ?.split("=")[1];
    if (current && decodeURIComponent(current) === zone) return;

    document.cookie = `${TIME_ZONE_COOKIE}=${encodeURIComponent(zone)}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  }, [router]);

  return null;
}
