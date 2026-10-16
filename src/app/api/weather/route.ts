import { NextResponse } from "next/server";

export const revalidate = 900; // Cache 15 menit

export async function GET() {
  try {
    const res = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=-7.2575&longitude=112.7521&current=weather_code&timezone=Asia%2FJakarta",
      {
        next: { revalidate: 900 },
        headers: {
          "Accept": "application/json",
          "User-Agent": "Portfolio-Evan-Atharasya/1.0",
        },
      }
    );

    if (!res.ok) {
      return NextResponse.json(
        { ok: false, error: `Upstream error: ${res.status}` },
        { status: 502 }
      );
    }

    const data = await res.json();
    const code = data?.current?.weather_code;

    if (typeof code !== "number") {
      return NextResponse.json(
        { ok: false, error: "Invalid weather code from upstream" },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        code,
        city: "Surabaya",
        source: "open-meteo",
        timestamp: Date.now(),
      },
      {
        headers: {
          "Cache-Control": "public, s-maxage=900, stale-while-revalidate=1800",
        },
      }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
