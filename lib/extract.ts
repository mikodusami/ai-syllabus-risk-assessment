// this file contains all file extraction functioins
import mammoth from "mammoth";

// declaring some constants for file processing
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MIN_TEXT_LENGTH = 50; // A sanity check. If we extracted fewer than 50 characters, something went wrong — either the PDF had no selectable text (scanned image with no OCR), the file was corrupt, or it's not actually a syllabus. 50 chars is roughly one short sentence. Below that, there's nothing meaningful to analyze.
export const CHARS_PER_TOKEN = 4; // A rough industry approximation for English text. OpenAI's tokenizer averages ~4 characters per token for English prose. It's not exact (code and URLs tokenize differently), but it's close enough for estimating whether you'll hit a limit. We use it to convert character counts into estimated token counts without needing an actual tokenizer library.
// DORMANT — No longer used. There is no artificial input token cap.
// The 8,000 token limit applies to API *output*, not input. Keeping for reference.
export const DIRECT_ANALYSIS_TOKEN_THRESHOLD = 8000;

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];

/**
 * Checks whether a file's MIME type or extension is in the set of accepted formats.
 *
 * Accepted formats: PDF, DOCX, plain text (.txt), and Markdown (.md).
 * Falls back to extension matching when the MIME type is empty or incorrect
 * (common with drag-and-drop uploads or non-standard OS configurations).
 *
 * @param mimeType - The MIME type reported by the browser (e.g. "application/pdf").
 *                   May be empty or inaccurate depending on the client.
 * @param fileName - The original filename including extension (e.g. "syllabus.pdf").
 * @returns `true` if the file is an accepted type for processing.
 */
export function isAllowedFileType(mimeType: string, fileName: string): boolean {
  return (
    isPlainTextFile(mimeType, fileName) ||
    isPdfFile(mimeType, fileName) ||
    isDocxFile(mimeType, fileName)
  );
}

/**
 * Checks whether a file's byte size is within the maximum upload limit.
 *
 * The limit is defined by MAX_FILE_SIZE. Files at or below the limit
 * are accepted; files exceeding it are rejected.
 *
 * @param fileSize - The file size in bytes.
 * @returns `true` if the file is within the allowed size.
 */
export function isWithinSizeLimit(fileSize: number): boolean {
  return fileSize <= MAX_FILE_SIZE;
}

/**
 * Determines whether a file should be decoded as UTF-8 plain text.
 *
 * Matches files with MIME types "text/plain" or "text/markdown",
 * or filenames ending in ".txt" or ".md". These files are read directly
 * as strings without any binary parsing.
 *
 * Note: Extension matching is case-sensitive — ".TXT" will not match.
 *
 * @param mimeType - The MIME type of the file.
 * @param fileName - The filename including extension.
 * @returns `true` if the file should be treated as plain text.
 */
export function isPlainTextFile(mimeType: string, fileName: string): boolean {
  return (
    mimeType === "text/plain" ||
    mimeType === "text/markdown" ||
    fileName.endsWith(".txt") ||
    fileName.endsWith(".md")
  );
}

/**
 * Determines whether a file is a PDF document.
 *
 * Matches the "application/pdf" MIME type or the ".pdf" file extension.
 * PDF files require binary parsing via pdf-parse/pdfjs-dist.
 *
 * Note: Extension matching is case-sensitive — ".PDF" will not match.
 *
 * @param mimeType - The MIME type of the file.
 * @param fileName - The filename including extension.
 * @returns `true` if the file is a PDF.
 */
export function isPdfFile(mimeType: string, fileName: string): boolean {
  return mimeType === "application/pdf" || fileName.endsWith(".pdf");
}

/**
 * Determines whether a file is a DOCX (Office Open XML) document.
 *
 * Matches the DOCX MIME type or the ".docx" file extension.
 * Does NOT match legacy ".doc" files (application/msword) or other
 * Office XML formats like .xlsx or .pptx.
 *
 * Note: Extension matching is case-sensitive — ".DOCX" will not match.
 *
 * @param mimeType - The MIME type of the file.
 * @param fileName - The filename including extension.
 * @returns `true` if the file is a DOCX document.
 */
export function isDocxFile(mimeType: string, fileName: string): boolean {
  return (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    fileName.endsWith(".docx")
  );
}

/**
 * Decodes a Buffer as UTF-8 text.
 *
 * Used for plain text and Markdown files where no binary parsing is needed.
 * Preserves all whitespace, newlines, and Unicode characters.
 *
 * @param buffer - The raw file contents as a Node.js Buffer.
 * @returns The decoded string content.
 */
export function extractPlainText(buffer: Buffer): string {
  return buffer.toString("utf-8");
}

/**
 * Extracts readable text content from a PDF file buffer.
 *
 * Uses pdf-parse (which wraps pdfjs-dist) to parse the binary PDF structure
 * and extract all text layers. Scanned PDFs without an OCR text layer will
 * return empty or minimal text.
 *
 * @param buffer - The raw PDF file contents as a Node.js Buffer.
 * @returns The extracted text content.
 * @throws If the buffer is not a valid PDF or is empty/corrupt.
 */
