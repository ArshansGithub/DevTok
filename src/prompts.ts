/**
 * LLM Prompt Templates
 * Pass 1: Generate storyboard JSON from a script
 * Pass 2: Fix invalid JSON using error messages
 */

export function buildGenerationPrompt(script: string): string {
    return `You are a motion-graphics storyboard planner for short developer TikTok videos.

TASK:
Read the following TikTok script and produce a JSON storyboard array.
Each element is a "beat" — a visual overlay segment that appears on-screen above a talking-head video.

RULES:
- Output ONLY a valid JSON array. No commentary, no markdown fences, no explanation.
- Each beat has: "start" (seconds), "end" (seconds), "type" (string), "data" (object).
- Segment durations should be 1.5–5 seconds (TikTok pacing).
- Total duration should match the rough speaking time of the script (estimate ~2.5 words/sec).
- Beats should NOT overlap in time.
- Keep text SHORT — these are visual overlays, not paragraphs.
- Code snippets must be small (1–8 lines), realistic, and language-tagged.
- Do NOT invent fake libraries. Use common, real ones.

AVAILABLE SCENE TYPES:
1. "title" — data: { "text": string, "subtitle"?: string }
2. "bullet" — data: { "title"?: string, "bullets": string[] }  (max 4 bullets)
3. "code-block" — data: { "language": string, "code": string, "fileName"?: string }
4. "code-evolve" — data: { "language": string, "from": string, "to": string, "highlights"?: [{ "token": string, "at": number }], "caption"?: string }
   - "highlights[].at" is a 0-1 fraction of the beat's duration
5. "callout" — data: { "text": string, "emphasizedTokens"?: string[] }
6. "diagram" — data: { "nodes": string[], "edges": [{ "from": string, "to": string, "label"?: string }] }
7. "metaphor-stack" — data: { "title"?: string, "layers": string[] }  (generic stacking metaphor)

GUIDELINES:
- Start with a "title" beat.
- Use a mix of scene types — don't repeat the same type 3+ times in a row.
- Prefer "code-evolve" when showing before/after code changes.
- Use "metaphor-stack" for conceptual layers, accumulation, or stacking ideas.
- Use "callout" for key one-liners or punchlines.
- Use "diagram" sparingly, only when relationships need visualization.
- Ensure every beat adds visual value — skip purely transitional script moments.

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
- Valid types: "title", "bullet", "code-block", "code-evolve", "callout", "diagram", "metaphor-stack".

CORRECTED JSON:`;
}
