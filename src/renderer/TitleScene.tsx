import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { STYLE } from '../config';
import type { TitleScene as TitleSceneType } from '../schema';

export const TitleScene: React.FC<{ data: TitleSceneType['data'] }> = ({
    data,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const titleY = spring({ frame, fps, config: STYLE.motion.spring }) * 30 - 30;
    const titleOpacity = interpolate(frame, [0, 8], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const subtitleOpacity = interpolate(frame, [6, 16], [0, 1], {
        extrapolateRight: 'clamp',
    });
    const subtitleY = spring({
        frame: Math.max(0, frame - 6),
        fps,
        config: STYLE.motion.spring,
    }) * 20 - 20;

    const accentWidth = interpolate(frame, [0, 12], [0, 80], {
        extrapolateRight: 'clamp',
    });

    return (
        <div
            style={{
                position: 'absolute',
                top: 160,
                left: STYLE.layout.padding,
                right: STYLE.layout.padding,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                gap: 16,
            }}
        >
            {/* Accent bar */}
            <div
                style={{
                    width: accentWidth,
                    height: 4,
                    background: `linear-gradient(90deg, ${STYLE.colors.accent}, ${STYLE.colors.accentAlt})`,
                    borderRadius: 2,
                }}
            />

            {/* Title */}
            <h1
                style={{
                    fontFamily: STYLE.fonts.heading,
                    fontSize: 64,
                    fontWeight: 800,
                    color: STYLE.colors.text,
                    margin: 0,
                    lineHeight: 1.1,
                    opacity: titleOpacity,
                    transform: `translateY(${titleY}px)`,
                    textShadow: '0 4px 24px rgba(0,0,0,0.4)',
                }}
            >
                {data.text}
            </h1>

            {/* Subtitle */}
            {data.subtitle && (
                <p
                    style={{
                        fontFamily: STYLE.fonts.heading,
                        fontSize: 28,
                        fontWeight: 400,
                        color: STYLE.colors.textMuted,
                        margin: 0,
                        lineHeight: 1.4,
                        opacity: subtitleOpacity,
                        transform: `translateY(${subtitleY}px)`,
                    }}
                >
                    {data.subtitle}
                </p>
            )}
        </div>
    );
};
