import { describe, it, expect } from "vitest";
import { isDocxFile } from "@/lib/extract";

const DOCX_MIME =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

describe("isDocxFile", () => {
  describe("true by mime type", () => {
    it("matches docx mime type", () => {
      expect(isDocxFile(DOCX_MIME, "doc.docx")).toBe(true);
    });

    it("matches docx mime type even with non-.docx extension", () => {
      expect(isDocxFile(DOCX_MIME, "document")).toBe(true);
    });

    it("matches docx mime type with misleading extension", () => {
      expect(isDocxFile(DOCX_MIME, "file.pdf")).toBe(true);
    });
  });

  describe("true by extension", () => {
    it("matches .docx with empty mime type", () => {
      expect(isDocxFile("", "syllabus.docx")).toBe(true);
    });

    it("matches .docx with wrong mime type", () => {
      expect(isDocxFile("application/octet-stream", "report.docx")).toBe(true);
    });

    it("matches .docx with path-like filename", () => {
      expect(isDocxFile("", "uploads/docs/syllabus.docx")).toBe(true);
    });

    it("matches .docx with dots in filename", () => {
      expect(isDocxFile("", "my.course.syllabus.docx")).toBe(true);
    });
  });

  describe("false for other types", () => {
    it("rejects text/plain", () => {
      expect(isDocxFile("text/plain", "doc.txt")).toBe(false);
    });

    it("rejects application/pdf", () => {
      expect(isDocxFile("application/pdf", "doc.pdf")).toBe(false);
    });

    it("rejects .pdf extension", () => {
      expect(isDocxFile("", "report.pdf")).toBe(false);
    });

    it("rejects .txt extension", () => {
      expect(isDocxFile("", "notes.txt")).toBe(false);
    });

    it("rejects old .doc format (application/msword)", () => {
      expect(isDocxFile("application/msword", "old.doc")).toBe(false);
    });

    it("rejects .doc extension", () => {
      expect(isDocxFile("", "legacy.doc")).toBe(false);
    });
  });

  describe("edge cases", () => {
    it("rejects empty mime and empty filename", () => {
      expect(isDocxFile("", "")).toBe(false);
    });

    it("is case-sensitive — .DOCX does not match", () => {
      expect(isDocxFile("", "FILE.DOCX")).toBe(false);
    });

    it("rejects filename containing .docx mid-name", () => {
      expect(isDocxFile("", "file.docx.bak")).toBe(false);
    });

    it("rejects filename ending with docx but no dot", () => {
      expect(isDocxFile("", "notadocx")).toBe(false);
    });

    it("rejects .xlsx (different Office XML format)", () => {
      expect(
        isDocxFile(
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "data.xlsx",
        ),
      ).toBe(false);
    });

    it("rejects .pptx (different Office XML format)", () => {
      expect(
        isDocxFile(
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
          "slides.pptx",
        ),
      ).toBe(false);
    });
  });
});
