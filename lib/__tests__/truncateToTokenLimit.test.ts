import { describe, it, expect } from "vitest";
import {
  truncateToTokenLimit,
  MODEL_TOKEN_LIMIT_NON_STREAMING,
  CHARS_PER_TOKEN,
} from "@/lib/extract";

const MAX_CHARS = MODEL_TOKEN_LIMIT_NON_STREAMING * CHARS_PER_TOKEN;

describe("truncateToTokenLimit", () => {
  describe("returns text unchanged when within limit", () => {
    it("returns empty string as-is", () => {
      expect(truncateToTokenLimit("")).toBe("");
    });

    it("returns short text unchanged", () => {
      const text = "Hello, world!";
      expect(truncateToTokenLimit(text)).toBe(text);
    });

    it("returns text at exactly the max chars unchanged", () => {
      const text = "a".repeat(MAX_CHARS);
      expect(truncateToTokenLimit(text)).toBe(text);
    });

    it("returns text 1 char below the limit unchanged", () => {
      const text = "a".repeat(MAX_CHARS - 1);
      expect(truncateToTokenLimit(text)).toBe(text);
    });

    it("returns a typical syllabus-size text unchanged (~5000 tokens)", () => {
      const text = "a".repeat(20000);
      expect(truncateToTokenLimit(text)).toBe(text);
    });
  });

  describe("truncates text that exceeds the limit", () => {
    it("truncates text 1 char over the limit", () => {
      const text = "a".repeat(MAX_CHARS + 1);
      const result = truncateToTokenLimit(text);
      expect(result.length).toBe(MAX_CHARS);
    });

    it("truncates very large text to exactly MAX_CHARS", () => {
      const text = "a".repeat(MAX_CHARS * 3);
      const result = truncateToTokenLimit(text);
      expect(result.length).toBe(MAX_CHARS);
    });

    it("preserves the beginning of the text when truncating", () => {
      const text = "START" + "x".repeat(MAX_CHARS) + "END";
      const result = truncateToTokenLimit(text);
      expect(result).toContain("START");
      expect(result).not.toContain("END");
    });

    it("truncates to exact character count (not token-rounded)", () => {
      const text = "abcdefgh".repeat(MAX_CHARS); // way over limit
      const result = truncateToTokenLimit(text);
      expect(result.length).toBe(MAX_CHARS);
    });
  });

  describe("edge cases", () => {
    it("confirms MODEL_TOKEN_LIMIT_NON_STREAMING is 8000", () => {
      expect(MODEL_TOKEN_LIMIT_NON_STREAMING).toBe(8000);
    });

    it("confirms MAX_CHARS is 32000 (8000 * 4)", () => {
      expect(MAX_CHARS).toBe(32000);
    });

    it("handles text with unicode characters", () => {
      const text = "日".repeat(MAX_CHARS + 10);
      const result = truncateToTokenLimit(text);
      expect(result.length).toBe(MAX_CHARS);
    });

    it("handles text with newlines at the boundary", () => {
      const text = "line\n".repeat(MAX_CHARS); // way over
      const result = truncateToTokenLimit(text);
      expect(result.length).toBe(MAX_CHARS);
    });
  });
});
