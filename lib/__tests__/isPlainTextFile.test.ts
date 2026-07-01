import { describe, it, expect } from "vitest";
import { isPlainTextFile } from "@/lib/extract";

describe("isPlainTextFile", () => {
  describe("true by mime type", () => {
    it("matches text/plain", () => {
      expect(isPlainTextFile("text/plain", "file.txt")).toBe(true);
    });

    it("matches text/markdown", () => {
      expect(isPlainTextFile("text/markdown", "file.md")).toBe(true);
    });

    it("matches text/plain even with non-.txt extension", () => {
      expect(isPlainTextFile("text/plain", "file.log")).toBe(true);
    });

    it("matches text/markdown even with non-.md extension", () => {
      expect(isPlainTextFile("text/markdown", "notes")).toBe(true);
    });
  });

  describe("true by extension", () => {
    it("matches .txt with empty mime type", () => {
      expect(isPlainTextFile("", "syllabus.txt")).toBe(true);
    });

    it("matches .md with empty mime type", () => {
      expect(isPlainTextFile("", "README.md")).toBe(true);
    });

    it("matches .txt with wrong mime type", () => {
      expect(isPlainTextFile("application/octet-stream", "notes.txt")).toBe(
        true,
      );
    });

    it("matches .md with wrong mime type", () => {
      expect(isPlainTextFile("application/octet-stream", "doc.md")).toBe(true);
    });

    it("is case-sensitive — .TXT does not match", () => {
      expect(isPlainTextFile("", "FILE.TXT")).toBe(false);
    });

    it("is case-sensitive — .MD does not match", () => {
      expect(isPlainTextFile("", "FILE.MD")).toBe(false);
    });
  });

  describe("false for other types", () => {
    it("rejects PDF mime type", () => {
      expect(isPlainTextFile("application/pdf", "doc.pdf")).toBe(false);
    });

    it("rejects DOCX mime type", () => {
      expect(
        isPlainTextFile(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "doc.docx",
        ),
      ).toBe(false);
    });

    it("rejects .pdf extension with empty mime", () => {
      expect(isPlainTextFile("", "report.pdf")).toBe(false);
    });

    it("rejects .docx extension with empty mime", () => {
      expect(isPlainTextFile("", "report.docx")).toBe(false);
    });

    it("rejects text/html", () => {
      expect(isPlainTextFile("text/html", "page.html")).toBe(false);
    });

    it("rejects text/csv", () => {
      expect(isPlainTextFile("text/csv", "data.csv")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("rejects empty mime type and empty filename", () => {
      expect(isPlainTextFile("", "")).toBe(false);
    });

    it("rejects filename that contains .txt but doesn't end with it", () => {
      expect(isPlainTextFile("", "file.txt.pdf")).toBe(false);
    });

    it("rejects filename that contains .md but doesn't end with it", () => {
      expect(isPlainTextFile("", "file.md.docx")).toBe(false);
    });

    it("matches filename with path-like structure ending in .txt", () => {
      expect(isPlainTextFile("", "some/path/file.txt")).toBe(true);
    });

    it("matches filename with dots before .md", () => {
      expect(isPlainTextFile("", "my.notes.v2.md")).toBe(true);
    });
  });
});
