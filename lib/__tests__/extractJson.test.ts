import { describe, it, expect } from "vitest";
import { extractJson } from "@/lib/extract";

describe("extractJson", () => {
  describe("clean JSON input", () => {
    it("returns valid JSON object as-is", () => {
      const input = '{"course": "CS 101", "riskLevel": "High"}';
      expect(extractJson(input)).toBe(input);
    });

    it("returns valid JSON with nested objects", () => {
      const input = '{"course": "CS 101", "issues": [{"title": "Essay"}]}';
      expect(extractJson(input)).toBe(input);
    });

    it("handles JSON with whitespace before opening brace", () => {
      const input = '  \n  {"course": "CS 101"}';
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({ course: "CS 101" });
    });
  });

  describe("JSON wrapped in markdown code fences", () => {
    it("strips ```json ... ``` fences", () => {
      const input = '```json\n{"course": "CS 101"}\n```';
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({ course: "CS 101" });
    });

    it("strips ``` ... ``` fences without language tag", () => {
      const input = '```\n{"course": "CS 101"}\n```';
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({ course: "CS 101" });
    });

    it("strips fences with trailing whitespace", () => {
      const input = '```json  \n{"course": "CS 101"}\n```  ';
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({ course: "CS 101" });
    });

    it("strips fences with no newline after opening", () => {
      const input = '```json{"course": "CS 101"}```';
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({ course: "CS 101" });
    });
  });

  describe("JSON with preamble text", () => {
    it("extracts JSON after a text preamble", () => {
      const input =
        'Here is the analysis:\n{"course": "CS 101", "riskLevel": "Low"}';
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({
        course: "CS 101",
        riskLevel: "Low",
      });
    });

    it("strips trailing text when JSON starts the string", () => {
      const input = '{"course": "CS 101"}\n\nI hope this helps!';
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({ course: "CS 101" });
    });

    it("extracts JSON surrounded by preamble and trailing text", () => {
      const input =
        'Based on my analysis:\n{"course": "CS 101", "riskLevel": "High"}\nLet me know if you need more.';
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({
        course: "CS 101",
        riskLevel: "High",
      });
    });

    it("extracts JSON after multiple lines of preamble", () => {
      const input =
        'I analyzed the syllabus.\nHere are the results:\n\n{"course": "ENG 200"}';
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({ course: "ENG 200" });
    });
  });

  describe("complex nested JSON", () => {
    it("handles the full expected response shape", () => {
      const obj = {
        course: "CS 101",
        riskLevel: "High",
        issues: [
          {
            title: "Final Essay",
            description: "A take-home essay",
            risk: "Students can use AI to write it",
            recommendation: "Add oral defense",
          },
        ],
        summary: "Several assignments are vulnerable.",
      };
      const input = JSON.stringify(obj);
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual(obj);
    });

    it("handles full response shape wrapped in fences", () => {
      const obj = {
        course: "BIO 200",
        riskLevel: "Medium",
        issues: [],
        summary: "Low risk overall.",
      };
      const input = "```json\n" + JSON.stringify(obj, null, 2) + "\n```";
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual(obj);
    });

    it("handles JSON with curly braces inside string values", () => {
      const input = '{"course": "CS {101}", "summary": "Use {templates}"}';
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({
        course: "CS {101}",
        summary: "Use {templates}",
      });
    });
  });

  describe("edge cases and failure modes", () => {
    it("returns empty string when given empty input", () => {
      expect(extractJson("")).toBe("");
    });

    it("returns the text as-is when no JSON is found", () => {
      const input = "This has no JSON at all.";
      expect(extractJson(input)).toBe(input);
    });

    it("handles input with only opening brace", () => {
      const input = "start { but no closing";
      // indexOf("{") = 6, lastIndexOf("}") = -1, so falls through to cleaned
      expect(extractJson(input)).toBe(input);
    });

    it("handles input with only closing brace", () => {
      const input = "no opening } only closing";
      expect(extractJson(input)).toBe(input);
    });

    it("handles input where } comes before {", () => {
      const input = "} before { here";
      // firstBrace=9, lastBrace=0 → lastBrace < firstBrace, falls through
      expect(extractJson(input)).toBe(input);
    });

    it("handles malformed JSON (returns it for JSON.parse to throw)", () => {
      const input = '{"course": "CS 101", broken}';
      const result = extractJson(input);
      // Should extract the brace-delimited content
      expect(result).toContain("course");
      expect(() => JSON.parse(result)).toThrow();
    });

    it("extracts outermost braces when multiple JSON objects exist", () => {
      const input = 'text {"a": 1} middle {"b": 2} end';
      const result = extractJson(input);
      // firstBrace is at {"a": 1}, lastBrace is at end of {"b": 2}
      expect(result).toContain('"a"');
      expect(result).toContain('"b"');
    });

    it("handles JSON with escaped quotes in values", () => {
      const input = '{"course": "CS \\"Advanced\\" 101"}';
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({ course: 'CS "Advanced" 101' });
    });

    it("handles pretty-printed JSON with indentation", () => {
      const input = `{
  "course": "CS 101",
  "riskLevel": "Low",
  "issues": [],
  "summary": "All good."
}`;
      const result = extractJson(input);
      expect(JSON.parse(result)).toEqual({
        course: "CS 101",
        riskLevel: "Low",
        issues: [],
        summary: "All good.",
      });
    });
  });
});
