import { NextRequest, NextResponse } from "next/server";
import type { PreviewResponse } from "@/lib/types";
import {
  isAllowedFileType,
  isWithinSizeLimit,
  extractTextFromBuffer,
  validateExtractedText,
  estimateTokens,
  DIRECT_ANALYSIS_TOKEN_THRESHOLD,
} from "@/lib/extract";

export async function POST(
  request: NextRequest,
): Promise<NextResponse<PreviewResponse>> {
  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json(
        { success: false, error: "No file provided" } as PreviewResponse,
        { status: 400 },
      );
    }

    if (!isAllowedFileType(file.type, file.name)) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file type.",
        } as PreviewResponse,
        { status: 400 },
      );
    }

    if (!isWithinSizeLimit(file.size)) {
      return NextResponse.json(
        { success: false, error: "File too large." } as PreviewResponse,
        { status: 400 },
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const text = await extractTextFromBuffer(buffer, file.type, file.name);

    const textError = validateExtractedText(text);
    if (textError) {
      return NextResponse.json(
        { success: false, error: textError } as PreviewResponse,
        { status: 400 },
      );
    }

    const tokens = estimateTokens(text);

    return NextResponse.json({
      success: true,
      fileName: file.name,
      fileSize: file.size,
      extractedChars: text.length,
      estimatedTokens: tokens,
      exceedsLimit: tokens > DIRECT_ANALYSIS_TOKEN_THRESHOLD,
      tokenLimit: DIRECT_ANALYSIS_TOKEN_THRESHOLD,
      extractedText: text,
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unexpected error",
      } as PreviewResponse,
      { status: 500 },
    );
  }
}
