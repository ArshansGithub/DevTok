/**
 * LLM Prompt Templates — Code-Only
 * No text scenes. Every beat shows code.
 */

export function buildGenerationPrompt(script: string): string {
   return `You are a code-visualization planner for short developer TikTok videos.

TASK:
Read the TikTok script below. Produce a JSON storyboard array where each element is a visual "beat" — a code overlay that appears on-screen above a talking-head video.

CRITICAL: Every beat must show CODE. No titles, no bullet points, no text-only screens. The purpose of this overlay is to visually show what the developer is verbally talking about using code, diffs, terminals, and comparisons.

RULES:
- Output ONLY a valid JSON array. No commentary, no markdown fences, no explanation.
- Each beat: { "start": seconds, "end": seconds, "type": string, "data": object }
- Segment durations: 2–5 seconds (TikTok pacing)
- Estimate total duration at ~2.5 words/sec of the script
- Beats MUST NOT overlap in time
- Code snippets must be small (1–10 lines), realistic, correctly formatted
- Use real, common libraries only — no hallucinated imports
- Start with the first code beat immediately — no intro or title

SCENE TYPES:

1. "code-block" — Show a code snippet
   data: { "language": string, "code": string, "fileName"?: string }

2. "code-evolve" — Animate code changing from version A to version B
   data: { "language": string, "from": string, "to": string, "caption"?: string }

3. "code-diff" — Show inline diff with +/- lines
   data: { "language": string, "lines": string[], "fileName"?: string, "caption"?: string }
   Each line starts with "+" (added), "-" (removed), or " " (context)

4. "code-compare" — Two code blocks stacked vertically
   data: { "language": string, "left": { "label": string, "code": string }, "right": { "label": string, "code": string } }

5. "code-highlight" — Code block with specific lines highlighted
   data: { "language": string, "code": string, "highlightLines": number[], "fileName"?: string, "caption"?: string }

6. "terminal" — Terminal showing a command and its output
   data: { "command": string, "output": string, "caption"?: string }

7. "code-scroll" — Long code that auto-scrolls through
   data: { "language": string, "code": string, "fileName"?: string }

PRIORITIES:
- When the script talks about a change → use "code-evolve" or "code-diff"
- When comparing two approaches → use "code-compare"
- When pointing at specific lines → use "code-highlight"
- When showing errors or commands → use "terminal"
- When showing any code → use "code-block" or "code-scroll"

SCRIPT:
${script}

OUTPUT (JSON array only):`;
}

export function buildFixerPrompt(
   invalidJson: string,
   errors: string,
): string {
   return `Fix this JSON storyboard. Only fix structural/schema issues, don't change content.

ERRORS:
${errors}

INVALID JSON:
${invalidJson}

Valid types: "code-block", "code-evolve", "code-diff", "code-compare", "code-highlight", "terminal", "code-scroll".
Each beat: { "start": number, "end": number, "type": string, "data": object }

Output ONLY the corrected JSON array:`;
}
