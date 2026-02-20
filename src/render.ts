/**
 * Rendering helper — calls Remotion CLI to render the overlay video.
 * Also generates preview PNG frames.
 */

import { execSync } from 'child_process';
import { writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import type { Storyboard } from './schema';
import { highlightCode } from './highlighter';

export interface RenderOptions {
    storyboard: Storyboard;
    outPath: string;
    width: number;
    height: number;
    fps: number;
    codec: 'webm' | 'prores4444';
}

/**
 * Pre-compute Shiki highlighted HTML for all code-related scenes.
 */
export async function preHighlightCode(
    storyboard: Storyboard,
): Promise<Record<number, { html?: string; fromHtml?: string; toHtml?: string; leftHtml?: string; rightHtml?: string }>> {
    const result: Record<number, any> = {};

    for (let i = 0; i < storyboard.length; i++) {
        const scene = storyboard[i];

        if (scene.type === 'code-block') {
            const html = await highlightCode(scene.data.code, scene.data.language);
            result[i] = { html };
        } else if (scene.type === 'code-evolve') {
            const fromHtml = await highlightCode(scene.data.from, scene.data.language);
            const toHtml = await highlightCode(scene.data.to, scene.data.language);
            result[i] = { fromHtml, toHtml };
        } else if (scene.type === 'code-compare') {
            const leftHtml = await highlightCode(scene.data.left.code, scene.data.language);
            const rightHtml = await highlightCode(scene.data.right.code, scene.data.language);
            result[i] = { leftHtml, rightHtml };
        } else if (scene.type === 'code-highlight') {
            const html = await highlightCode(scene.data.code, scene.data.language);
            result[i] = { html };
        } else if (scene.type === 'code-scroll') {
            const html = await highlightCode(scene.data.code, scene.data.language);
            result[i] = { html };
        }
    }

    return result;
}

/**
 * Write storyboard and highlighted code to a temp file,
 * then call Remotion CLI to render.
 */
export async function renderOverlay(options: RenderOptions): Promise<void> {
    const { storyboard, outPath, width, height, fps, codec } = options;

    const outDir = path.dirname(outPath);
    if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
    }

    // Compute total duration
    const totalDuration = Math.max(...storyboard.map((s) => s.end));
    const durationInFrames = Math.ceil(totalDuration * fps);

    // Pre-highlight code
    console.log('[render] Pre-highlighting code blocks...');
    const highlightedCode = await preHighlightCode(storyboard);

    // Write input props to a temp file
    const propsPath = path.join(outDir, 'remotion-props.json');
    const props = { storyboard, highlightedCode };
    writeFileSync(propsPath, JSON.stringify(props, null, 2));

    // Determine codec and extension
    let remotionCodec: string;
    let outputFile: string;

    if (codec === 'prores4444') {
        remotionCodec = 'prores';
        outputFile = outPath.replace(/\.\w+$/, '.mov');
    } else {
        remotionCodec = 'vp8';
        outputFile = outPath.replace(/\.\w+$/, '.webm');
    }

    // Build Remotion render command
    const entryPoint = path.resolve('src/index.tsx');
    const cmd = [
        'npx remotion render',
        `"${entryPoint}"`,
        'Overlay',
        `"${outputFile}"`,
        `--codec ${remotionCodec}`,
        `--props "${propsPath}"`,
        `--width ${width}`,
        `--height ${height}`,
        '--image-format png',
    ];

    console.log(`[render] Rendering ${durationInFrames} frames at ${fps}fps...`);
    console.log(`[render] Output: ${outputFile}`);

    try {
        execSync(cmd.join(' '), {
            stdio: 'inherit',
            cwd: process.cwd(),
            timeout: 600_000, // 10 minute timeout
        });
    } catch (err: any) {
        throw new Error(`[render] Remotion render failed: ${err.message}`);
    }

    // Generate preview frames (start, middle, end)
    console.log('[render] Generating preview frames...');
    const previewFrames = [
        0,
        Math.floor(durationInFrames / 2),
        durationInFrames - 1,
    ];

    for (const frameNum of previewFrames) {
        const previewPath = path.join(outDir, `preview-${frameNum}.png`);
        const previewCmd = [
            'npx remotion still',
            `"${entryPoint}"`,
            'Overlay',
            `"${previewPath}"`,
            `--props "${propsPath}"`,
            `--width ${width}`,
            `--height ${height}`,
            `--frame ${frameNum}`,
            '--image-format png',
        ];

        try {
            execSync(previewCmd.join(' '), {
                stdio: 'pipe',
                cwd: process.cwd(),
                timeout: 120_000,
            });
        } catch {
            console.warn(`[render] Warning: Could not generate preview frame ${frameNum}`);
        }
    }

    console.log('[render] Done!');
}
