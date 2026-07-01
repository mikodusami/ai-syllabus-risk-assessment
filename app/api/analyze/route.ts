import { NextRequest, NextResponse } from "next/server";
import { analyzeDirect, analyzeChunked, analyzeSummarize } from "@/lib/api";
import type {
  UploadResponse,
  AnalysisResult,
  AnalysisStrategy,
} from "@/lib/types";
import {
  isAllowedFileType,
  isWithinSizeLimit,
  extractTextFromBuffer,
  validateExtractedText,
  estimateTokens,
  extractJson,
  MODEL_TOKEN_LIMIT_NON_STREAMING,
} from "@/lib/extract";

const isDev = process.env.NEXT_PUBLIC_APP_MODE === "development";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<UploadResponse>> {
  const startTime = Date.now();

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const modelOverride = formData.get("model") as string | null;
    const strategy = (formData.get("strategy") as AnalysisStrategy) || "direct";
    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" },
        { status: 400 },
      );
    }

    if (!isAllowedFileType(file.type, file.name)) {
      return NextResponse.json(
        {
          success: false,
          error:
            "Invalid file type. Please upload a PDF, DOCX, TXT, or Markdown file.",
        },
        { status: 400 },
      );
    }

    if (!isWithinSizeLimit(file.size)) {
      return NextResponse.json(
        { success: false, error: "File too large. Maximum size is 10MB." },
        { status: 400 },
      );
    }

    const extractionStart = Date.now();
    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromBuffer(buffer, file.type, file.name);
    const extractionTimeMs = Date.now() - extractionStart;

    const textError = validateExtractedText(text);
    if (textError) {
      return NextResponse.json(
        { success: false, error: textError },
        { status: 400 },
      );
    }

    const tokens = estimateTokens(text);
    const model = modelOverride || process.env.VT_ARC_MODEL;

    if (isDev) {
      console.log(`[Analyze] File: ${file.name} (${file.size} bytes)`);
      console.log(
        `[Analyze] Extracted: ${text.length} chars, ~${tokens} tokens`,
      );
      console.log(`[Analyze] Strategy: ${strategy}, Model: ${model}`);
    }

    // If direct strategy but text exceeds limit, reject with helpful message
    if (strategy === "direct" && tokens > PRIMARY_MODEL_TOKEN_LIMIT) {
      return NextResponse.json(
        {
          success: false,
          error: `Text exceeds ${PRIMARY_MODEL_TOKEN_LIMIT.toLocaleString()} token limit (estimated ${tokens.toLocaleString()} tokens). Please use "chunked" or "summarize" strategy.`,
        },
        { status: 400 },
      );
    }

    const apiCallStart = Date.now();
    let rawResponse: string;
    let chunksProcessed: number | undefined;

    switch (strategy) {
      case "chunked": {
        const result = await analyzeChunked(text, model || undefined);
        rawResponse = result.rawResponse;
        chunksProcessed = result.chunksProcessed;
        break;
      }
      case "summarize": {
        const result = await analyzeSummarize(text, model || undefined);
        rawResponse = result.rawResponse;
        chunksProcessed = result.chunksProcessed;
        break;
      }
      default: {
        rawResponse = await analyzeDirect(text, model || undefined);
        break;
      }
    }

    const apiCallTimeMs = Date.now() - apiCallStart;

    const jsonStr = extractJson(rawResponse);
    const analysis: AnalysisResult = JSON.parse(jsonStr);

    const duration = Date.now() - startTime;
    if (isDev) console.log(`[Analyze] Complete in ${duration}ms`);

    return NextResponse.json({
      success: true,
      data: analysis,
      debug: {
        fileName: file.name,
        fileSize: file.size,
        extractedChars: text.length,
        estimatedTokens: tokens,
        usedFallbackModel: false,
        model,
        durationMs: duration,
        extractionTimeMs,
        apiCallTimeMs,
        strategy,
        chunksProcessed,
        extractedText: text,
        rawAiResponse: rawResponse,
      },
    });
  } catch (error) {
    if (isDev) console.error("Analysis error:", error);

    let message: string;
    if (error instanceof SyntaxError) {
      message =
        "Failed to parse AI response. The model returned invalid JSON. Please try again.";
    } else if (error instanceof Error) {
      message = error.message;
    } else {
      message = "An unexpected error occurred.";
    }

    return NextResponse.json(
      { success: false, error: message },
      { status: 500 },
    );
  }
}
