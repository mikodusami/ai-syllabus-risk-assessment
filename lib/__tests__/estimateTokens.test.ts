import { describe, it, expect } from "vitest";
import { estimateTokens, CHARS_PER_TOKEN } from "@/lib/extract";

describe("estimateTokens", () => {
  describe("basic calculations", () => {
    it("returns 0 for empty string", () => {
      expect(estimateTokens("")).toBe(0);
    });

    it("returns 1 for a single character", () => {
      expect(estimateTokens("a")).toBe(1);
    });

    it("returns 1 for text shorter than CHARS_PER_TOKEN", () => {
      expect(estimateTokens("abc")).toBe(1);
    });

    it("returns 1 for text at exactly CHARS_PER_TOKEN length", () => {
      expect(estimateTokens("abcd")).toBe(1);
    });

    it("returns 2 for text at CHARS_PER_TOKEN + 1", () => {
      expect(estimateTokens("abcde")).toBe(2);
    });

    it("calculates correctly for 100 characters", () => {
      const text = "a".repeat(100);
      expect(estimateTokens(text)).toBe(25);
    });

    it("calculates correctly for 1000 characters", () => {
      const text = "a".repeat(1000);
      expect(estimateTokens(text)).toBe(250);
    });
  });

  describe("rounding behavior (Math.ceil)", () => {
    it("rounds up for 5 chars (5/4 = 1.25 → 2)", () => {
      expect(estimateTokens("a".repeat(5))).toBe(2);
    });

    it("rounds up for 7 chars (7/4 = 1.75 → 2)", () => {
      expect(estimateTokens("a".repeat(7))).toBe(2);
    });

    it("does not round for exact multiples (8/4 = 2)", () => {
      expect(estimateTokens("a".repeat(8))).toBe(2);
    });

    it("rounds up for 9 chars (9/4 = 2.25 → 3)", () => {
      expect(estimateTokens("a".repeat(9))).toBe(3);
    });

    it("rounds up for 13 chars (13/4 = 3.25 → 4)", () => {
      expect(estimateTokens("a".repeat(13))).toBe(4);
    });
  });

  describe("realistic content", () => {
    it("estimates tokens for a short sentence", () => {
      const text = "Hello, world!"; // 13 chars → 4 tokens
      expect(estimateTokens(text)).toBe(4);
    });

    it("estimates tokens for a paragraph (~500 chars → ~125 tokens)", () => {
      const text = "a".repeat(500);
      expect(estimateTokens(text)).toBe(125);
    });

    it("estimates tokens for a typical syllabus (~20000 chars → ~5000 tokens)", () => {
      const text = "a".repeat(20000);
      expect(estimateTokens(text)).toBe(5000);
    });

    it("counts whitespace and newlines as characters", () => {
      const text = "a b\nc d"; // 7 chars including spaces and newline
      expect(estimateTokens(text)).toBe(2);
    });
  });

  describe("edge cases", () => {
    it("confirms CHARS_PER_TOKEN is 4", () => {
      expect(CHARS_PER_TOKEN).toBe(4);
    });

    it("handles unicode characters (each char counts as 1)", () => {
      const text = "日本語テスト"; // 6 chars
      expect(estimateTokens(text)).toBe(2);
    });

    it("handles emojis", () => {
      const text = "📚🎓✅❌"; // 4 chars (each emoji is 1 string char via surrogate pairs counted differently)
      expect(estimateTokens(text)).toBe(
        Math.ceil(text.length / CHARS_PER_TOKEN),
      );
    });
  });
});
