/**
 * Shared scene transition hook.
 * Gives every scene a consistent entry (slide up + spring) and
 * exit (slide down + fade out) so transitions feel smooth.
 */

import { interpolate, spring, useCurrentFrame, useVideoConfig } from 'remotion';
import { STYLE } from '../config';

const EXIT_FRAMES = 8; // frames before end to start exit
const ENTRY_FRAMES = 10; // frames for entry animation

export interface SceneTransition {
    opacity: number;
    translateY: number;
    scale: number;
    /** Combined style for wrapping a scene */
    style: React.CSSProperties;
}

export function useSceneTransition(durationInFrames: number): SceneTransition {
    const frame = useCurrentFrame();
    const { fps } = useVideoConfig();

    // Entry: slide up + scale + fade in
    const entrySpring = spring({
        frame,
        fps,
        config: { damping: 16, mass: 0.7, stiffness: 180 },
    });

    const entryOpacity = interpolate(frame, [0, ENTRY_FRAMES], [0, 1], {
        extrapolateRight: 'clamp',
    });

    const entryTranslateY = (1 - entrySpring) * 50;
    const entryScale = interpolate(entrySpring, [0, 1], [0.92, 1]);

    // Exit: slide down + fade out
    const exitStart = Math.max(0, durationInFrames - EXIT_FRAMES);
    const exitOpacity = interpolate(
        frame,
        [exitStart, durationInFrames],
        [1, 0],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );

    const exitTranslateY = interpolate(
        frame,
        [exitStart, durationInFrames],
        [0, -30],
        { extrapolateLeft: 'clamp', extrapolateRight: 'clamp' },
    );

    // Combine entry + exit
    const opacity = Math.min(entryOpacity, exitOpacity);
    const translateY = entryTranslateY + exitTranslateY;
    const scale = entryScale;

    return {
        opacity,
        translateY,
        scale,
        style: {
            opacity,
            transform: `translateY(${translateY}px) scale(${scale})`,
            willChange: 'transform, opacity',
        },
    };
}
