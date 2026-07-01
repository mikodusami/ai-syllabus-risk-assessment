export interface AnalysisResult {
  course: string;
  riskLevel: number; // changing this to a number, on a scale of 1-100 then will translate this into low / medium / high risk level or some other code, definitions of numbers will need to be handled, I believe if we do the number scale, it could be more accurate but we need to define this scale.
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
  strategy?: AnalysisStrategy;
  chunksProcessed?: number;
}

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
