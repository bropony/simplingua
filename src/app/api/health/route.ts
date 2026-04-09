import { NextResponse } from "next/server";
import mongoose from "mongoose";

// GET /api/health — Health check for load balancer probes
export async function GET() {
  const dbState = mongoose.connection.readyState;
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const dbStatus =
    dbState === 1 ? "connected" :
    dbState === 2 ? "connecting" :
    "disconnected";

  const healthy = dbState === 1;

  return NextResponse.json(
    {
      status: healthy ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      db: dbStatus,
    },
    { status: healthy ? 200 : 503 }
  );
}
