import React from 'react';
import { useCurrentFrame, useVideoConfig } from 'remotion';
import { STYLE } from '../config';
import { useSceneTransition } from './useSceneTransition';
import type { CodeBlockScene as CodeBlockSceneType } from '../schema';

export const CodeBlockScene: React.FC<{
    data: CodeBlockSceneType['data'];
    highlightedHtml?: string;
    durationInFrames: number;
}> = ({ data, highlightedHtml, durationInFrames }) => {
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

                {/* Code */}
                <div
                    style={{
                        padding: '24px 24px',
                        fontFamily: STYLE.fonts.mono,
                        fontSize: 20,
                        lineHeight: 1.6,
                        color: STYLE.colors.text,
                        whiteSpace: 'pre-wrap',
                        overflowWrap: 'break-word',
                    }}
                >
                    {highlightedHtml ? (
                        <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} />
                    ) : (
                        <code>{data.code}</code>
                    )}
                </div>
            </div>
        </div>
    );
};
