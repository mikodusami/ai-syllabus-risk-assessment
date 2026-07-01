import { describe, it, expect } from "vitest";
import { readFileSync } from "fs";
import { join } from "path";
import {
  extractPlainText,
  extractPdfText,
  extractDocxText,
  extractTextFromBuffer,
} from "@/lib/extract";

const FIXTURES = join(__dirname, "fixtures");

function loadFixture(filename: string): Buffer {
  return readFileSync(join(FIXTURES, filename));
}

describe("extractPlainText", () => {
  it("extracts content from a basic text file", () => {
    const buffer = loadFixture("sample.txt");
    const text = extractPlainText(buffer);
    expect(text).toContain("CS 101");
    expect(text).toContain("Introduction to Computer Science");
    expect(text).toContain("Dr. Smith");
  });

  it("extracts content from a markdown file", () => {
    const buffer = loadFixture("sample.md");
    const text = extractPlainText(buffer);
    expect(text).toContain("ENG 200");
    expect(text).toContain("Creative Writing");
    expect(text).toContain("Prof. Johnson");
  });

  it("handles unicode characters correctly", () => {
    const buffer = loadFixture("unicode.txt");
    const text = extractPlainText(buffer);
    expect(text).toContain("Introducción");
    expect(text).toContain("María García-López");
    expect(text).toContain("日本語テキスト");
    expect(text).toContain("Straße");
    expect(text).toContain("📚");
  });

  it("returns empty string for empty file", () => {
    const buffer = loadFixture("empty.txt");
    const text = extractPlainText(buffer);
    expect(text).toBe("");
  });

  it("preserves newlines and whitespace", () => {
    const buffer = loadFixture("sample.txt");
    const text = extractPlainText(buffer);
    expect(text).toContain("\n");
  });
});

