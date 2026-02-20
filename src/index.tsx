/**
 * Remotion entry point — registers compositions for the Remotion Studio/CLI.
 */

import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import React from 'react';
import { OverlayComposition, type OverlayProps } from './renderer/Overlay';
import { DEFAULTS } from './config';

// Default sample storyboard for Remotion Studio preview
const sampleStoryboard: OverlayProps['storyboard'] = [
    {
        start: 0,
        end: 2.5,
        type: 'title',
        data: {
            text: 'ESM vs CommonJS',
            subtitle: 'Why your imports keep breaking',
        },
    },
    {
        start: 2.5,
        end: 6,
        type: 'code-evolve',
        data: {
            language: 'ts',
            from: "const express = require('express');",
            to: "import express from 'express';",
            caption: 'The migration everyone dreads',
        },
    },
    {
        start: 6,
        end: 9,
        type: 'bullet',
        data: {
            title: 'Key Differences',
            bullets: [
                'ESM is statically analyzed',
                'CJS is synchronous',
                'ESM supports tree-shaking',
            ],
        },
    },
    {
        start: 9,
        end: 12,
        type: 'callout',
        data: {
            text: 'Set "type": "module" in package.json',
            emphasizedTokens: ['"type": "module"'],
        },
    },
];

const Root: React.FC = () => {
    return (
        <>
            <Composition
                id="Overlay"
                component={OverlayComposition as unknown as React.FC<Record<string, unknown>>}
                durationInFrames={600}
                fps={DEFAULTS.fps}
                width={DEFAULTS.width}
                height={DEFAULTS.height}
                defaultProps={{
                    storyboard: sampleStoryboard,
                    highlightedCode: {},
                }}
                calculateMetadata={async ({ props }) => {
                    const p = props as unknown as OverlayProps;
                    const totalDuration = Math.max(...p.storyboard.map((s) => s.end));
                    return {
                        durationInFrames: Math.ceil(totalDuration * DEFAULTS.fps),
                    };
                }}
            />
        </>
    );
};

registerRoot(Root);
