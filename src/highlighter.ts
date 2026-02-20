/**
 * Shiki syntax highlighter utility.
 * Pre-highlights code blocks at build/render time and provides HTML strings
 * for the renderer components to use via dangerouslySetInnerHTML.
 */

import { createHighlighter, type Highlighter } from 'shiki';

let highlighterInstance: Highlighter | null = null;

const SUPPORTED_LANGS = [
    'typescript',
    'javascript',
    'python',
    'go',
    'rust',
    'java',
    'css',
    'html',
    'json',
    'bash',
    'sql',
    'yaml',
    'tsx',
    'jsx',
    'c',
    'cpp',
] as const;

// Alias mapping for common shorthand
const LANG_ALIASES: Record<string, string> = {
    ts: 'typescript',
    js: 'javascript',
    py: 'python',
    rs: 'rust',
    sh: 'bash',
    yml: 'yaml',
    'c++': 'cpp',
};

async function getHighlighter(): Promise<Highlighter> {
    if (!highlighterInstance) {
        highlighterInstance = await createHighlighter({
            themes: ['github-dark'],
            langs: [...SUPPORTED_LANGS],
        });
    }
    return highlighterInstance;
}

function resolveLanguage(lang: string): string {
    const lower = lang.toLowerCase();
    return LANG_ALIASES[lower] || lower;
}

/**
 * Highlight a code string and return HTML.
 * Falls back to plain text if the language isn't supported.
 */
export async function highlightCode(
    code: string,
    language: string,
): Promise<string> {
    const resolved = resolveLanguage(language);
    try {
        const highlighter = await getHighlighter();
        const html = highlighter.codeToHtml(code, {
            lang: resolved,
            theme: 'github-dark',
        });
        // Strip the wrapping <pre><code> tags — we render in our own container
        return html
            .replace(/<pre[^>]*>/, '')
            .replace(/<\/pre>/, '')
            .replace(/<code[^>]*>/, '')
            .replace(/<\/code>/, '');
    } catch {
        // Language not supported — return escaped plain text
        return escapeHtml(code);
    }
}

function escapeHtml(str: string): string {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;');
}
