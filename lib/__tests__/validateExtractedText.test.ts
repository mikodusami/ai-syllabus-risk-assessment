import { describe, it, expect } from "vitest";
import { validateExtractedText, MIN_TEXT_LENGTH } from "@/lib/extract";

describe("validateExtractedText", () => {
  describe("returns null for valid text", () => {
    it("accepts text at exactly the minimum length", () => {
      const text = "a".repeat(MIN_TEXT_LENGTH);
      expect(validateExtractedText(text)).toBeNull();
    });

    it("accepts text above the minimum length", () => {
      const text = "a".repeat(MIN_TEXT_LENGTH + 100);
      expect(validateExtractedText(text)).toBeNull();
    });

    it("accepts a typical syllabus-length text", () => {
      const text = "This is a course syllabus with plenty of content. ".repeat(
        50,
      );
      expect(validateExtractedText(text)).toBeNull();
    });

    it("trims leading/trailing whitespace before checking length", () => {
      const text = "   " + "a".repeat(MIN_TEXT_LENGTH) + "   ";
      expect(validateExtractedText(text)).toBeNull();
    });
  });

  describe("returns empty-file error", () => {
    it("rejects empty string", () => {
      const result = validateExtractedText("");
      expect(result).toContain("Could not extract any text");
      expect(result).toContain("TXT or MD work best");
    });

    it("rejects string with only spaces", () => {
      const result = validateExtractedText("          ");
      expect(result).toContain("Could not extract any text");
    });

    it("rejects string with only newlines", () => {
      const result = validateExtractedText("\n\n\n\n\n");
      expect(result).toContain("Could not extract any text");
    });

    it("rejects string with only tabs", () => {
      const result = validateExtractedText("\t\t\t\t");
      expect(result).toContain("Could not extract any text");
    });

    it("rejects string with mixed whitespace only", () => {
      const result = validateExtractedText("  \n\t  \n  \t  ");
      expect(result).toContain("Could not extract any text");
    });
  });

  describe("returns too-short error", () => {
    it("rejects text with 1 character", () => {
      const result = validateExtractedText("x");
      expect(result).toContain("too short to analyze");
      expect(result).toContain("less than 50 characters");
    });

    it("rejects text at exactly MIN_TEXT_LENGTH - 1", () => {
      const text = "a".repeat(MIN_TEXT_LENGTH - 1);
      const result = validateExtractedText(text);
      expect(result).toContain("too short to analyze");
    });

    it("rejects text that is short after trimming", () => {
      const text = "     short     ";
      const result = validateExtractedText(text);
      expect(result).toContain("too short to analyze");
    });

    it("rejects text with 49 visible chars padded with whitespace", () => {
      const text = "  " + "a".repeat(49) + "  ";
      const result = validateExtractedText(text);
      expect(result).toContain("too short to analyze");
    });
  });

  describe("edge cases", () => {
    it("confirms MIN_TEXT_LENGTH is 50", () => {
      expect(MIN_TEXT_LENGTH).toBe(50);
    });

    it("boundary: 49 chars returns error, 50 chars returns null", () => {
      expect(validateExtractedText("a".repeat(49))).not.toBeNull();
      expect(validateExtractedText("a".repeat(50))).toBeNull();
    });
  });
});
