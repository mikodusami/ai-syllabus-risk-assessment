import type { CSSProperties } from "react";
import type { AnalysisResult } from "@/lib/types";

interface ReportProps {
  data: AnalysisResult;
}

export default function Report({ data }: ReportProps) {
  return (
    <div style={_styles.container}>
      <h2 style={_styles.title}>AI Risk Assessment Report</h2>

      <div style={_styles.summarySection}>
        <p>
          <strong>Course:</strong> {data.course}
        </p>
      </div>

      <h3 style={_styles.sectionTitle}>Issues Found ({data.issues.length})</h3>

      {data.issues.map((issue, index) => (
        <div key={index} style={_styles.issueCard}>
          <h4 style={_styles.issueTitle}>
            {index + 1}. {issue.title}
          </h4>
          <p style={_styles.issueText}>
            <strong>Current:</strong> {issue.description}
          </p>
          <p style={_styles.issueText}>
            <strong>Risk:</strong> {issue.risk}
          </p>
          <p>
            <strong>Recommendation:</strong> {issue.recommendation}
          </p>
        </div>
      ))}

      <div style={_styles.summaryContainer}>
        <h3 style={_styles.sectionTitle}>Summary</h3>
        <p>{data.summary}</p>
      </div>
    </div>
  );
}

const _styles = {
  container: {
    borderTop: "2px solid #000",
    paddingTop: "1.5rem",
  },
  title: {
    fontWeight: "bold",
    fontSize: "1.5rem",
    marginBottom: "0.5rem",
  },
  summarySection: {
    marginBottom: "1.5rem",
  },
  sectionTitle: {
    fontWeight: "bold",
    fontSize: "1.25rem",
    marginBottom: "0.75rem",
  },
  issueCard: {
    border: "1px solid #ddd",
    padding: "1rem",
    marginBottom: "1rem",
  },
  issueTitle: {
    fontWeight: "bold",
    marginBottom: "0.5rem",
  },
  issueText: {
    marginBottom: "0.5rem",
  },
  summaryContainer: {
    marginTop: "1.5rem",
    borderTop: "1px solid #ddd",
    paddingTop: "1rem",
  },
} satisfies Record<string, CSSProperties>;
