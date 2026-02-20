/**
 * Remotion entry point — registers compositions for the Remotion Studio/CLI.
 */

import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import React from 'react';
import { OverlayComposition, type OverlayProps } from './renderer/Overlay';
import { DEFAULTS } from './config';

// Code-heavy sample storyboard for Remotion Studio preview
const sampleStoryboard: OverlayProps['storyboard'] = [
    {
        start: 0,
        end: 2,
        type: 'title',
        data: {
            text: 'Why Vibe Coding Breaks',
            subtitle: 'The accretion debt problem',
        },
    },
    {
        start: 2,
        end: 5.5,
        type: 'code-block',
        data: {
            language: 'ts',
            code: `type User = {\n  id: string\n  name: string\n}`,
            fileName: 'types.ts',
        },
    },
    {
        start: 5.5,
        end: 10,
        type: 'code-evolve',
        data: {
            language: 'ts',
            from: `type User = {\n  id: string\n  name: string\n}`,
            to: `type User = {\n  id: string\n  name: string\n  status: 'active' | 'disabled'\n  role?: string\n  lastLogin?: Date\n}`,
            caption: 'Types keep growing...',
        },
    },
    {
        start: 10,
        end: 14,
        type: 'code-diff',
        data: {
            language: 'ts',
            lines: [
                ' function getUser(id: string) {',
                '-  return db.query(id)',
                '+  const user = db.query(id)',
                '+  if (!user) throw new NotFound()',
                '+  return sanitize(user)',
                ' }',
            ],
            fileName: 'users.ts',
            caption: 'Every fix adds more wrapping',
        },
    },
    {
        start: 14,
        end: 17.5,
        type: 'terminal',
        data: {
            command: 'npm run build',
            output: 'ERROR: Property "status" does not exist\n  on type "User"\n\n  Found 12 errors.',
            caption: 'The build finally breaks',
        },
    },
    {
        start: 17.5,
        end: 20,
        type: 'callout',
        data: {
            text: 'Refactor early. Integrate, don\'t accumulate.',
            emphasizedTokens: ['Refactor early', 'Integrate'],
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