export async function extractPdfText(buffer: Buffer): Promise<string> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  const result = await parser.getText();
  return result.text;
}

/**
 * Extracts readable text content from a DOCX file buffer.
 *
 * Uses mammoth to parse the Office Open XML structure and extract raw text,
 * stripping all formatting, styles, and embedded objects.
 *
 * @param buffer - The raw DOCX file contents as a Node.js Buffer.
 * @returns The extracted text content.
 * @throws If the buffer is not a valid DOCX archive or is empty/corrupt.
 */
export async function extractDocxText(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/**
 * Routes a file buffer to the appropriate text extraction function based
 * on its MIME type and filename extension.
 *
 * Checks file type in order: plain text → PDF → DOCX.
 * Returns an empty string for unrecognized file types (should not occur
 * if isAllowedFileType was checked first).
 *
 * @param buffer - The raw file contents as a Node.js Buffer.
 * @param mimeType - The MIME type of the file.
 * @param fileName - The filename including extension.
 * @returns The extracted text, or an empty string if type is unrecognized.
 */
export async function extractTextFromBuffer(
  buffer: Buffer,
  mimeType: string,
  fileName: string,
): Promise<string> {
  if (isPlainTextFile(mimeType, fileName)) {
    return extractPlainText(buffer);
  }

  if (isPdfFile(mimeType, fileName)) {
    return extractPdfText(buffer);
  }

  if (isDocxFile(mimeType, fileName)) {
    return extractDocxText(buffer);
  }

  return "";
}

/**
 * Validates that extracted text is long enough to be a meaningful syllabus.
 *
 * Returns a user-facing error message if the text is empty (extraction failed)
 * or below MIN_TEXT_LENGTH (50 chars, likely a parsing failure).
 * Returns null if the text is valid for analysis.
 *
 * Trims leading/trailing whitespace before measuring length.
 *
 * @param text - The extracted text content to validate.
 * @returns An error message string if invalid, or `null` if valid.
 */
export function validateExtractedText(text: string): string | null {
  const trimmed = text.trim();

  if (trimmed.length === 0) {
    return "Could not extract any text from this file. Please try a different format (TXT or MD work best).";
  }

  if (trimmed.length < MIN_TEXT_LENGTH) {
    return "Extracted text is too short to analyze (less than 50 characters). The file may not have parsed correctly.";
  }

  return null;
}

/**
 * Estimates the number of LLM tokens in a text string.
 *
 * Uses the approximation of ~4 characters per token (CHARS_PER_TOKEN),
 * which is accurate for typical English prose. Results are rounded up
 * via Math.ceil so a partial token still counts.
 *
 * This is an estimate — actual tokenization depends on the model's
 * tokenizer and varies for code, URLs, and non-Latin scripts.
 *
 * @param text - The text to estimate token count for.
 * @returns The estimated token count (always >= 0).
 */
export function estimateTokens(text: string): number {
  return Math.ceil(text.length / CHARS_PER_TOKEN);
}

/**
 * Truncates text to fit within the fallback model's maximum token budget.
 *
 * If the text is within the limit, returns it unchanged.
/**
 * DORMANT — No longer used in production. There is no artificial input token cap.
 *
 * Previously truncated text to fit within an assumed input token limit.
 * Kept for test compatibility and reference.
 *
 * @param text - The text to potentially truncate.
 * @returns The original text if within limit, or a truncated version.
 */
export function truncateToTokenLimit(text: string): string {
  const tokens = estimateTokens(text);

  if (tokens <= DIRECT_ANALYSIS_TOKEN_THRESHOLD) {
    return text;
  }

  const maxChars = DIRECT_ANALYSIS_TOKEN_THRESHOLD * CHARS_PER_TOKEN;
  return text.slice(0, maxChars);
}

/**
 * Extracts a JSON object from an LLM response that may contain surrounding noise.
 *
 * Handles three common patterns from LLM output:
 * 1. JSON wrapped in markdown code fences (```json ... ```)
 * 2. JSON preceded by preamble text ("Here is the analysis: {...}")
 * 3. JSON followed by trailing commentary ({...} "Hope this helps!")
 *
 * Strategy: strips code fences first, then finds the outermost { and }
 * and returns everything between them (inclusive).
 *
 * If no braces are found, returns the cleaned string as-is and lets
 * the caller's JSON.parse throw a descriptive error.
 *
 * @param raw - The raw string response from the LLM.
 * @returns A string that should be parseable as JSON.
 */
export function extractJson(raw: string): string {
  // Try 1: Strip code fences
  const cleaned = raw
    .replace(/^```(?:json)?\s*\n?/im, "")
    .replace(/\n?```\s*$/im, "")
    .trim();

  // Try 2: Find the first '{' and last '}' to extract the JSON object
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1);
  }

  // Fallback: return cleaned and let JSON.parse throw a descriptive error
  return cleaned;
}
