/**
 * LLM Prompt Templates — Code-Centric
 * Heavily biased toward code visualizations.
 */

export function buildGenerationPrompt(script: string): string {
    return `You are a code-visualization planner for short developer TikTok videos.

TASK:
Read the TikTok script below. Produce a JSON storyboard array where each element is a visual "beat" — a code-centric overlay that appears on-screen above a talking-head video.

CRITICAL: Almost every beat should show CODE. The purpose of this overlay is to visualize what the developer is verbally talking about. Think: code snippets, transformations, diffs, comparisons, terminal output. NOT: bullet points, diagrams, abstract graphics.

RULES:
- Output ONLY a valid JSON array. No commentary, no markdown fences, no explanation.
- Each beat: { "start": seconds, "end": seconds, "type": string, "data": object }
- Segment durations: 1.5–5 seconds (TikTok pacing)
- Estimate total duration at ~2.5 words/sec of the script
- Beats MUST NOT overlap in time
- Code snippets must be small (1–10 lines), realistic, correctly formatted
- Use real, common libraries only — no hallucinated imports
- 80%+ of beats MUST be code-showing types (code-block, code-evolve, code-diff, code-compare, code-highlight, terminal)
- Use "title" only for the opening beat
- Use "callout" sparingly for punchlines (max 1–2 beats total)

SCENE TYPES:

1. "code-block" — Show a code snippet
   data: { "language": string, "code": string, "fileName"?: string }

2. "code-evolve" — Animate code changing from version A to version B
   data: { "language": string, "from": string, "to": string, "highlights"?: [{ "token": string, "at": number }], "caption"?: string }
   highlights[].at = 0–1 fraction of beat

3. "code-diff" — Show inline diff with +/- lines
   data: { "language": string, "lines": string[], "fileName"?: string, "caption"?: string }
   Each line starts with "+" (added), "-" (removed), or " " (context)

4. "code-compare" — Two code blocks side-by-side (stacked vertically)
   data: { "language": string, "left": { "label": string, "code": string }, "right": { "label": string, "code": string } }

5. "code-highlight" — Code block with specific lines highlighted/pulsing
   data: { "language": string, "code": string, "highlightLines": number[], "fileName"?: string, "caption"?: string }
   highlightLines = 1-indexed line numbers

6. "terminal" — Terminal showing a command and its output
   data: { "command": string, "output": string, "caption"?: string }

7. "title" — Opening title only
   data: { "text": string, "subtitle"?: string }

8. "callout" — Short punchline text
   data: { "text": string, "emphasizedTokens"?: string[] }

9. "code-scroll" — Long code that auto-scrolls through
   data: { "language": string, "code": string, "fileName"?: string }

PRIORITIES:
- When the script talks about a change → use "code-evolve" or "code-diff"
- When comparing two approaches → use "code-compare"
- When pointing at specific lines → use "code-highlight"
- When showing errors or commands → use "terminal"
- When showing any code → use "code-block" or "code-scroll"
- Keep text in code realistic and small

SCRIPT:
${script}

OUTPUT (JSON array only):`;
}

export function buildFixerPrompt(
    invalidJson: string,
    errors: string,
): string {
    return `You are a JSON repair assistant. The following JSON was supposed to be a valid storyboard array but has errors.

ERRORS:
${errors}

INVALID JSON:
${invalidJson}

RULES:
- Fix the JSON so it validates against the schema.
- Output ONLY the corrected JSON array. No commentary, no markdown, no explanation.
- Do NOT change the creative content — only fix structural/schema issues.
- Each beat must have: "start" (number), "end" (number), "type" (string), "data" (object matching the type).
- Valid types: "title", "callout", "code-block", "code-evolve", "code-diff", "code-compare", "code-highlight", "terminal", "code-scroll".

CORRECTED JSON:`;
}
