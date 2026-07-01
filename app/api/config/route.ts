import { NextResponse } from "next/server";
import type { AppConfig } from "@/lib/types";
import {
  PRIMARY_MODEL_TOKEN_LIMIT,
  FALLBACK_MODEL_TOKEN_LIMIT,
} from "@/lib/extract";

export async function GET(): Promise<NextResponse<AppConfig>> {
  const mode = process.env.NEXT_PUBLIC_APP_MODE || "production";
  const models = (process.env.VT_ARC_MODELS || "").split(",").filter(Boolean);

  return NextResponse.json({
    mode,
    models,
    defaultModel: process.env.VT_ARC_MODEL || "Kimi-K2.6-non-thinking",
    tokenLimits: {
      nonStreaming: PRIMARY_MODEL_TOKEN_LIMIT,
      maxFallback: FALLBACK_MODEL_TOKEN_LIMIT,
    },
  });
}
