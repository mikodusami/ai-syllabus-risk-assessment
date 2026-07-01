import { describe, it, expect } from "vitest";
import { isAllowedFileType } from "@/lib/extract";

describe("isAllowedFileType", () => {
  describe("valid mime types", () => {
    it("accepts application/pdf", () => {
      expect(isAllowedFileType("application/pdf", "doc.pdf")).toBe(true);
    });

    it("accepts docx mime type", () => {
      expect(
        isAllowedFileType(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "doc.docx",
        ),
      ).toBe(true);
    });

    it("accepts text/plain", () => {
      expect(isAllowedFileType("text/plain", "doc.txt")).toBe(true);
    });

    it("accepts text/markdown", () => {
      expect(isAllowedFileType("text/markdown", "doc.md")).toBe(true);
    });
  });

  describe("valid extensions with empty/unknown mime type", () => {
    it("accepts .txt extension regardless of mime type", () => {
      expect(isAllowedFileType("", "syllabus.txt")).toBe(true);
    });

    it("accepts .md extension regardless of mime type", () => {
      expect(isAllowedFileType("", "README.md")).toBe(true);
    });
  });

  describe("invalid types", () => {
    it("rejects image/png", () => {
      expect(isAllowedFileType("image/png", "photo.png")).toBe(false);
    });

    it("rejects application/json", () => {
      expect(isAllowedFileType("application/json", "data.json")).toBe(false);
    });

    it("rejects .exe files", () => {
      expect(isAllowedFileType("application/octet-stream", "virus.exe")).toBe(
        false,
      );
    });

    it("rejects empty mime type with unsupported extension", () => {
      expect(isAllowedFileType("", "file.csv")).toBe(false);
    });

    it("rejects .doc (old Word format, not .docx)", () => {
      expect(isAllowedFileType("application/msword", "old.doc")).toBe(false);
    });
  });
});