describe("extractPdfText", () => {
  describe("simple.pdf - basic multi-page PDF with Latin text", () => {
    it("extracts expected content from all pages", async () => {
      const buffer = loadFixture("simple.pdf");
      const text = await extractPdfText(buffer);

      // Title and purpose
      expect(text).toContain("Sample PDF");
      expect(text).toContain("PDFObject");
      expect(text).toContain("three pages long");

      // Philosophical musing from page 1
      expect(text).toContain("three long minutes");
      expect(text).toContain("I digress");

      // Latin text from page 1
      expect(text).toContain("Lorem ipsum dolor sit amet");
      expect(text).toContain("consectetur adipiscing elit");
      expect(text).toContain("Integer nec odio");
      expect(text).toContain("Praesent libero");
      expect(text).toContain("Sed cursus ante dapibus diam");

      // Content from deeper in the document (multi-page verification)
      expect(text).toContain("Vestibulum lacinia arcu eget nulla");
      expect(text).toContain("Class aptent taciti sociosqu ad litora torquent");
      expect(text).toContain("Curabitur sodales ligula in libero");
      expect(text).toContain("Morbi in dui quis est pulvinar ullamcorper");
      expect(text).toContain("Nulla facilisi");
      expect(text).toContain("Quisque volutpat condimentum velit");
      expect(text).toContain("Suspendisse in justo eu magna luctus suscipit");
      expect(text).toContain("Vestibulum ante ipsum primis in faucibus orci");
      expect(text).toContain("Morbi lacinia molestie dui");
      expect(text).toContain("Praesent blandit dolor");
      expect(text).toContain("Ut eu diam at pede suscipit sodales");
      expect(text).toContain("Aenean lectus elit");
      expect(text).toContain("Vivamus consectetuer risus et tortor");

      // Length check for 3-page document
      expect(text.length).toBeGreaterThan(3000);
    });
  });

  describe("spaces-in-name.pdf - chemistry syllabus with grading tables", () => {
    it("extracts expected content from VT chemistry syllabus", async () => {
      const buffer = loadFixture("spaces-in-name.pdf");
      const text = await extractPdfText(buffer);

      // Exam policy
      expect(text).toContain("final exam");
      expect(text).toContain("Makeup tests will not be returned or published");
      expect(text).toContain("remote testing is not permitted");
      expect(text).toContain("May 14, 2026");

      // Dean of Students section
      expect(text).toContain("Dean of Students");
      expect(text).toContain("540-231-3787");

      // Attendance
      expect(text).toContain("Class attendance is mandatory");

      // Grading formula and percentages
      expect(text).toContain("56%");
      expect(text).toContain("14%");
      expect(text).toContain("10%");
      expect(text).toContain("6%");
      expect(text).toContain("Overall Average");
      expect(text).toContain("iClicker average");

      // Grading scale
      expect(text).toContain("93%");
      expect(text).toContain("90%");
      expect(text).toContain("87%");

      // Drop policy
      expect(text).toContain("lowest five ALEKS scores are dropped");
      expect(text).toContain("lowest three studio quiz scores are dropped");

      // Canvas references
      expect(text).toContain("Canvas");
      expect(text).toContain("canvas.vt.edu");
      expect(text).toContain("Announcements tab");
      expect(text).toContain("Files tab");
      expect(text).toContain("Quizzes tab");
      expect(text).toContain("Grades tab");

      // Problem Solving Studio
      expect(text).toContain("Problem Solving Studio");
      expect(text).toContain("mandatory studio sessions");
      expect(text).toContain("Thursday afternoons");

      // Calculators
      expect(text).toContain("TI-30X IIS");
      expect(text).toContain("TI-30XS Multiview");

      // Honor Code
      expect(text).toContain("Honor Code");
      expect(text).toContain("As a Hokie");
      expect(text).toContain("will not lie, cheat, or steal");

      // Help sessions
      expect(text).toContain("Wagner");
      expect(text).toContain("Arachchige");
      expect(text).toContain("Davidson 281");

      // SSD
      expect(text).toContain("Services for Students with Disabilities");
      expect(text).toContain("540-231-3788");
      expect(text).toContain("ssd@vt.edu");

      // Classroom conduct
      expect(text).toContain("Classroom Conduct");
      expect(text).toContain("Handwriting your notes");

      // Testing info
      expect(text).toContain("Lockdown Browser");
      expect(text).toContain("90 minutes");
      expect(text).toContain("105 minutes");

      // Inclusion/diversity
      expect(text).toContain("Inclusion, Diversity, and Basic Needs");
    });
  });

  describe("styled-tables.pdf - SJSU stretch English syllabus with tables", () => {
    it("extracts expected content from SJSU ENGL 1AF syllabus", async () => {
      const buffer = loadFixture("styled-tables.pdf");
      const text = await extractPdfText(buffer);

      // Contact info
      expect(text).toContain("Yuching");
      expect(text).toContain("Yang");
      expect(text).toContain("FOB 222");
      expect(text).toContain("yuching.yang@sjsu.edu");

      // Course info
      expect(text).toContain("ENGL 1AF");
      expect(text).toContain("Fall 2024");
      expect(text).toContain("3 Unit");

      // Course description
      expect(text).toContain("Stretch I");
      expect(text).toContain("scholarly conversations");
      expect(text).toContain("rhetorical sophistication");

      // CLOs
      expect(text).toContain("writing process");
      expect(text).toContain("prewriting");
      expect(text).toContain("drafting");
      expect(text).toContain("revising");
      expect(text).toContain("citation");

      // Stretch calendar info
      expect(text).toContain("fall and spring terms");
      expect(text).toContain("same section in spring semester");

      // GE program
      expect(text).toContain("General Education");
      expect(text).toContain("Goal 1");
      expect(text).toContain("Goal 2");
      expect(text).toContain("Goal 3");

      // Grading
      expect(text).toContain("CR");
      expect(text).toContain("NC");
      expect(text).toContain("letter grade");
      expect(text).toContain("C-");

      // GE Area A2 learning outcomes
      expect(text).toContain("Written Communication");
      expect(text).toContain("8000 words");
      expect(text).toContain("4000");
      expect(text).toContain("final draft form");

      // Canvas
      expect(text).toContain("Canvas");

      // Time commitment
      expect(text).toContain("45 hours");

      // Portfolio
      expect(text).toContain("Reflection and Portfolio");
    });
  });

  describe("tables-and-images.pdf - UW English 110 with complex formatting", () => {
    it("extracts expected content from UW ENGLISH 110 syllabus", async () => {
      const buffer = loadFixture("tables-and-images.pdf");
      const text = await extractPdfText(buffer);

      // Header info
      expect(text).toContain("ENGLISH 110");
      expect(text).toContain("INTRODUCTORY COMPOSITION");
      expect(text).toContain("UNIVERSITY OF WASHINGTON");
      expect(text).toContain("WINTER 2018");

      // Instructor
      expect(text).toContain("Ahmad Alharthi");
      expect(text).toContain("aharthi@uw.edu");
      expect(text).toContain("Padelford B5J");

      // Schedule
      expect(text).toContain("Tuesday");
      expect(text).toContain("Thursday");
      expect(text).toContain("Mary Gates Hall");

      // Course description
      expect(text).toContain("English 109");
      expect(text).toContain("rhetorical analysis");
      expect(text).toContain("academic writing");

      // CIC section
      expect(text).toContain("Computer Integrated Classroom");
      expect(text).toContain("CIC");
      expect(text).toContain("Canvas");

      // Lab conduct
      expect(text).toContain("No typing or surfing the web");
      expect(text).toContain("save your work often");

      // Learning outcomes
      expect(text).toContain("compose strategically");
      expect(text).toContain("complex information");
      expect(text).toContain("persuasive");
      expect(text).toContain("recursive, collaborative process");

      // Grading
      expect(text).toContain("30%");
      expect(text).toContain("70%");
      expect(text).toContain("PARTICIPATION AND ATTENDANCE");
      expect(text).toContain("PORTFOLIO");

      // Assignment requirements
      expect(text).toContain("Six formal essays");
      expect(text).toContain("Five peer review workshops");
      expect(text).toContain("Four informal reflections");
      expect(text).toContain("Three online discussion posts");

      // Portfolio details
      expect(text).toContain("portfolio");
      expect(text).toContain("major project");
      expect(text).toContain("critical reflection");

      // Evaluation rubric
      expect(text).toContain("Outstanding");
      expect(text).toContain("Strong");
      expect(text).toContain("Inadequate");

      // Late work / extra credit
      expect(text).toContain("late submissions");
      expect(text).toContain("extra credit");

      // Required texts
      expect(text).toContain("Writer/Thinker/Maker");
    });
  });

  describe("standard-syllabus.pdf - UNM sample syllabus template", () => {
    it("extracts expected content from UNM syllabus template", async () => {
      const buffer = loadFixture("standard-syllabus.pdf");
      const text = await extractPdfText(buffer);

      // Header
      expect(text).toContain("SAMPLE SYLLABUS");

      // Template fields
      expect(text).toContain("Course Title");
      expect(text).toContain("Course Number");
      expect(text).toContain("Course Credits");
      expect(text).toContain("Office Hours");
      expect(text).toContain("Class Meeting Day");

      // Course description section
      expect(text).toContain("Course Description");
      expect(text).toContain("UNM course catalog");

      // Goals and outcomes
      expect(text).toContain("Course Goals");
      expect(text).toContain("Student Learning Outcomes");
      expect(text).toContain("achievable, measurable skills");
      expect(text).toContain("action verbs");

      // Requirements
      expect(text).toContain("Course Requirements");
      expect(text).toContain("Textbooks");

      // Grading section
      expect(text).toContain("Grading");
      expect(text).toContain("90 - 100");
      expect(text).toContain("80 - 89");
      expect(text).toContain("70 - 79");
      expect(text).toContain("60 - 69");

      // Grading examples
      expect(text).toContain("Standard percentages");
      expect(text).toContain("Class mean based");
      expect(text).toContain("Rubric");

      // Accommodation
      expect(text).toContain("Accommodation");
      expect(text).toContain("Americans with Disabilities Act");
      expect(text).toContain("Accessibility Resource Center");
      expect(text).toContain("277-3506");

      // Schedule
      expect(text).toContain("Course Schedule");
      expect(text).toContain("subject to change");

      // Checklist
      expect(text).toContain("CHECKLIST");
      expect(text).toContain("fractionalized grades");

      // Laptop requirement example
      expect(text).toContain("laptop");
      expect(text).toContain("UNM Law School");
    });
  });

  describe("remaining PDF fixtures", () => {
    it("extracts text from minimal.pdf", async () => {
      const buffer = loadFixture("minimal.pdf");
      const text = await extractPdfText(buffer);
      expect(text.length).toBeGreaterThan(0);
    });

    it("extracts text from images-tables-formatting.pdf", async () => {
      const buffer = loadFixture("images-tables-formatting.pdf");
      const text = await extractPdfText(buffer);
      expect(text.length).toBeGreaterThan(0);
    });

    it("extracts text from complex-layout.pdf", async () => {
      const buffer = loadFixture("complex-layout.pdf");
      const text = await extractPdfText(buffer);
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe("error handling", () => {
    it("throws on a corrupt/invalid buffer", async () => {
      const buffer = Buffer.from("this is not a pdf");
      await expect(extractPdfText(buffer)).rejects.toThrow();
    });

    it("throws on an empty buffer", async () => {
      const buffer = Buffer.alloc(0);
      await expect(extractPdfText(buffer)).rejects.toThrow();
    });

    it("throws on a buffer with only whitespace bytes", async () => {
      const buffer = Buffer.from("   \n\t\n   ");
      await expect(extractPdfText(buffer)).rejects.toThrow();
    });
  });
});

describe("extractDocxText", () => {
  describe("standard-syllabus.docx - HUM 1020 face-to-face syllabus", () => {
    it("extracts substantial text content", async () => {
      const buffer = loadFixture("standard-syllabus.docx");
      const text = await extractDocxText(buffer);
      expect(text.length).toBeGreaterThan(500);
    });

    it("extracts course-related content", async () => {
      const buffer = loadFixture("standard-syllabus.docx");
      const text = await extractDocxText(buffer);
      expect(text.length).toBeGreaterThan(0);
    });
  });

  describe("programming-syllabus.docx - Intro to Python syllabus", () => {
    it("extracts all expected content from VT Python course syllabus", async () => {
      const buffer = loadFixture("programming-syllabus.docx");
      const text = await extractDocxText(buffer);

      // Course title and term
      expect(text).toContain("Introduction to Programming in Python");
      expect(text).toContain("Summer 2025");

      // Course description
      expect(text).toContain("computational problem-solving skills");
      expect(text).toContain("control flow with loops and conditionals");
      expect(text).toContain("state tracing and manipulation");
      expect(text).toContain(
        "functional and object-oriented coding strategies",
      );
      expect(text).toContain("data processing");
      expect(text).toContain("scientists and engineers");

      // Course objectives
      expect(text).toContain(
        "Create simple programs that solve problems using Python",
      );
      expect(text).toContain("Interpret and debug a Python program");
      expect(text).toContain("Represent data using simple and complex types");
      expect(text).toContain("Trace and code nonlinear control flow");
      expect(text).toContain(
        "Organize code using functional and object-oriented programming",
      );
      expect(text).toContain("Determine when a problem is solvable");
      expect(text).toContain(
        "Summarize, criticize, and participate in computing culture",
      );

      // Assessment breakdown
      expect(text).toContain("Learning Quizzes");
      expect(text).toContain("30%");
      expect(text).toContain("Lowest 3 Dropped");
      expect(text).toContain("Programming Problems");
      expect(text).toContain("25%");
      expect(text).toContain("Lowest 2 Dropped");
      expect(text).toContain("Coding Projects");
      expect(text).toContain("Four Total");
      expect(text).toContain("Final Exam");
      expect(text).toContain("20%");
      expect(text).toContain("90% final grade guarantees an A-");
      expect(text).toContain("80% final grade guarantees a B-");

      // Textbooks
      expect(text).toContain("no required textbook");
      expect(text).toContain("How to Think like a Computer Scientist");
      expect(text).toContain("Automate the Boring Stuff with Python");
      expect(text).toContain("Coding for Beginners in Easy Steps");

      // Submissions
      expect(text).toContain("unlimited submissions");
      expect(text).toContain(
        "last submission will be the version that is graded",
      );

      // Course structure
      expect(text).toContain("fully online and asynchronous");
      expect(text).toContain("BlockPy");
      expect(text).toContain("Web-CAT");

      // Backups
      expect(text).toContain("keep backups of all of your work");
      expect(text).toContain("Google Drive");
      expect(text).toContain("Dropbox");

      // Well-being
      expect(text).toContain("Cook Counseling");
      expect(text).toContain("540-231-6557");
      expect(text).toContain("Dean of Students Office");
      expect(text).toContain("540-231-3787");
      expect(text).toContain("Hokie Wellness");
      expect(text).toContain("Services for Students with Disabilities");
      expect(text).toContain("540-231-3788");

      // Honor Code
      expect(text).toContain("Honor Code");
      expect(text).toContain("As a Hokie");
      expect(text).toContain("will not lie, cheat, or steal");
      expect(text).toContain("F*");
      expect(text).toContain("FAILURE DUE TO ACADEMIC HONOR CODE VIOLATION");

      // Collaboration policy terms
      expect(text).toContain("CHEATING");
      expect(text).toContain("PLAGIARISM");
      expect(text).toContain("FALSIFICATION");
      expect(text).toContain("FABRICATION");
      expect(text).toContain("MULTIPLE SUBMISSION");
      expect(text).toContain("COMPLICITY");

      // Errata
      expect(text).toContain("Chrome OS");
      expect(text).toContain("Mac or Windows");
    });
  });

  describe("error handling", () => {
    it("throws on a corrupt/invalid buffer", async () => {
      const buffer = Buffer.from("this is not a docx file");
      await expect(extractDocxText(buffer)).rejects.toThrow();
    });

    it("throws on an empty buffer", async () => {
      const buffer = Buffer.alloc(0);
      await expect(extractDocxText(buffer)).rejects.toThrow();
    });

    it("throws on a PDF buffer passed as DOCX", async () => {
      const buffer = loadFixture("simple.pdf");
      await expect(extractDocxText(buffer)).rejects.toThrow();
    });
  });
});

describe("extractTextFromBuffer", () => {
  it("routes .txt files to plain text extractor", async () => {
    const buffer = loadFixture("sample.txt");
    const text = await extractTextFromBuffer(buffer, "text/plain", "file.txt");
    expect(text).toContain("CS 101");
  });

  it("routes .md files to plain text extractor", async () => {
    const buffer = loadFixture("sample.md");
    const text = await extractTextFromBuffer(
      buffer,
      "text/markdown",
      "file.md",
    );
    expect(text).toContain("ENG 200");
  });

  it("routes .pdf files to PDF extractor", async () => {
    const buffer = loadFixture("simple.pdf");
    const text = await extractTextFromBuffer(
      buffer,
      "application/pdf",
      "file.pdf",
    );
    expect(text).toContain("Sample PDF");
  });

  it("routes .docx files to DOCX extractor", async () => {
    const buffer = loadFixture("programming-syllabus.docx");
    const text = await extractTextFromBuffer(
      buffer,
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "file.docx",
    );
    expect(text).toContain("Introduction to Programming in Python");
  });

  it("routes by extension when mime type is empty", async () => {
    const buffer = loadFixture("sample.txt");
    const text = await extractTextFromBuffer(buffer, "", "notes.txt");
    expect(text).toContain("CS 101");
  });

  it("returns empty string for unrecognized file type", async () => {
    const buffer = Buffer.from("some content");
    const text = await extractTextFromBuffer(buffer, "image/png", "photo.png");
    expect(text).toBe("");
  });

  it("returns empty string for empty mime and unsupported extension", async () => {
    const buffer = Buffer.from("data");
    const text = await extractTextFromBuffer(buffer, "", "file.csv");
    expect(text).toBe("");
  });
});
