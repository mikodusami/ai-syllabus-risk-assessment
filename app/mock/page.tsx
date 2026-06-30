import Report from "@/components/Report"; // ← adjust to wherever report.tsx actually lives
import {
  mockAnalysisLowRisk,
  mockAnalysisMediumRisk,
  mockAnalysisHighRisk,
} from "@/lib/mock-data";

export default function Page() {
  return (
    <main style={{ maxWidth: "720px", margin: "0 auto", padding: "2rem 1rem" }}>
      <Report data={mockAnalysisLowRisk} />
      <Report data={mockAnalysisMediumRisk} />
      <Report data={mockAnalysisHighRisk} />
    </main>
  );
}
