import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { STYLE } from '../config';
import type { CodeHighlightScene as CodeHighlightSceneType } from '../schema';

export const CodeHighlightScene: React.FC<{
    data: CodeHighlightSceneType['data'];
    highlightedHtml?: string;
}> = ({ data, highlightedHtml }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const containerSpring = spring({ frame, fps, config: STYLE.motion.spring });
    const containerOpacity = interpolate(frame, [0, 8], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const lines = data.code.split('\n');

    // Pulsing glow for highlighted lines
    const glowIntensity = interpolate(
        Math.sin(frame * 0.15),
        [-1, 1],
        [0.3, 0.7],
    );

    return (
        <div
            style={{
                position: 'absolute',
                top: 140,
                left: STYLE.layout.padding - 8,
                right: STYLE.layout.padding - 8,
                opacity: containerOpacity,
                transform: `scale(${interpolate(containerSpring, [0, 1], [0.95, 1])})`,
            }}
        >
            <div
                style={{
                    background: STYLE.colors.surface,
                    borderRadius: STYLE.layout.borderRadius,
                    overflow: 'hidden',
                    border: `1px solid ${STYLE.colors.border}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
            >
                {/* Title bar */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '14px 20px',
                        borderBottom: `1px solid ${STYLE.colors.border}`,
                    }}
                >
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E' }} />
                    {data.fileName && (
                        <span style={{ fontFamily: STYLE.fonts.mono, fontSize: 14, color: STYLE.colors.textMuted, marginLeft: 8 }}>
                            {data.fileName}
                        </span>
                    )}
                    <span
                        style={{
                            fontFamily: STYLE.fonts.mono,
                            fontSize: 13,
                            color: STYLE.colors.textMuted,
                            marginLeft: 'auto',
                            textTransform: 'uppercase',
                            letterSpacing: 1,
                        }}
                    >
                        {data.language}
                    </span>
                </div>

                {/* Code with line highlights */}
                <div style={{ padding: '16px 0', fontFamily: STYLE.fonts.mono, fontSize: 18, lineHeight: 1.7 }}>
                    {lines.map((line, i) => {
                        const lineNum = i + 1;
                        const isHighlighted = data.highlightLines.includes(lineNum);

                        return (
                            <div
                                key={i}
                                style={{
                                    padding: '1px 20px',
                                    background: isHighlighted
                                        ? `rgba(129, 140, 248, ${glowIntensity * 0.2})`
                                        : 'transparent',
                                    borderLeft: isHighlighted
                                        ? `3px solid ${STYLE.colors.accent}`
                                        : '3px solid transparent',
                                    color: isHighlighted ? STYLE.colors.text : `${STYLE.colors.text}88`,
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 16,
                                }}
                            >
                                <span
                                    style={{
                                        width: 28,
                                        textAlign: 'right',
                                        fontSize: 14,
                                        color: isHighlighted ? STYLE.colors.accent : `${STYLE.colors.textMuted}66`,
                                        flexShrink: 0,
                                        fontWeight: isHighlighted ? 700 : 400,
                                    }}
                                >
                                    {lineNum}
                                </span>
                                <span style={{ whiteSpace: 'pre-wrap' }}>{line}</span>
                            </div>
                        );
                    })}
                </div>

                {/* Caption */}
                {data.caption && (
                    <div
                        style={{
                            padding: '8px 20px 16px',
                            fontFamily: STYLE.fonts.heading,
                            fontSize: 18,
                            color: STYLE.colors.textMuted,
                            fontStyle: 'italic',
                            opacity: interpolate(frame, [6, 16], [0, 1], {
                                extrapolateLeft: 'clamp',
                                extrapolateRight: 'clamp',
                            }),
                        }}
                    >
                        {data.caption}
                    </div>
                )}
            </div>
        </div>
    );
};
