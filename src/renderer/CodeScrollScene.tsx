import React from 'react';
import { interpolate, useCurrentFrame } from 'remotion';
import { STYLE } from '../config';
import { useSceneTransition } from './useSceneTransition';
import type { CodeScrollScene as CodeScrollSceneType } from '../schema';

export const CodeScrollScene: React.FC<{
    data: CodeScrollSceneType['data'];
    highlightedHtml?: string;
    durationInFrames: number;
}> = ({ data, highlightedHtml, durationInFrames }) => {
    const frame = useCurrentFrame();
    const transition = useSceneTransition(durationInFrames);

    const lines = data.code.split('\n');
    const lineHeight = 32;
    const visibleHeight = 500;
    const totalHeight = lines.length * lineHeight;
    const maxScroll = Math.max(0, totalHeight - visibleHeight);

    const scrollY = interpolate(frame, [10, durationInFrames - 10], [0, maxScroll], {
        extrapolateLeft: 'clamp', extrapolateRight: 'clamp',
    });

    return (
        <div style={{
            position: 'absolute', top: 140,
            left: STYLE.layout.padding - 8, right: STYLE.layout.padding - 8,
            ...transition.style,
        }}>
            <div style={{
                background: STYLE.colors.surface,
                borderRadius: STYLE.layout.borderRadius,
                overflow: 'hidden',
                border: `1px solid ${STYLE.colors.border}`,
                boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
            }}>
                <div style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    padding: '14px 20px',
                    borderBottom: `1px solid ${STYLE.colors.border}`,
                }}>
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E' }} />
                    {data.fileName && (
                        <span style={{ fontFamily: STYLE.fonts.mono, fontSize: 14, color: STYLE.colors.textMuted, marginLeft: 8 }}>
                            {data.fileName}
                        </span>
                    )}
                    <span style={{
                        fontFamily: STYLE.fonts.mono, fontSize: 13, color: STYLE.colors.textMuted,
                        marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: 1,
                    }}>
                        {data.language}
                    </span>
                </div>

                <div style={{ height: visibleHeight, overflow: 'hidden', position: 'relative' }}>
                    {scrollY > 10 && (
                        <div style={{
                            position: 'absolute', top: 0, left: 0, right: 0, height: 40,
                            background: `linear-gradient(to bottom, ${STYLE.colors.surface}, transparent)`,
                            zIndex: 2, pointerEvents: 'none',
                        }} />
                    )}
                    <div style={{
                        transform: `translateY(${-scrollY}px)`,
                        padding: '16px 20px', fontFamily: STYLE.fonts.mono,
                        fontSize: 18, lineHeight: `${lineHeight}px`,
                        color: STYLE.colors.text, whiteSpace: 'pre-wrap', overflowWrap: 'break-word',
                    }}>
                        {highlightedHtml ? <div dangerouslySetInnerHTML={{ __html: highlightedHtml }} /> : <code>{data.code}</code>}
                    </div>
                    {scrollY < maxScroll - 10 && (
                        <div style={{
                            position: 'absolute', bottom: 0, left: 0, right: 0, height: 40,
                            background: `linear-gradient(to top, ${STYLE.colors.surface}, transparent)`,
                            zIndex: 2, pointerEvents: 'none',
                        }} />
                    )}
                </div>
            </div>
        </div>
    );
};
