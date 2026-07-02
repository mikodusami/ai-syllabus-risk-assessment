"use client";

import { useState, useRef, CSSProperties } from "react";
import axios from "axios";
import { UploadResponse } from "@/lib/types";
import Report from "@/components/Report";

export default function UploadForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [fileName, setFileName] = useState<string>("");
  const [showExtractedText, setShowExtractedText] = useState(false);
  const [showRawResponse, setShowRawResponse] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Dormant features ---
  // Model selection, file preview (token estimation), and strategy selection
  // (chunked/summarize) are commented out. All requests now use direct analysis
  // with the full syllabus text sent in a single API call.
  //
  // Rationale:
  // - The 8,000 token threshold was an artificial input cap based on a misunderstanding
  //   of the API's output token limit. The models accept much larger inputs.
  // - Chunked analysis splits context, causing the model to flag issues that wouldn't
  //   exist if it could see the full syllabus (e.g., a policy in section A that mitigates
  //   a risk in section B). Sending everything at once produces more accurate results.
  // - Summarize-then-analyze loses risk-relevant context (proctoring details, drop
  //   policies, attempt limits) during the extraction step, producing lower scores.
  // - Model selection is unnecessary while there's a single preferred model configured
  //   via environment variable.

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setFileName(file ? file.name : "");
    setResult(null);
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
    setFileName("");
    setShowExtractedText(false);
    setShowRawResponse(false);
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

        {/* --- Preview section (dormant) ---
        File preview with token estimation and strategy selection is disabled.
        See rationale comment above. The preview API endpoint still exists if needed.

        {isPreviewing && (
          <p>Extracting text and computing metadata...</p>
        )}
        {preview && preview.success && (
          <div>
            <p>Size: {(preview.fileSize / 1024).toFixed(1)} KB ·
              {preview.extractedChars.toLocaleString()} chars ·
              ~{preview.estimatedTokens.toLocaleString()} tokens</p>
          </div>
        )}
        */}

        {/* --- Strategy selection (dormant) ---
        Chunked and summarize strategies are disabled. All analysis uses direct mode.
        See rationale comment above.

        {preview && preview.exceedsLimit && (
          <div>
            <label><input type="radio" value="chunked" /> Chunked Analysis</label>
            <label><input type="radio" value="summarize" /> Summarize then Analyze</label>
          </div>
        )}
        */}

        {/* --- Model selection (dormant) ---
        Model is configured via VT_ARC_MODEL environment variable.
        No need for runtime selection while using a single preferred model.

        {config && (
          <div>
            <select value={selectedModel} onChange={...}>
              {config.models.map(model => <option key={model}>{model}</option>)}
            </select>
          </div>
        )}
        */}

        <button
          type="submit"
          disabled={!fileName || isLoading}
          style={{
            ..._styles.submitButton,
            backgroundColor: isLoading || !fileName ? "#ccc" : "#000",
            cursor: isLoading || !fileName ? "not-allowed" : "pointer",
          }}
        >
          {isLoading ? "Analyzing..." : "Analyze Syllabus"}
        </button>
      </form>

      {isLoading && (
        <p style={_styles.loadingText}>
          Sending syllabus to AI for analysis... This may take a moment.
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
