// lib/mock-data.ts
import type { AnalysisResult } from "./types";

export const mockAnalysisLowRisk: AnalysisResult = {
  course: "AI Tool Etiquette for Teams",
  issues: [
    {
      title: "Outdated screenshot in Module 2",
      description:
        "The walkthrough screenshot shows a previous version of the chat interface that no longer matches the current UI.",
      risk: "Low - learners may be briefly confused, but the surrounding instructions still apply.",
      recommendation:
        "Swap in an updated screenshot during the next content pass.",
    },
  ],
  summary:
    "Overall risk is low. One cosmetic content issue was found; no action is urgent.",
};

export const mockAnalysisMediumRisk: AnalysisResult = {
  course: "Generative AI in the Workplace",
  issues: [
    {
      title: "No guidance on data confidentiality",
      description:
        "The module on AI tool usage doesn't cover what data is safe to paste into third-party AI tools.",
      risk: "Employees could inadvertently share confidential information with external AI services.",
      recommendation:
        "Add a dedicated section on data classification before the AI-tool walkthroughs.",
    },
    {
      title: "Inconsistent terminology",
      description:
        '"Hallucination," "confabulation," and "AI error" are used interchangeably without being defined.',
      risk: "Learners may not build a consistent, accurate vocabulary for discussing model limitations.",
      recommendation: "Standardize on one term and define it in the glossary.",
    },
  ],
  summary:
    "Moderate risk, driven mainly by the missing data-handling section. Addressing it would meaningfully lower the score.",
};

export const mockAnalysisHighRisk: AnalysisResult = {
  course: "AI-Assisted Customer Decisioning",
  issues: [
    {
      title: "No disclosure requirement for AI-assisted decisions",
      description:
        "The course never instructs staff to disclose when an AI system contributed to a customer-facing decision.",
      risk: "Potential regulatory exposure under emerging AI transparency requirements.",
      recommendation:
        "Add a mandatory disclosure step to the decision workflow covered in Module 5.",
    },
    {
      title: "Bias testing not covered",
      description:
        "The course never discusses testing models for disparate impact across customer segments.",
      risk: "Untested models could systematically disadvantage protected groups.",
      recommendation:
        "Introduce a bias-testing checklist ahead of the capstone exercise.",
    },
    {
      title: "No human-review fallback described",
      description:
        "Staff aren't told what to do when they disagree with an AI-generated recommendation.",
      risk: "Without an escalation path, incorrect AI outputs may go unchallenged.",
      recommendation:
        "Define and document a human-in-the-loop override process.",
    },
  ],
  summary:
    "High risk. Three issues touch on regulatory and fairness concerns that should be resolved before this course is rolled out further.",
};

export const mockAnalysisResults: AnalysisResult[] = [
  mockAnalysisLowRisk,
  mockAnalysisMediumRisk,
  mockAnalysisHighRisk,
];
