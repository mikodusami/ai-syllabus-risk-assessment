"use client";

import { useState, useEffect, useRef, CSSProperties } from "react";
import axios from "axios";
import {
  UploadResponse,
  AppConfig,
  PreviewResponse,
  AnalysisStrategy,
} from "@/lib/types";
import Report from "@/components/Report";

export default function UploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [isPreviewing, setIsPreviewing] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [preview, setPreview] = useState<PreviewResponse | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [selectedModel, setSelectedModel] = useState<string>("");
  const [selectedStrategy, setSelectedStrategy] =
    useState<AnalysisStrategy>("direct");
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const [showPreviewText, setShowPreviewText] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    axios.get<AppConfig>("/api/config").then(({ data }) => {
      setConfig(data);
      setSelectedModel(data.defaultModel);
    });
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
    setResult(null);
    setPreview(null);
    setShowPreviewText(false);
    setSelectedStrategy("direct");

    if (!file) return;

    // auto preview on file seleect
    setIsPreviewing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await axios.post<PreviewResponse>(
        "/api/preview",
        formData,
      );
      setPreview(data);
      if (data.exceedsLimit) {
        setSelectedStrategy("chunked");
      }
    } catch {
      // preview is optional, doesnt block the user
    } finally {
      setIsPreviewing(false);
    }
  }

  async function handleSubmit(
    e: React.SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("strategy", selectedStrategy);
      if (selectedModel) {
        formData.append("model", selectedModel);
      }

      const { data } = await axios.post<UploadResponse>(
        "/api/analyze",
        formData,
      );
      setResult(data);
    } catch {
      setResult({ success: false, error: "Network error. Please try again." });
    } finally {
      setIsLoading(false);
    }
  }

  function handleReset() {
    setResult(null);
    setPreview(null);
    setFileName("");
    setShowExtractedText(false);
    setShowRawResponse(false);
    setShowPreviewText(false);
    setSelectedStrategy("direct");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div>
      <form onSubmit={handleSubmit} style={_styles.form}>
        <div style={_styles.uploadField}>
          <label htmlFor="syllabus-file" style={_styles.uploadLabel}>
            Upload Syllabus
          </label>
          <input
            ref={fileInputRef}
            id="syllabus-file"
            type="file"
            accept=".pdf,.docx,.txt,.md"
            onChange={handleFileChange}
            style={_styles.fileInput}
          />
          {fileName && <p style={_styles.fileNameText}>Selected: {fileName}</p>}
        </div>

        {isPreviewing && (
          <p style={_styles.previewingText}>
            Extracting text and computing metadata...
          </p>
        )}

        {preview && preview.success && (
          <div
            style={{
              ..._styles.previewBox,
              backgroundColor: preview.exceedsLimit ? "#fff3cd" : "#d4edda",
              border: `1px solid ${preview.exceedsLimit ? "#ffc107" : "#28a745"}`,
            }}
          >
            <p style={_styles.previewBoxTitle}>File Preview</p>
            <p>
              Size: {(preview.fileSize / 1024).toFixed(1)} KB ·{" "}
              {preview.extractedChars.toLocaleString()} chars · ~
              {preview.estimatedTokens.toLocaleString()} tokens
            </p>
            {preview.exceedsLimit ? (
              <p style={_styles.previewWarningText}>
                ⚠ Exceeds {preview.tokenLimit.toLocaleString()} token limit —
                choose a processing strategy below
              </p>
            ) : (
              <p style={_styles.previewOkText}>
                ✓ Within token limit, direct analysis will work
              </p>
            )}

            {preview.extractedText && (
              <div style={_styles.previewToggleWrapper}>
                <button
                  type="button"
                  onClick={() => setShowPreviewText(!showPreviewText)}
                  style={{
                    ..._styles.previewToggleButton,
                    backgroundColor: showPreviewText ? "#333" : "#fff",
                    color: showPreviewText ? "#fff" : "#333",
                  }}
                >
                  {showPreviewText ? "Hide" : "Show"} Extracted Text
                </button>
                {showPreviewText && (
                  <pre style={_styles.previewTextBlock}>
                    {preview.extractedText}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {preview && preview.exceedsLimit && (
          <div style={_styles.strategyBox}>
            <p style={_styles.strategyBoxTitle}>Processing Strategy</p>
            <div style={_styles.strategyList}>
              <label
                style={{
                  ..._styles.strategyOption,
                  backgroundColor:
                    selectedStrategy === "chunked" ? "#e3f2fd" : "transparent",
                  border:
                    selectedStrategy === "chunked"
                      ? "1px solid #2196f3"
                      : "1px solid transparent",
                }}
              >
                <input
                  type="radio"
                  name="strategy"
                  value="chunked"
                  checked={selectedStrategy === "chunked"}
                  onChange={() => setSelectedStrategy("chunked")}
                  style={_styles.radioInput}
                />
                <div>
                  <strong>Chunked Analysis</strong>
                  <p style={_styles.strategyDescription}>
                    Splits the document into chunks, analyzes each
                    independently, then merges results. More thorough but uses
                    multiple API calls.
                  </p>
                </div>
              </label>
              <label
                style={{
                  ..._styles.strategyOption,
                  backgroundColor:
                    selectedStrategy === "summarize"
                      ? "#e3f2fd"
                      : "transparent",
                  border:
                    selectedStrategy === "summarize"
                      ? "1px solid #2196f3"
                      : "1px solid transparent",
                }}
              >
                <input
                  type="radio"
                  name="strategy"
                  value="summarize"
                  checked={selectedStrategy === "summarize"}
                  onChange={() => setSelectedStrategy("summarize")}
                  style={_styles.radioInput}
                />
                <div>
                  <strong>Summarize then Analyze</strong>
                  <p style={_styles.strategyDescription}>
                    First extracts just assignments/assessments from each chunk,
                    then analyzes the condensed list. Faster, focuses only on
                    relevant content.
                  </p>
                </div>
              </label>
            </div>
          </div>
        )}

        {config && (
          <div style={_styles.modelBox}>
            <label htmlFor="model-select" style={_styles.modelLabel}>
              Model
            </label>
            <select
              id="model-select"
              value={selectedModel}
              onChange={(e) => setSelectedModel(e.target.value)}
              style={_styles.modelSelect}
            >
              {config.models.map((model) => (
                <option key={model} value={model}>
                  {model}
                  {model === config.defaultModel ? " (default)" : ""}
                </option>
              ))}
            </select>
            <p style={_styles.modelTokenLimitText}>
              Token limit per request:{" "}
              {config.tokenLimits.nonStreaming.toLocaleString()}
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!fileName || isLoading || isPreviewing}
          style={{
            ..._styles.submitButton,
            backgroundColor:
              isLoading || !fileName || isPreviewing ? "#ccc" : "#000",
            cursor:
              isLoading || !fileName || isPreviewing
                ? "not-allowed"
                : "pointer",
          }}
        >
          {isLoading ? "Analyzing..." : "Analyze Syllabus"}
        </button>
      </form>

      {isLoading && (
        <p style={_styles.loadingText}>
          {selectedStrategy === "direct"
            ? "Sending syllabus to AI for analysis..."
            : selectedStrategy === "chunked"
              ? "Processing chunks and merging results..."
              : "Extracting assignments and analyzing..."}{" "}
          This may take a moment.
        </p>
      )}

      {result && !result.success && (
        <div style={_styles.errorBox}>
          <p style={_styles.errorTitle}>Error</p>
          <p>{result.error}</p>
        </div>
      )}

      {result?.success && result.data && (
        <div>
          {result.debug && (
            <div style={_styles.debugBox}>
              <p style={_styles.debugTitle}>Processing Metadata</p>
              <div style={_styles.debugGrid}>
                <p>
                  <strong>File:</strong> {result.debug.fileName}
                </p>
                <p>
                  <strong>Size:</strong>{" "}
                  {(result.debug.fileSize / 1024).toFixed(1)} KB
                </p>
                <p>
                  <strong>Extracted:</strong>{" "}
                  {result.debug.extractedChars.toLocaleString()} chars
                </p>
                <p>
                  <strong>Tokens (est):</strong>{" "}
                  {result.debug.estimatedTokens.toLocaleString()}
                </p>
                <p>
                  <strong>Model:</strong> {result.debug.model}
                </p>
                <p>
                  <strong>Strategy:</strong> {result.debug.strategy}
                </p>
                {result.debug.chunksProcessed && (
                  <p>
                    <strong>Chunks:</strong> {result.debug.chunksProcessed}
                  </p>
                )}
                <p>
                  <strong>Total time:</strong>{" "}
                  {(result.debug.durationMs / 1000).toFixed(2)}s
                </p>
                {result.debug.extractionTimeMs !== undefined && (
                  <p>
                    <strong>Extraction:</strong> {result.debug.extractionTimeMs}
                    ms
                  </p>
                )}
                {result.debug.apiCallTimeMs !== undefined && (
                  <p>
                    <strong>API call:</strong>{" "}
                    {(result.debug.apiCallTimeMs / 1000).toFixed(2)}s
                  </p>
                )}
              </div>

              {result.debug.extractedText && (
                <div style={_styles.debugToggleWrapper}>
                  <button
                    type="button"
                    onClick={() => setShowExtractedText(!showExtractedText)}
                    style={{
                      ..._styles.debugToggleButtonFirst,
                      backgroundColor: showExtractedText ? "#333" : "#fff",
                      color: showExtractedText ? "#fff" : "#333",
                    }}
                  >
                    {showExtractedText ? "Hide" : "Show"} Extracted Text
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowRawResponse(!showRawResponse)}
                    style={{
                      ..._styles.debugToggleButton,
                      backgroundColor: showRawResponse ? "#333" : "#fff",
                      color: showRawResponse ? "#fff" : "#333",
                    }}
                  >
                    {showRawResponse ? "Hide" : "Show"} Raw AI Response
                  </button>

                  {showExtractedText && (
                    <pre style={_styles.debugExtractedTextBlock}>
                      {result.debug.extractedText}
                    </pre>
                  )}

                  {showRawResponse && result.debug.rawAiResponse && (
                    <pre style={_styles.debugRawResponseBlock}>
                      {result.debug.rawAiResponse}
                    </pre>
                  )}
                </div>
              )}
            </div>
          )}

          <Report data={result.data} />

          <button onClick={handleReset} style={_styles.resetButton}>
            Analyze Another Syllabus
          </button>
        </div>
      )}
    </div>
  );
}

const _styles = {
  form: { marginBottom: "2rem" },
  uploadField: { marginBottom: "1rem" },
  uploadLabel: { display: "block", fontWeight: "bold", marginBottom: "0.5rem" },
  fileInput: { display: "block" },
  fileNameText: { marginTop: "0.5rem", fontSize: "0.875rem", color: "#555" },
  previewingText: { fontSize: "0.8rem", color: "#666" },

  previewBox: {
    marginBottom: "1rem",
    padding: "1rem",
    fontSize: "0.8rem",
    fontFamily: "monospace",
  },
  previewBoxTitle: { fontWeight: "bold", marginBottom: "0.5rem" },
  previewWarningText: {
    color: "#856404",
    fontWeight: "bold",
    marginTop: "0.5rem",
  },
  previewOkText: { color: "#155724", marginTop: "0.25rem" },
  previewToggleWrapper: { marginTop: "0.5rem" },
  previewToggleButton: {
    fontSize: "0.75rem",
    padding: "0.2rem 0.5rem",
    border: "1px solid #999",
    cursor: "pointer",
  },
  previewTextBlock: {
    marginTop: "0.5rem",
    padding: "0.75rem",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    maxHeight: "200px",
    overflow: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "0.7rem",
    lineHeight: "1.4",
  },

  strategyBox: {
    marginBottom: "1rem",
    padding: "1rem",
    backgroundColor: "#f0f7ff",
    border: "1px solid #b3d4fc",
  },
  strategyBoxTitle: {
    fontWeight: "bold",
    marginBottom: "0.75rem",
    fontSize: "0.875rem",
  },
  strategyList: { display: "flex", flexDirection: "column", gap: "0.5rem" },
  strategyOption: {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.5rem",
    cursor: "pointer",
    padding: "0.5rem",
  },
  radioInput: { marginTop: "0.2rem" },
  strategyDescription: {
    fontSize: "0.75rem",
    color: "#555",
    margin: "0.25rem 0 0",
  },

  modelBox: {
    marginBottom: "1rem",
    padding: "1rem",
    backgroundColor: "#f8f9fa",
    border: "1px solid #dee2e6",
  },
  modelLabel: {
    display: "block",
    fontWeight: "bold",
    marginBottom: "0.5rem",
    fontSize: "0.875rem",
  },
  modelSelect: {
    width: "100%",
    padding: "0.5rem",
    fontSize: "0.875rem",
    border: "1px solid #ccc",
  },
  modelTokenLimitText: {
    marginTop: "0.5rem",
    fontSize: "0.75rem",
    color: "#666",
  },

  submitButton: {
    padding: "0.75rem 1.5rem",
    color: "#fff",
    border: "none",
    fontSize: "1rem",
    fontWeight: "bold",
  },
  loadingText: { color: "#555" },

  errorBox: {
    padding: "1rem",
    border: "1px solid #cc0000",
    backgroundColor: "#fff5f5",
    marginBottom: "1rem",
  },
  errorTitle: { color: "#cc0000", fontWeight: "bold" },

  debugBox: {
    padding: "1rem",
    backgroundColor: "#f5f5f5",
    border: "1px solid #ddd",
    marginBottom: "1.5rem",
    fontSize: "0.8rem",
    fontFamily: "monospace",
  },
  debugTitle: {
    fontWeight: "bold",
    marginBottom: "0.75rem",
    fontSize: "0.9rem",
  },
  debugGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.5rem" },
  debugToggleWrapper: { marginTop: "1rem" },
  debugToggleButtonFirst: {
    fontSize: "0.8rem",
    padding: "0.25rem 0.75rem",
    border: "1px solid #999",
    cursor: "pointer",
    marginRight: "0.5rem",
  },
  debugToggleButton: {
    fontSize: "0.8rem",
    padding: "0.25rem 0.75rem",
    border: "1px solid #999",
    cursor: "pointer",
  },
  debugExtractedTextBlock: {
    marginTop: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "#fff",
    border: "1px solid #ccc",
    maxHeight: "300px",
    overflow: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "0.7rem",
    lineHeight: "1.4",
  },
  debugRawResponseBlock: {
    marginTop: "0.75rem",
    padding: "0.75rem",
    backgroundColor: "#fffde6",
    border: "1px solid #e6d900",
    maxHeight: "300px",
    overflow: "auto",
    whiteSpace: "pre-wrap",
    wordBreak: "break-word",
    fontSize: "0.7rem",
    lineHeight: "1.4",
  },

  resetButton: {
    marginTop: "2rem",
    padding: "0.5rem 1rem",
    border: "1px solid #000",
    backgroundColor: "#fff",
    cursor: "pointer",
    fontSize: "0.875rem",
  },
} satisfies Record<string, CSSProperties>;
