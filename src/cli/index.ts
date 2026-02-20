#!/usr/bin/env node

/**
 * DevTok Overlay Pipeline CLI
 *
 * Usage:
 *   pnpm overlay --script ./examples/script1.txt --out ./out/overlay.webm
 *   pnpm overlay --script ./examples/script1.txt --dry-run
 *   pnpm overlay --script ./examples/script1.txt --out ./out/overlay.mov --codec prores4444
 */

import { Command } from 'commander';
import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import path from 'path';
import { generateStoryboard, type LLMConfig } from '../llm';
import { renderOverlay } from '../render';
import { DEFAULTS } from '../config';

const program = new Command();

program
    .name('devtok-overlay')
    .description('Generate animated TikTok overlays from scripts')
    .version('1.0.0')
    .requiredOption('--script <path>', 'Path to the script .txt file')
    .option('--out <path>', 'Output video file path', './out/overlay.webm')
    .option('--provider <name>', 'LLM provider: chatgpt | gemini', DEFAULTS.provider)
    .option('--command <cmd>', 'Override CLI command for the LLM provider')
    .option('--dry-run', 'Only generate storyboard.json, skip rendering', false)
    .option('--fps <number>', 'Frames per second', String(DEFAULTS.fps))
    .option('--width <number>', 'Video width in pixels', String(DEFAULTS.width))
    .option('--height <number>', 'Video height in pixels', String(DEFAULTS.height))
    .option('--codec <name>', 'Output codec: webm | prores4444', DEFAULTS.codec)
    .option('--storyboard <path>', 'Use an existing storyboard.json instead of calling LLM')
    .parse(process.argv);

const opts = program.opts();

async function main() {
    console.log('\n🎬 DevTok Overlay Pipeline\n');

    // 1. Read input script
    const scriptPath = path.resolve(opts.script);
    if (!existsSync(scriptPath)) {
        console.error(`❌ Script file not found: ${scriptPath}`);
        process.exit(1);
    }
    const script = readFileSync(scriptPath, 'utf-8').trim();
    console.log(`📄 Script: ${scriptPath} (${script.split(/\s+/).length} words)`);

    // 2. Generate or load storyboard
    let storyboard;
    const outDir = path.dirname(path.resolve(opts.out));

    if (opts.storyboard) {
        // Use existing storyboard
        const sbPath = path.resolve(opts.storyboard);
        console.log(`📋 Loading existing storyboard: ${sbPath}`);
        const raw = readFileSync(sbPath, 'utf-8');
        storyboard = JSON.parse(raw);
    } else {
        // Call LLM
        const llmConfig: LLMConfig = {
            provider: opts.provider as 'chatgpt' | 'gemini',
            command: opts.command,
        };
        storyboard = await generateStoryboard(script, llmConfig);
    }

    // 3. Save storyboard
    if (!existsSync(outDir)) {
        mkdirSync(outDir, { recursive: true });
    }
    const storyboardPath = path.join(outDir, 'storyboard.json');
    writeFileSync(storyboardPath, JSON.stringify(storyboard, null, 2));
    console.log(`📋 Storyboard: ${storyboardPath} (${storyboard.length} beats)`);

    // 4. Summary
    const totalDuration = Math.max(...storyboard.map((s: any) => s.end));
    console.log(`⏱  Duration: ${totalDuration.toFixed(1)}s`);
    console.log(`🎞  Scenes: ${storyboard.length}`);
    console.log(
        `   Types: ${[...new Set(storyboard.map((s: any) => s.type))].join(', ')}`,
    );

    // 5. Dry-run exit
    if (opts.dryRun) {
        console.log('\n✅ Dry run complete. Storyboard saved.\n');
        return;
    }

    // 6. Render
    const fps = parseInt(opts.fps, 10);
    const width = parseInt(opts.width, 10);
    const height = parseInt(opts.height, 10);

    console.log(`\n🎨 Rendering ${opts.codec} at ${width}x${height} @ ${fps}fps...`);

    await renderOverlay({
        storyboard,
        outPath: path.resolve(opts.out),
        width,
        height,
        fps,
        codec: opts.codec as 'webm' | 'prores4444',
    });

    // 7. Final summary
    console.log('\n✅ Pipeline complete!');
    console.log(`   Video: ${path.resolve(opts.out)}`);
    console.log(`   Storyboard: ${storyboardPath}`);
    console.log(`   Preview frames: ${outDir}/preview-*.png\n`);
}

main().catch((err) => {
    console.error('\n❌ Pipeline failed:', err.message || err);
    process.exit(1);
});
