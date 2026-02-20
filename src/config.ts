/** Global styling and pipeline config */

export const STYLE = {
    fonts: {
        heading: 'Inter, system-ui, sans-serif',
        mono: "'JetBrains Mono', 'Fira Code', monospace",
    },
    colors: {
        text: '#F1F5F9',
        textMuted: '#94A3B8',
        accent: '#818CF8',
        accentAlt: '#34D399',
        surface: 'rgba(15, 23, 42, 0.88)',
        surfaceLight: 'rgba(30, 41, 59, 0.85)',
        border: 'rgba(148, 163, 184, 0.15)',
        warning: '#F59E0B',
        error: '#EF4444',
    },
    layout: {
        padding: 48,
        gap: 24,
        borderRadius: 16,
    },
    motion: {
        /** Standard spring config for snappy TikTok pacing */
        spring: { damping: 18, mass: 0.8, stiffness: 200 },
    },
} as const;

export const DEFAULTS = {
    width: 1080,
    height: 1920,
    fps: 30,
    codec: 'webm' as 'webm' | 'prores4444',
    provider: 'gemini' as 'chatgpt' | 'gemini',
} as const;
