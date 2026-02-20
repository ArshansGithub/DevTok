import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { STYLE } from '../config';
import type { CodeCompareScene as CodeCompareSceneType } from '../schema';

export const CodeCompareScene: React.FC<{
    data: CodeCompareSceneType['data'];
    leftHtml?: string;
    rightHtml?: string;
}> = ({ data, leftHtml, rightHtml }) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const containerOpacity = interpolate(frame, [0, 8], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const topSpring = spring({ frame, fps, config: STYLE.motion.spring });
    const bottomSpring = spring({ frame: Math.max(0, frame - 6), fps, config: STYLE.motion.spring });

    const renderCodePanel = (
        label: string,
        code: string,
        html: string | undefined,
        springVal: number,
        color: string,
    ) => (
        <div
            style={{
                background: STYLE.colors.surface,
                borderRadius: STYLE.layout.borderRadius,
                overflow: 'hidden',
                border: `1px solid ${STYLE.colors.border}`,
                boxShadow: '0 4px 20px rgba(0,0,0,0.2)',
                transform: `scale(${interpolate(springVal, [0, 1], [0.92, 1])})`,
                opacity: interpolate(springVal, [0, 1], [0, 1]),
            }}
        >
            {/* Label bar */}
            <div
                style={{
                    padding: '10px 18px',
                    borderBottom: `1px solid ${STYLE.colors.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                }}
            >
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                <span
                    style={{
                        fontFamily: STYLE.fonts.mono,
                        fontSize: 14,
                        fontWeight: 700,
                        color,
                        letterSpacing: 1.5,
                        textTransform: 'uppercase',
                    }}
                >
                    {label}
                </span>
                <span
                    style={{
                        fontFamily: STYLE.fonts.mono,
                        fontSize: 12,
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
                    padding: '16px 18px',
                    fontFamily: STYLE.fonts.mono,
                    fontSize: 17,
                    lineHeight: 1.6,
                    color: STYLE.colors.text,
                    whiteSpace: 'pre-wrap',
                    overflowWrap: 'break-word',
                }}
            >
                {html ? (
                    <div dangerouslySetInnerHTML={{ __html: html }} />
                ) : (
                    <code>{code}</code>
                )}
            </div>
        </div>
    );

    return (
        <div
            style={{
                position: 'absolute',
                top: 120,
                left: STYLE.layout.padding - 8,
                right: STYLE.layout.padding - 8,
                opacity: containerOpacity,
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
            }}
        >
            {renderCodePanel(data.left.label, data.left.code, leftHtml, topSpring, STYLE.colors.warning)}
            {renderCodePanel(data.right.label, data.right.code, rightHtml, bottomSpring, STYLE.colors.accentAlt)}
        </div>
    );
};
