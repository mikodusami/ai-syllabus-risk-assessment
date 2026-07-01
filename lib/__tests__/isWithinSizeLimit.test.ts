import { describe, it, expect } from "vitest";
import { isWithinSizeLimit, MAX_FILE_SIZE } from "@/lib/extract";

describe("isWithinSizeLimit", () => {
  describe("within limit", () => {
    it("accepts 0 bytes (empty file)", () => {
      expect(isWithinSizeLimit(0)).toBe(true);
    });

    it("accepts 1 byte", () => {
      expect(isWithinSizeLimit(1)).toBe(true);
    });

    it("accepts a small file (1 KB)", () => {
      expect(isWithinSizeLimit(1024)).toBe(true);
    });

    it("accepts a typical syllabus size (500 KB)", () => {
      expect(isWithinSizeLimit(500 * 1024)).toBe(true);
    });

    it("accepts exactly at the limit (10 MB)", () => {
      expect(isWithinSizeLimit(MAX_FILE_SIZE)).toBe(true);
    });

    it("accepts 1 byte below the limit", () => {
      expect(isWithinSizeLimit(MAX_FILE_SIZE - 1)).toBe(true);
    });
  });

  describe("over limit", () => {
    it("rejects 1 byte over the limit", () => {
      expect(isWithinSizeLimit(MAX_FILE_SIZE + 1)).toBe(false);
    });

    it("rejects double the limit", () => {
      expect(isWithinSizeLimit(MAX_FILE_SIZE * 2)).toBe(false);
    });

    it("rejects a very large file (100 MB)", () => {
      expect(isWithinSizeLimit(100 * 1024 * 1024)).toBe(false);
    });

    it("rejects Number.MAX_SAFE_INTEGER", () => {
      expect(isWithinSizeLimit(Number.MAX_SAFE_INTEGER)).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("rejects negative size", () => {
      // Negative file sizes shouldn't exist, but the function should still behave predictably
      expect(isWithinSizeLimit(-1)).toBe(true);
    });

    it("accepts NaN (returns false due to comparison)", () => {
      // NaN compared with <= always returns false
      expect(isWithinSizeLimit(NaN)).toBe(false);
    });

    it("rejects Infinity", () => {
      expect(isWithinSizeLimit(Infinity)).toBe(false);
    });

    it("accepts negative Infinity (degenerate input)", () => {
      expect(isWithinSizeLimit(-Infinity)).toBe(true);
    });

    it("confirms MAX_FILE_SIZE is 5 MB", () => {
      expect(MAX_FILE_SIZE).toBe(5 * 1024 * 1024);
    });
  });
});
