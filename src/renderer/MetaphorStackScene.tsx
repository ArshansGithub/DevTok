import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { STYLE } from '../config';
import type { MetaphorStackScene as MetaphorStackSceneType } from '../schema';

export const MetaphorStackScene: React.FC<{
    data: MetaphorStackSceneType['data'];
}> = ({ data }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const containerOpacity = interpolate(frame, [0, 8], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const layerHeight = 52;
    const layerGap = 8;

    // Colors for layers — cycling through a palette
    const layerColors = [
        '#818CF8', // indigo
        '#34D399', // emerald
        '#F59E0B', // amber
        '#EC4899', // pink
        '#06B6D4', // cyan
        '#A78BFA', // violet
        '#FB923C', // orange
    ];

    return (
        <div
            style={{
                position: 'absolute',
                top: 160,
                left: STYLE.layout.padding,
                right: STYLE.layout.padding,
                opacity: containerOpacity,
            }}
        >
            {/* Title */}
            {data.title && (
                <h2
                    style={{
                        fontFamily: STYLE.fonts.heading,
                        fontSize: 32,
                        fontWeight: 700,
                        color: STYLE.colors.text,
                        margin: '0 0 24px 0',
                        opacity: interpolate(frame, [0, 10], [0, 1], {
                            extrapolateRight: 'clamp',
                        }),
                    }}
                >
                    {data.title}
                </h2>
            )}

            {/* Stack container */}
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column-reverse',
                    gap: layerGap,
                    alignItems: 'stretch',
                }}
            >
                {data.layers.map((layer, i) => {
                    const delay = i * 5;
                    const layerSpring = spring({
                        frame: Math.max(0, frame - delay),
                        fps,
                        config: { ...STYLE.motion.spring, damping: 14 },
                    });
                    const layerOpacity = interpolate(
                        frame,
                        [delay, delay + 8],
                        [0, 1],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                    );
                    const translateY = (1 - layerSpring) * 60;
                    const color = layerColors[i % layerColors.length];

                    return (
                        <div
                            key={i}
                            style={{
                                height: layerHeight,
                                background: `${color}18`,
                                borderLeft: `4px solid ${color}`,
                                borderRadius: 10,
                                display: 'flex',
                                alignItems: 'center',
                                padding: '0 24px',
                                fontFamily: STYLE.fonts.heading,
                                fontSize: 20,
                                fontWeight: 500,
                                color: STYLE.colors.text,
                                opacity: layerOpacity,
                                transform: `translateY(${translateY}px)`,
                                boxShadow: `0 2px 12px ${color}11`,
                            }}
                        >
                            <span
                                style={{
                                    width: 24,
                                    height: 24,
                                    borderRadius: 6,
                                    background: `${color}33`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 12,
                                    fontWeight: 700,
                                    color,
                                    marginRight: 14,
                                    flexShrink: 0,
                                }}
                            >
                                {i + 1}
                            </span>
                            {layer}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
