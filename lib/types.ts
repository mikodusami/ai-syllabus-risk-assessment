export interface AnalysisResult {
  course: string;
  issues: RiskIssue[];
  summary: string;
}

export interface RiskIssue {
  title: string;
  description: string;
  risk: string;
  recommendation: string;
}

export interface UploadResponse {
  success: boolean;
  data?: AnalysisResult;
  error?: string;
  debug?: DebugInfo;
}

export interface DebugInfo {
  fileName: string;
  fileSize: number;
  extractedChars: number;
  estimatedTokens: number;
  usedFallbackModel: boolean;
  model: string | undefined;
  durationMs: number;
  extractedText?: string;
  rawAiResponse?: string;
  extractionTimeMs?: number;
  apiCallTimeMs?: number;
}

// Chunked and summarize strategies are dormant — all requests use direct analysis now.
// Keeping the type for reference in case these strategies are revisited.
export type AnalysisStrategy = "direct" | "chunked" | "summarize";

export interface PreviewResponse {
  success: boolean;
  fileName: string;
  fileSize: number;
  extractedChars: number;
  estimatedTokens: number;
  exceedsLimit: boolean;
  tokenLimit: number;
  extractedText?: string;
  error?: string;
}

export interface AppConfig {
  mode: string;
  models: string[];
  defaultModel: string;
  tokenLimits: {
    nonStreaming: number;
  };
}
