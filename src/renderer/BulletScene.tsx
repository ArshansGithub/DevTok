import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { STYLE } from '../config';
import type { BulletScene as BulletSceneType } from '../schema';

export const BulletScene: React.FC<{ data: BulletSceneType['data'] }> = ({
    data,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const containerOpacity = interpolate(frame, [0, 6], [0, 1], {
        extrapolateRight: 'clamp',
    });

    return (
        <div
            style={{
                position: 'absolute',
                top: 140,
                left: STYLE.layout.padding,
                right: STYLE.layout.padding,
                opacity: containerOpacity,
            }}
        >
            {/* Card */}
            <div
                style={{
                    background: STYLE.colors.surface,
                    borderRadius: STYLE.layout.borderRadius,
                    padding: 36,
                    border: `1px solid ${STYLE.colors.border}`,
                    backdropFilter: 'blur(12px)',
                }}
            >
                {data.title && (
                    <h2
                        style={{
                            fontFamily: STYLE.fonts.heading,
                            fontSize: 36,
                            fontWeight: 700,
                            color: STYLE.colors.text,
                            margin: '0 0 24px 0',
                        }}
                    >
                        {data.title}
                    </h2>
                )}

                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                    {data.bullets.map((bullet, i) => {
                        const delay = i * 6;
                        const bulletSpring = spring({
                            frame: Math.max(0, frame - delay),
                            fps,
                            config: STYLE.motion.spring,
                        });
                        const bulletOpacity = interpolate(
                            frame,
                            [delay, delay + 8],
                            [0, 1],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                        );
                        const bulletX = (1 - bulletSpring) * 30;

                        return (
                            <li
                                key={i}
                                style={{
                                    fontFamily: STYLE.fonts.heading,
                                    fontSize: 26,
                                    color: STYLE.colors.text,
                                    padding: '10px 0',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 14,
                                    opacity: bulletOpacity,
                                    transform: `translateX(${bulletX}px)`,
                                }}
                            >
                                <span
                                    style={{
                                        width: 8,
                                        height: 8,
                                        borderRadius: '50%',
                                        background: STYLE.colors.accent,
                                        flexShrink: 0,
                                    }}
                                />
                                {bullet}
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    );
};
