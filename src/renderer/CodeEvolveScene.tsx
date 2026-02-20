import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { STYLE } from '../config';
import type { CodeEvolveScene as CodeEvolveSceneType } from '../schema';

export const CodeEvolveScene: React.FC<{
    data: CodeEvolveSceneType['data'];
    fromHtml?: string;
    toHtml?: string;
    durationInFrames: number;
}> = ({ data, fromHtml, toHtml, durationInFrames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Crossfade: first half shows "from", second half shows "to"
    const midpoint = durationInFrames * 0.45;
    const transitionDuration = 10; // frames

    const fromOpacity = interpolate(
        frame,
        [midpoint - transitionDuration / 2, midpoint + transitionDuration / 2],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );
    const toOpacity = interpolate(
        frame,
        [midpoint - transitionDuration / 2, midpoint + transitionDuration / 2],
        [0, 1],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );

    const containerSpring = spring({ frame, fps, config: STYLE.motion.spring });
    const containerOpacity = interpolate(frame, [0, 8], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const versionLabel = frame < midpoint ? 'BEFORE' : 'AFTER';
    const labelColor = frame < midpoint ? STYLE.colors.warning : STYLE.colors.accentAlt;

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
                    <span
                        style={{
                            fontFamily: STYLE.fonts.mono,
                            fontSize: 13,
                            color: labelColor,
                            fontWeight: 700,
                            marginLeft: 'auto',
                            letterSpacing: 2,
                        }}
                    >
                        {versionLabel}
                    </span>
                </div>

                {/* Code area — layered crossfade */}
                <div style={{ position: 'relative', padding: '24px 24px', minHeight: 80 }}>
                    <div
                        style={{
                            position: 'absolute',
                            top: 24,
                            left: 24,
                            right: 24,
                            fontFamily: STYLE.fonts.mono,
                            fontSize: 20,
                            lineHeight: 1.6,
                            color: STYLE.colors.text,
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'break-word',
                            opacity: fromOpacity,
                        }}
                    >
                        {fromHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: fromHtml }} />
                        ) : (
                            <code>{data.from}</code>
                        )}
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            fontFamily: STYLE.fonts.mono,
                            fontSize: 20,
                            lineHeight: 1.6,
                            color: STYLE.colors.text,
                            whiteSpace: 'pre-wrap',
                            overflowWrap: 'break-word',
                            opacity: toOpacity,
                        }}
                    >
                        {toHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: toHtml }} />
                        ) : (
                            <code>{data.to}</code>
                        )}
                    </div>
                </div>

                {/* Caption */}
                {data.caption && (
                    <div
                        style={{
                            padding: '12px 24px 20px',
                            fontFamily: STYLE.fonts.heading,
                            fontSize: 20,
                            color: STYLE.colors.textMuted,
                            fontStyle: 'italic',
                            opacity: interpolate(frame, [4, 14], [0, 1], {
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
