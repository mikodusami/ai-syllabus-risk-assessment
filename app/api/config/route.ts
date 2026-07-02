import { NextResponse } from "next/server";
import type { AppConfig } from "@/lib/types";
import { DIRECT_ANALYSIS_TOKEN_THRESHOLD } from "@/lib/extract";

// This endpoint is dormant — the UI no longer displays model selection or token limits.
// Keeping it available for debugging purposes.

export async function GET(): Promise<NextResponse<AppConfig>> {
  const mode = process.env.NEXT_PUBLIC_APP_MODE || "production";
  const models = (process.env.VT_ARC_MODELS || "").split(",").filter(Boolean);

  return NextResponse.json({
    mode,
    models,
    defaultModel: process.env.VT_ARC_MODEL || "Kimi-K2.6-non-thinking",
    tokenLimits: {
      nonStreaming: DIRECT_ANALYSIS_TOKEN_THRESHOLD,
    },
  });
}
