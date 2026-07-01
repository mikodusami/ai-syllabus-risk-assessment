# Syllabus Risk Assessment

Analyze university course syllabi for assignments and assessments vulnerable to generative AI misuse. Upload a syllabus, get a risk score (0–100) with specific issues and actionable recommendations.

## How It Works

1. Upload a syllabus (PDF, DOCX, TXT, or Markdown)
2. Text is extracted and estimated for token count
3. The content is sent to an LLM for risk analysis
4. A report is returned with a numeric risk score, identified issues, and recommendations

## Risk Score

The AI returns a numeric score from 0–100 which maps to severity levels:

| Score  | Severity | Meaning                                                            |
| ------ | -------- | ------------------------------------------------------------------ |
| 0–19   | Low      | Minimal risk — assessments are primarily proctored or AI-resistant |
| 20–39  | Low      | Minor vulnerabilities worth noting                                 |
| 40–59  | Medium   | Mix of AI-vulnerable and AI-resistant assessments                  |
| 60–79  | Medium   | Multiple major assessments vulnerable to AI misuse                 |
| 80–100 | High     | Most assessments can be completed with AI, few safeguards          |

## Analysis Strategies

For documents within the token limit (~8,000 tokens), a single direct API call is used. For larger documents, two strategies are available:

- **Chunked** — Splits the document into sections, analyzes each for risks, then merges and deduplicates. More thorough, uses multiple API calls.
- **Summarize** — Extracts only assignments/assessments from each section, then runs risk analysis on the condensed list. Faster but may miss contextual risk signals.

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript
- Vitest (testing)
- [VT ARC LLM API](https://llm.arc.vt.edu) (OpenAI-compatible)
- pdf-parse (PDF extraction)
- mammoth (DOCX extraction)

## Setup

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Add your VT ARC API key to .env.local
```

### Environment Variables

| Variable          | Description                                                 |
| ----------------- | ----------------------------------------------------------- |
| `VT_ARC_API_KEY`  | Your VT ARC LLM API key                                     |
| `VT_ARC_API_BASE` | API base URL (default: `https://llm-api.arc.vt.edu/api/v1`) |
| `VT_ARC_MODEL`    | Primary model for analysis                                  |

## Development

```bash
npm run dev       # Start dev server
npm run test      # Run tests
npm run build     # Production build
npm run lint      # Lint
```

## Project Structure

```
app/
  api/
    analyze/    — POST endpoint: full syllabus analysis
    config/     — GET endpoint: app config (models, limits)
    preview/    — POST endpoint: extract text + token estimate
  page.tsx      — Main upload page
  mock/         — Mock data page for development
components/
  UploadForm.tsx — File upload, strategy selection, model picker
  Report.tsx     — Risk report display with score visualization
lib/
  api.ts        — LLM API calls (direct, chunked, summarize strategies)
  extract.ts    — Text extraction (PDF, DOCX, plain text), validation, token estimation
  types.ts      — TypeScript interfaces
  mock-data.ts  — Mock analysis results for development
  __tests__/    — Unit tests and fixture files
```

## Test Fixtures

The `lib/__tests__/fixtures/` directory contains numbered test files organized by type:

- `01–04` — Edge cases and simple syllabi (empty, plain text, unicode, short markdown)
- `05–10` — Markdown syllabi with various prompt injection techniques (base64, homoglyph, HTML comments, role injection, zero-width characters)
- `11–18` — PDF fixtures (simple to complex layouts, tables, images)
- `19–20` — DOCX fixtures (humanities, programming courses)
