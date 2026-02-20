import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { STYLE } from '../config';
import type { TerminalScene as TerminalSceneType } from '../schema';

export const TerminalScene: React.FC<{
    data: TerminalSceneType['data'];
    durationInFrames: number;
}> = ({ data, durationInFrames }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const containerSpring = spring({ frame, fps, config: STYLE.motion.spring });
    const containerOpacity = interpolate(frame, [0, 8], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Typing animation for command
    const commandChars = data.command.length;
    const typingDuration = Math.min(commandChars * 1.2, durationInFrames * 0.35);
    const charsShown = Math.floor(
        interpolate(frame, [4, 4 + typingDuration], [0, commandChars], {
            extrapolateLeft: 'clamp',
            extrapolateRight: 'clamp',
        }),
    );
    const commandText = data.command.slice(0, charsShown);

    // Cursor blink
    const cursorVisible = charsShown < commandChars || Math.floor(frame / 8) % 2 === 0;

    // Output appears after typing finishes
    const outputDelay = 4 + typingDuration + 6;
    const outputOpacity = interpolate(frame, [outputDelay, outputDelay + 8], [0, 1], {
        extrapolateLeft: 'clamp',
        extrapolateRight: 'clamp',
    });

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
                    background: '#0D1117',
                    borderRadius: STYLE.layout.borderRadius,
                    overflow: 'hidden',
                    border: '1px solid rgba(48, 54, 61, 0.8)',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                }}
            >
                {/* Terminal title bar */}
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '12px 18px',
                        borderBottom: '1px solid rgba(48, 54, 61, 0.6)',
                        background: 'rgba(22, 27, 34, 0.9)',
                    }}
                >
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#EF4444' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#F59E0B' }} />
                    <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#22C55E' }} />
                    <span
                        style={{
                            fontFamily: STYLE.fonts.mono,
                            fontSize: 13,
                            color: '#8B949E',
                            marginLeft: 8,
                        }}
                    >
                        terminal
                    </span>
                </div>

                {/* Terminal body */}
                <div style={{ padding: '20px 20px', fontFamily: STYLE.fonts.mono, fontSize: 18, lineHeight: 1.7 }}>
                    {/* Command line */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                        <span style={{ color: '#7EE787', fontWeight: 700, marginRight: 8 }}>$</span>
                        <span style={{ color: '#E6EDF3', whiteSpace: 'pre-wrap' }}>{commandText}</span>
                        {cursorVisible && (
                            <span
                                style={{
                                    display: 'inline-block',
                                    width: 10,
                                    height: 20,
                                    background: '#E6EDF3',
                                    marginLeft: 1,
                                    verticalAlign: 'middle',
                                }}
                            />
                        )}
                    </div>

                    {/* Output */}
                    {data.output && (
                        <div
                            style={{
                                marginTop: 12,
                                color: '#8B949E',
                                whiteSpace: 'pre-wrap',
                                opacity: outputOpacity,
                                overflowWrap: 'break-word',
                            }}
                        >
                            {data.output}
                        </div>
                    )}
                </div>

                {/* Caption */}
                {data.caption && (
                    <div
                        style={{
                            padding: '8px 20px 16px',
                            fontFamily: STYLE.fonts.heading,
                            fontSize: 18,
                            color: '#8B949E',
                            fontStyle: 'italic',
                            opacity: interpolate(frame, [outputDelay + 4, outputDelay + 14], [0, 1], {
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
