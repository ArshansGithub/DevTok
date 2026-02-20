import React from 'react';
import {
    interpolate,
    spring,
    useCurrentFrame,
    useVideoConfig,
} from 'remotion';
import { STYLE } from '../config';
import type { DiagramScene as DiagramSceneType } from '../schema';

export const DiagramScene: React.FC<{ data: DiagramSceneType['data'] }> = ({
    data,
}) => {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    const containerOpacity = interpolate(frame, [0, 8], [0, 1], {
        extrapolateRight: 'clamp',
    });

    // Build simple positions for nodes in a vertical layout
    const nodeCount = data.nodes.length;
    const nodeWidth = 260;
    const nodeHeight = 56;
    const verticalGap = 100;
    const centerX = (1080 - STYLE.layout.padding * 2) / 2;
    const startY = 40;

    const nodePositions = data.nodes.map((_, i) => ({
        x: centerX - nodeWidth / 2,
        y: startY + i * (nodeHeight + verticalGap),
    }));

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
            <div
                style={{
                    background: STYLE.colors.surface,
                    borderRadius: STYLE.layout.borderRadius,
                    padding: 36,
                    border: `1px solid ${STYLE.colors.border}`,
                    position: 'relative',
                    minHeight: nodeCount * (nodeHeight + verticalGap) + 40,
                }}
            >
                {/* Edges (arrows) */}
                <svg
                    style={{
                        position: 'absolute',
                        top: 36,
                        left: 36,
                        right: 36,
                        bottom: 36,
                        width: '100%',
                        height: '100%',
                        pointerEvents: 'none',
                    }}
                >
                    {data.edges.map((edge, i) => {
                        const fromIdx = data.nodes.indexOf(edge.from);
                        const toIdx = data.nodes.indexOf(edge.to);
                        if (fromIdx === -1 || toIdx === -1) return null;

                        const delay = Math.max(fromIdx, toIdx) * 6;
                        const edgeOpacity = interpolate(
                            frame,
                            [delay + 4, delay + 14],
                            [0, 1],
                            { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                        );

                        const fromPos = nodePositions[fromIdx];
                        const toPos = nodePositions[toIdx];

                        const x1 = fromPos.x + nodeWidth / 2;
                        const y1 = fromPos.y + nodeHeight;
                        const x2 = toPos.x + nodeWidth / 2;
                        const y2 = toPos.y;

                        return (
                            <g key={i} opacity={edgeOpacity}>
                                <line
                                    x1={x1}
                                    y1={y1}
                                    x2={x2}
                                    y2={y2}
                                    stroke={STYLE.colors.accent}
                                    strokeWidth={2}
                                    strokeDasharray="6 4"
                                />
                                {/* Arrow head */}
                                <polygon
                                    points={`${x2},${y2} ${x2 - 6},${y2 - 10} ${x2 + 6},${y2 - 10}`}
                                    fill={STYLE.colors.accent}
                                />
                                {edge.label && (
                                    <text
                                        x={(x1 + x2) / 2 + 12}
                                        y={(y1 + y2) / 2}
                                        fill={STYLE.colors.textMuted}
                                        fontSize={14}
                                        fontFamily={STYLE.fonts.heading}
                                    >
                                        {edge.label}
                                    </text>
                                )}
                            </g>
                        );
                    })}
                </svg>

                {/* Nodes */}
                {data.nodes.map((node, i) => {
                    const delay = i * 6;
                    const nodeSpring = spring({
                        frame: Math.max(0, frame - delay),
                        fps,
                        config: STYLE.motion.spring,
                    });
                    const nodeOpacity = interpolate(
                        frame,
                        [delay, delay + 8],
                        [0, 1],
                        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
                    );

                    const pos = nodePositions[i];

                    return (
                        <div
                            key={i}
                            style={{
                                position: 'absolute',
                                top: 36 + pos.y,
                                left: 36 + pos.x,
                                width: nodeWidth,
                                height: nodeHeight,
                                background: STYLE.colors.surfaceLight,
                                border: `1px solid ${STYLE.colors.accent}44`,
                                borderRadius: 12,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontFamily: STYLE.fonts.heading,
                                fontSize: 18,
                                fontWeight: 600,
                                color: STYLE.colors.text,
                                opacity: nodeOpacity,
                                transform: `scale(${interpolate(nodeSpring, [0, 1], [0.8, 1])})`,
                            }}
                        >
                            {node}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
