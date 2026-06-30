import type { CSSProperties } from "react";
import type { AnalysisResult } from "@/lib/types";

interface ReportProps {
  data: AnalysisResult;
}

// [threshold, meaning, color, severity]
// riskLevel (0-100) gets matched to whichever threshold it's closest to.
type RiskRange = [
  threshold: number,
  meaning: string,
  color: string,
  severity: "low" | "medium" | "high",
];

const riskLevelRangeDefinition: RiskRange[] = [
  [0, "Minimal risk - no notable concerns identified", "#007700", "Low"],
  [20, "Low risk - minor items worth noting", "#4d9900", "Low"],
  [40, "Moderate risk - some issues should be reviewed", "#cc9900", "Medium"],
  [60, "Elevated risk - multiple issues need attention", "#cc7700", "Medium"],
  [80, "High risk - significant issues require action", "#cc3300", "High"],
  [100, "Critical risk - immediate review required", "#cc0000", "High"],
];

function getRiskLevelRange(riskLevel: number): RiskRange {
  // Find the definition whose threshold is closest to riskLevel.
  // Scans back-to-front so ties favor the higher (more severe) threshold.
  let closest: RiskRange | null = null;
  let minDiff = Number.MAX_VALUE;

  for (let i = riskLevelRangeDefinition.length - 1; i >= 0; i--) {
    const candidate = riskLevelRangeDefinition[i];
    const diff = Math.abs(candidate[0] - riskLevel);
    if (diff < minDiff) {
      minDiff = diff;
      closest = candidate;
    }
  }

  return closest ?? [-1, "Risk level unknown", "#999999", "low"];
}

export default function Report({ data }: ReportProps) {
  const riskRange = getRiskLevelRange(data.riskLevel);
  const riskColor = riskRange[2];
  const riskMessage = riskRange[1];
  const riskLevel = riskRange[riskLevelRangeDefinition[0].length - 1];

  return (
    <div style={_styles.container}>
      <h2 style={_styles.title}>AI Risk Assessment Report</h2>

      <div style={_styles.summarySection}>
        <p>
          <strong>Course:</strong> {data.course}
        </p>
        <p>
          <strong>Overall Risk Level:</strong>{" "}
          <span style={{ ..._styles.riskValue, color: riskColor }}>
            {riskLevel}
            {": "} {riskMessage}
          </span>
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
  riskValue: {
    fontWeight: "bold",
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
