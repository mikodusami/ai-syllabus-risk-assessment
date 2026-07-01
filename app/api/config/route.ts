import { NextResponse } from "next/server";
import type { AppConfig } from "@/lib/types";
import { MODEL_TOKEN_LIMIT_NON_STREAMING } from "@/lib/extract";

export async function GET(): Promise<NextResponse<AppConfig>> {
  const mode = process.env.NEXT_PUBLIC_APP_MODE || "production";
  const models = (process.env.VT_ARC_MODELS || "").split(",").filter(Boolean);

  return NextResponse.json({
    mode,
    models,
    defaultModel: process.env.VT_ARC_MODEL || "Kimi-K2.6-non-thinking",
    tokenLimits: {
      nonStreaming: MODEL_TOKEN_LIMIT_NON_STREAMING,
    },
  });
}
