/**
 * LLM CLI Orchestrator
 * Shells out to chatgpt or gemini CLI, captures stdout, extracts JSON.
 */

import { execSync } from 'child_process';
import { StoryboardSchema, type Storyboard } from './schema';
import { buildGenerationPrompt, buildFixerPrompt } from './prompts';

export interface LLMConfig {
    provider: 'chatgpt' | 'gemini';
    /** Override the CLI command if needed (e.g. full path) */
    command?: string;
}

function getCliCommand(config: LLMConfig): string {
    if (config.command) return config.command;
    return config.provider === 'chatgpt' ? 'chatgpt' : 'gemini';
}

/**
 * Extract the first JSON array or object from a string that may contain
 * leading/trailing prose, markdown fences, etc.
 */
export function extractJson(raw: string): string {
    // Strip markdown code fences
    let cleaned = raw.replace(/```(?:json)?\s*/gi, '').replace(/```/g, '');

    // Find the first [ ... ] or { ... } using bracket matching
    const startIdx = cleaned.search(/[\[{]/);
    if (startIdx === -1) {
        throw new Error('No JSON array or object found in LLM output');
    }

    const openChar = cleaned[startIdx];
    const closeChar = openChar === '[' ? ']' : '}';
    let depth = 0;
    let inString = false;
    let escape = false;

    for (let i = startIdx; i < cleaned.length; i++) {
        const ch = cleaned[i];

        if (escape) {
            escape = false;
            continue;
        }
        if (ch === '\\' && inString) {
            escape = true;
            continue;
        }
        if (ch === '"') {
            inString = !inString;
            continue;
        }
        if (inString) continue;

        if (ch === openChar) depth++;
        if (ch === closeChar) depth--;

        if (depth === 0) {
            return cleaned.slice(startIdx, i + 1);
        }
    }

    // If bracket matching fails, fall back to the rest of the string
    return cleaned.slice(startIdx);
}

function callLLM(config: LLMConfig, prompt: string): string {
    const cmd = getCliCommand(config);

    // Escape prompt for shell: write to a temp approach via stdin
    const escapedPrompt = prompt.replace(/'/g, "'\\''");

    let shellCmd: string;
    if (config.provider === 'gemini') {
        // Gemini CLI: echo prompt | gemini ...
        shellCmd = `echo '${escapedPrompt}' | ${cmd}`;
    } else {
        // ChatGPT CLI
        shellCmd = `echo '${escapedPrompt}' | ${cmd}`;
    }

    try {
        const stdout = execSync(shellCmd, {
            encoding: 'utf-8',
            timeout: 120_000, // 2 minute timeout
            maxBuffer: 10 * 1024 * 1024, // 10MB
            stdio: ['pipe', 'pipe', 'pipe'],
        });
        return stdout;
    } catch (err: any) {
        const msg = err.stderr?.toString() || err.message || 'Unknown LLM CLI error';
        throw new Error(`LLM CLI (${config.provider}) failed: ${msg}`);
    }
}

/**
 * Generate a storyboard from a script using the configured LLM CLI.
 * Implements a two-pass approach with up to 2 retries for validation errors.
 */
export async function generateStoryboard(
    script: string,
    config: LLMConfig,
): Promise<Storyboard> {
    const MAX_RETRIES = 2;

    // Pass 1: Generate
    console.log(`[llm] Calling ${config.provider} CLI to generate storyboard...`);
    const raw = callLLM(config, buildGenerationPrompt(script));

    let jsonStr: string;
    try {
        jsonStr = extractJson(raw);
    } catch {
        throw new Error(
            `[llm] Could not extract JSON from ${config.provider} output.\n` +
            `Raw output (first 500 chars):\n${raw.slice(0, 500)}\n\n` +
            `Suggested fix: Ensure your ${config.provider} CLI is authenticated and working. ` +
            `Try running: echo "hello" | ${getCliCommand(config)}`
        );
    }

    // Try to parse and validate
    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonStr);
    } catch (parseErr: any) {
        // JSON is malformed — try fixer
        console.log('[llm] JSON parse failed, attempting fixer pass...');
        return await retryWithFixer(jsonStr, parseErr.message, config, MAX_RETRIES);
    }

    const result = StoryboardSchema.safeParse(parsed);
    if (result.success) {
        console.log(`[llm] Storyboard generated successfully (${result.data.length} beats)`);
        return result.data;
    }

    // Validation failed — try fixer
    const errors = formatZodErrors(result.error);
    console.log(`[llm] Validation failed, attempting fixer pass...\n${errors}`);
    return await retryWithFixer(jsonStr, errors, config, MAX_RETRIES);
}

async function retryWithFixer(
    invalidJson: string,
    errors: string,
    config: LLMConfig,
    retriesLeft: number,
): Promise<Storyboard> {
    if (retriesLeft <= 0) {
        throw new Error(
            `[llm] Failed to produce valid storyboard after retries.\n` +
            `Last errors:\n${errors}\n\n` +
            `Last JSON (first 1000 chars):\n${invalidJson.slice(0, 1000)}`
        );
    }

    console.log(`[llm] Fixer pass (${retriesLeft} retries remaining)...`);
    const fixerPrompt = buildFixerPrompt(invalidJson, errors);
    const raw = callLLM(config, fixerPrompt);

    let jsonStr: string;
    try {
        jsonStr = extractJson(raw);
    } catch {
        return retryWithFixer(invalidJson, 'Could not extract JSON from fixer output', config, retriesLeft - 1);
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(jsonStr);
    } catch (parseErr: any) {
        return retryWithFixer(jsonStr, parseErr.message, config, retriesLeft - 1);
    }

    const result = StoryboardSchema.safeParse(parsed);
    if (result.success) {
        console.log(`[llm] Fixer pass succeeded (${result.data.length} beats)`);
        return result.data;
    }

    const newErrors = formatZodErrors(result.error);
    return retryWithFixer(jsonStr, newErrors, config, retriesLeft - 1);
}

function formatZodErrors(error: any): string {
    if (error?.issues) {
        return error.issues
            .map((issue: any) => `  - Path: ${issue.path.join('.')} — ${issue.message}`)
            .join('\n');
    }
    return String(error);
}
