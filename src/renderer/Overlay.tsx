/**
 * Remotion Overlay Composition
 * Takes storyboard data and renders each scene in sequence.
 *
 * This component reads a storyboard from an input prop and maps each beat
 * to its corresponding scene component using Remotion's <Sequence>.
 */

import React from 'react';
import { AbsoluteFill, Sequence, staticFile, useVideoConfig } from 'remotion';
import type { Storyboard, Scene } from '../schema';
import { TitleScene } from './TitleScene';
import { BulletScene } from './BulletScene';
import { CodeBlockScene } from './CodeBlockScene';
import { CodeEvolveScene } from './CodeEvolveScene';
import { CalloutScene } from './CalloutScene';
import { DiagramScene } from './DiagramScene';
import { MetaphorStackScene } from './MetaphorStackScene';

export interface OverlayProps {
    storyboard: Storyboard;
    /** Pre-computed Shiki HTML per scene index (key = scene index) */
    highlightedCode?: Record<number, { html?: string; fromHtml?: string; toHtml?: string }>;
}

function renderScene(
    scene: Scene,
    index: number,
    durationInFrames: number,
    highlightedCode?: OverlayProps['highlightedCode'],
) {
    const highlights = highlightedCode?.[index];

    switch (scene.type) {
        case 'title':
            return <TitleScene data={scene.data} />;
        case 'bullet':
            return <BulletScene data={scene.data} />;
        case 'code-block':
            return <CodeBlockScene data={scene.data} highlightedHtml={highlights?.html} />;
        case 'code-evolve':
            return (
                <CodeEvolveScene
                    data={scene.data}
                    fromHtml={highlights?.fromHtml}
                    toHtml={highlights?.toHtml}
                    durationInFrames={durationInFrames}
                />
            );
        case 'callout':
            return <CalloutScene data={scene.data} />;
        case 'diagram':
            return <DiagramScene data={scene.data} />;
        case 'metaphor-stack':
            return <MetaphorStackScene data={scene.data} />;
        default:
            return null;
    }
}

export const OverlayComposition: React.FC<OverlayProps> = ({
    storyboard,
    highlightedCode,
}) => {
    const { fps } = useVideoConfig();

    return (
        <AbsoluteFill style={{ backgroundColor: 'transparent' }}>
            {storyboard.map((scene, index) => {
                const startFrame = Math.round(scene.start * fps);
                const endFrame = Math.round(scene.end * fps);
                const durationInFrames = endFrame - startFrame;

                if (durationInFrames <= 0) return null;

                return (
                    <Sequence
                        key={index}
                        from={startFrame}
                        durationInFrames={durationInFrames}
                        name={`${scene.type}-${index}`}
                    >
                        {renderScene(scene, index, durationInFrames, highlightedCode)}
                    </Sequence>
                );
            })}
        </AbsoluteFill>
    );
};
