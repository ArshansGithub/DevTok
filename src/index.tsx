/**
 * Remotion entry point — registers compositions for the Remotion Studio/CLI.
 */

import { registerRoot } from 'remotion';
import { Composition } from 'remotion';
import React from 'react';
import { OverlayComposition, type OverlayProps } from './renderer/Overlay';
import { DEFAULTS } from './config';

// Code-only sample storyboard for Remotion Studio preview
const sampleStoryboard: OverlayProps['storyboard'] = [
    {
        start: 0,
        end: 4,
        type: 'code-block',
        data: {
            language: 'ts',
            code: `app.get('/users', async (req, res) => {\n  const users = await db.query('SELECT * FROM users')\n  res.json(users)\n})`,
            fileName: 'server.ts',
        },
    },
    {
        start: 4,
        end: 9,
        type: 'code-evolve',
        data: {
            language: 'ts',
            from: `app.get('/users', async (req, res) => {\n  const users = await db.query('SELECT * FROM users')\n  res.json(users)\n})`,
            to: `app.get('/users', async (req, res) => {\n  try {\n    const users = await db.query('SELECT * FROM users')\n    const filtered = users.filter(u => u.active)\n    res.json(filtered)\n  } catch (e) {\n    res.status(500).json({ error: 'fail' })\n  }\n})`,
            caption: '3 months of quick fixes...',
        },
    },
    {
        start: 9,
        end: 13,
        type: 'code-diff',
        data: {
            language: 'ts',
            lines: [
                ' app.get(\'/users\', async (req, res) => {',
                '-  const users = await db.query(\'SELECT * FROM users\')',
                '-  const filtered = users.filter(u => u.active)',
                '-  res.json(filtered)',
                '+  const users = await userService.getActive()',
                '+  res.json(users)',
            ],
            fileName: 'server.ts',
            caption: 'Extract to a service layer',
        },
    },
    {
        start: 13,
        end: 17,
        type: 'terminal',
        data: {
            command: 'npm run build',
            output: 'ERROR: Property "status" does not exist\n  on type "User"\n\n  Found 12 errors.',
            caption: 'The build finally breaks',
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
