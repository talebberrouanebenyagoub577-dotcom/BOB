import { NextResponse } from "next/server";

const HOSTS = [
  "http://backend:8000",
  "http://organisat_backend:8000",
  "http://organisat-backend:8000",
];

export async function GET() {
  const results: Record<string, string> = {};

  for (const host of HOSTS) {
    try {
      const res = await fetch(`${host}/health`, {
        signal: AbortSignal.timeout(3000),
      });
      results[host] = `${res.status} ${await res.text()}`;
    } catch (e: unknown) {
      results[host] = e instanceof Error ? e.message : "error";
    }
  }

  return NextResponse.json(results);
}
