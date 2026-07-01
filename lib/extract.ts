// this file contains all file extraction functioins
import mammoth from "mammoth";

// declaring some constants for file processing
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB
export const MIN_TEXT_LENGTH = 50; // A sanity check. If we extracted fewer than 50 characters, something went wrong — either the PDF had no selectable text (scanned image with no OCR), the file was corrupt, or it's not actually a syllabus. 50 chars is roughly one short sentence. Below that, there's nothing meaningful to analyze.
export const CHARS_PER_TOKEN = 4; // A rough industry approximation for English text. OpenAI's tokenizer averages ~4 characters per token for English prose. It's not exact (code and URLs tokenize differently), but it's close enough for estimating whether you'll hit a limit. We use it to convert character counts into estimated token counts without needing an actual tokenizer library.
export const MODEL_TOKEN_LIMIT_NON_STREAMING = 8000; // the token limit for all models that we can send at once.

export const ALLOWED_MIME_TYPES = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
  "text/markdown",
];
