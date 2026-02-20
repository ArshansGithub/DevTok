import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { STYLE } from '../config';
import type { CalloutScene as CalloutSceneType } from '../schema';

export const CalloutScene: React.FC<{ data: CalloutSceneType['data'] }> = ({
    data,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const entrySpring = spring({ frame, fps, config: STYLE.motion.spring });
    const opacity = interpolate(frame, [0, 8], [0, 1], {
        extrapolateRight: 'clamp',
    });
    const translateY = (1 - entrySpring) * 40;

    // Highlight emphasized tokens by wrapping them in styled spans
    const renderText = () => {
        if (!data.emphasizedTokens || data.emphasizedTokens.length === 0) {
            return data.text;
        }

        let remaining = data.text;
        const parts: React.ReactNode[] = [];
        let key = 0;

        for (const token of data.emphasizedTokens) {
            const idx = remaining.indexOf(token);
            if (idx === -1) continue;

            if (idx > 0) {
                parts.push(<span key={key++}>{remaining.slice(0, idx)}</span>);
            }
            parts.push(
                <span
                    key={key++}
                    style={{
                        color: STYLE.colors.accent,
                        fontWeight: 700,
                        textShadow: `0 0 20px ${STYLE.colors.accent}44`,
                    }}
                >
                    {token}
                </span>,
            );
            remaining = remaining.slice(idx + token.length);
        }

        if (remaining) {
            parts.push(<span key={key++}>{remaining}</span>);
        }

        return parts;
    };

    return (
        <div
            style={{
                position: 'absolute',
                top: 200,
                left: STYLE.layout.padding,
                right: STYLE.layout.padding,
                opacity,
                transform: `translateY(${translateY}px)`,
            }}
        >
            <div
                style={{
                    background: STYLE.colors.surface,
                    borderRadius: STYLE.layout.borderRadius,
                    padding: '40px 36px',
                    borderLeft: `4px solid ${STYLE.colors.accent}`,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                }}
            >
                <p
                    style={{
                        fontFamily: STYLE.fonts.heading,
                        fontSize: 34,
                        fontWeight: 600,
                        color: STYLE.colors.text,
                        margin: 0,
                        lineHeight: 1.4,
                    }}
                >
                    {renderText()}
                </p>
            </div>
        </div>
    );
};
