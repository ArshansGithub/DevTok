/**
 * Remotion Overlay Composition
 * Maps storyboard beats to code-centric scene components.
 */

import React from 'react';
import { AbsoluteFill, Sequence, useVideoConfig } from 'remotion';
import type { Storyboard, Scene } from '../schema';
import { TitleScene } from './TitleScene';
import { CalloutScene } from './CalloutScene';
import { CodeBlockScene } from './CodeBlockScene';
import { CodeEvolveScene } from './CodeEvolveScene';
import { CodeDiffScene } from './CodeDiffScene';
import { CodeCompareScene } from './CodeCompareScene';
import { CodeHighlightScene } from './CodeHighlightScene';
import { TerminalScene } from './TerminalScene';
import { CodeScrollScene } from './CodeScrollScene';

export interface OverlayProps {
    storyboard: Storyboard;
    highlightedCode?: Record<number, {
        html?: string;
        fromHtml?: string;
        toHtml?: string;
        leftHtml?: string;
        rightHtml?: string;
    }>;
}

function renderScene(
    scene: Scene,
    index: number,
    durationInFrames: number,
    highlightedCode?: OverlayProps['highlightedCode'],
) {
    const h = highlightedCode?.[index];

    switch (scene.type) {
        case 'title':
            return <TitleScene data={scene.data} />;
        case 'callout':
            return <CalloutScene data={scene.data} />;
        case 'code-block':
            return <CodeBlockScene data={scene.data} highlightedHtml={h?.html} />;
        case 'code-evolve':
            return (
                <CodeEvolveScene
                    data={scene.data}
                    fromHtml={h?.fromHtml}
                    toHtml={h?.toHtml}
                    durationInFrames={durationInFrames}
                />
            );
        case 'code-diff':
            return <CodeDiffScene data={scene.data} />;
        case 'code-compare':
            return <CodeCompareScene data={scene.data} leftHtml={h?.leftHtml} rightHtml={h?.rightHtml} />;
        case 'code-highlight':
            return <CodeHighlightScene data={scene.data} highlightedHtml={h?.html} />;
        case 'terminal':
            return <TerminalScene data={scene.data} durationInFrames={durationInFrames} />;
        case 'code-scroll':
            return <CodeScrollScene data={scene.data} highlightedHtml={h?.html} durationInFrames={durationInFrames} />;
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
