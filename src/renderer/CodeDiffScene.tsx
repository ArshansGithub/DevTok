import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { STYLE } from '../config';
import { useSceneTransition } from './useSceneTransition';
import type { CodeDiffScene as CodeDiffSceneType } from '../schema';

export const CodeDiffScene: React.FC<{
    data: CodeDiffSceneType['data'];
    durationInFrames: number;
}> = ({ data, durationInFrames }) => {
    const frame = useCurrentFrame();
    const transition = useSceneTransition(durationInFrames);

    return (
        <div
            style={{
                position: 'absolute',
                top: 140,
                left: STYLE.layout.padding - 8,
                right: STYLE.layout.padding - 8,
                ...transition.style,
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
                        display: 'flex', alignItems: 'center', gap: 8,
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
                    <span style={{
                        fontFamily: STYLE.fonts.mono, fontSize: 13, color: STYLE.colors.accent,
                        fontWeight: 700, marginLeft: 'auto', letterSpacing: 2,
                    }}>
                        DIFF
                    </span>
                </div>

                {/* Diff lines */}
                <div style={{ padding: '16px 0', fontFamily: STYLE.fonts.mono, fontSize: 18, lineHeight: 1.7 }}>
                    {data.lines.map((line, i) => {
                        const delay = i * 3;
                        const lineOpacity = interpolate(frame, [delay + 2, delay + 8], [0, 1], {
                            extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
                        });

                        const prefix = line.charAt(0);
                        let bgColor: string = 'transparent';
                        let textColor: string = STYLE.colors.text;
                        let prefixColor: string = STYLE.colors.textMuted;

                        if (prefix === '+') {
                            bgColor = 'rgba(34, 197, 94, 0.12)';
                            textColor = '#4ADE80';
                            prefixColor = '#22C55E';
                        } else if (prefix === '-') {
                            bgColor = 'rgba(239, 68, 68, 0.12)';
                            textColor = '#F87171';
                            prefixColor = '#EF4444';
                        }

                        return (
                            <div key={i} style={{
                                padding: '2px 20px', background: bgColor, color: textColor,
                                opacity: lineOpacity, display: 'flex', gap: 12,
                            }}>
                                <span style={{ color: prefixColor, fontWeight: 700, width: 14, flexShrink: 0, textAlign: 'center' }}>
                                    {prefix === '+' || prefix === '-' ? prefix : ' '}
                                </span>
                                <span style={{ whiteSpace: 'pre-wrap' }}>
                                    {prefix === '+' || prefix === '-' ? line.slice(1) : line}
                                </span>
                            </div>
                        );
                    })}
                </div>

                {data.caption && (
                    <div style={{
                        padding: '8px 20px 16px', fontFamily: STYLE.fonts.heading,
                        fontSize: 18, color: STYLE.colors.textMuted, fontStyle: 'italic',
                        opacity: interpolate(frame, [6, 16], [0, 1], { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' }),
                    }}>
                        {data.caption}
                    </div>
                )}
            </div>
        </div>
    );
};
