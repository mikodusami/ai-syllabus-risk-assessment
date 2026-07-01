import { describe, it, expect } from "vitest";
import { isPdfFile } from "@/lib/extract";

describe("isPdfFile", () => {
  describe("true by mime type", () => {
    it("matches application/pdf", () => {
      expect(isPdfFile("application/pdf", "doc.pdf")).toBe(true);
    });

    it("matches application/pdf even with non-.pdf extension", () => {
      expect(isPdfFile("application/pdf", "document")).toBe(true);
    });

    it("matches application/pdf with misleading extension", () => {
      expect(isPdfFile("application/pdf", "file.txt")).toBe(true);
    });
  });

  describe("true by extension", () => {
    it("matches .pdf with empty mime type", () => {
      expect(isPdfFile("", "syllabus.pdf")).toBe(true);
    });

    it("matches .pdf with wrong mime type", () => {
      expect(isPdfFile("application/octet-stream", "report.pdf")).toBe(true);
    });

    it("matches .pdf with path-like filename", () => {
      expect(isPdfFile("", "uploads/docs/syllabus.pdf")).toBe(true);
    });

    it("matches .pdf with dots in filename", () => {
      expect(isPdfFile("", "my.course.syllabus.pdf")).toBe(true);
    });
  });

  describe("false for other types", () => {
    it("rejects text/plain", () => {
      expect(isPdfFile("text/plain", "doc.txt")).toBe(false);
    });

    it("rejects docx mime type", () => {
      expect(
        isPdfFile(
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          "doc.docx",
        ),
      ).toBe(false);
    });

    it("rejects .docx extension", () => {
      expect(isPdfFile("", "report.docx")).toBe(false);
    });

    it("rejects .txt extension", () => {
      expect(isPdfFile("", "notes.txt")).toBe(false);
    });

    it("rejects image/png", () => {
      expect(isPdfFile("image/png", "chart.png")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("rejects empty mime and empty filename", () => {
      expect(isPdfFile("", "")).toBe(false);
    });

    it("is case-sensitive — .PDF does not match", () => {
      expect(isPdfFile("", "FILE.PDF")).toBe(false);
    });

    it("rejects filename containing .pdf mid-name", () => {
      expect(isPdfFile("", "file.pdf.bak")).toBe(false);
    });

    it("rejects filename ending with pdf but no dot", () => {
      expect(isPdfFile("", "notapdf")).toBe(false);
    });
  });
});
