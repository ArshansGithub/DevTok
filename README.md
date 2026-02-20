# DevTok

Generate animated TikTok overlays from plain-text scripts. Uses an LLM (via CLI) to produce a structured storyboard, then renders it with [Remotion](https://remotion.dev) into a transparent video you can layer on top of talking-head footage.

## Quick Start

```bash
pnpm install
pnpm overlay -- --script ./examples/script1.txt --dry-run
pnpm overlay -- --script ./examples/script1.txt --out ./out/overlay.webm
```

## Prerequisites

- **Node.js** ≥ 18
- **pnpm** (already configured)
- **Gemini CLI** or **ChatGPT CLI** authenticated via OAuth

### Authenticating the Gemini CLI

```bash
# Install
npm install -g @anthropic-ai/gemini-cli  # or however you installed it
# Authenticate — this opens a browser OAuth flow
gemini auth login
# Verify
echo "hello" | gemini
```

### Authenticating the ChatGPT CLI

```bash
# Install: https://github.com/nicolo-ribaudo/chatgpt-cli or similar
# Authenticate
chatgpt auth
# Verify
echo "hello" | chatgpt
```

## Commands

### Full Pipeline

```bash
pnpm overlay -- --script ./examples/script1.txt --out ./out/overlay.webm
```

### Dry Run (storyboard only, no render)

```bash
pnpm overlay -- --script ./examples/script1.txt --dry-run
```

### Use Existing Storyboard (skip LLM)

```bash
pnpm overlay -- --script ./examples/script1.txt --storyboard ./out/storyboard.json --out ./out/overlay.webm
```

### ProRes 4444 Output

```bash
pnpm overlay -- --script ./examples/script1.txt --out ./out/overlay.mov --codec prores4444
```

### Remotion Studio (preview)

```bash
pnpm start
```

## CLI Flags

| Flag | Default | Description |
|------|---------|-------------|
| `--script <path>` | **required** | Path to `.txt` script file |
| `--out <path>` | `./out/overlay.webm` | Output video path |
| `--provider` | `gemini` | LLM provider (`chatgpt` \| `gemini`) |
| `--command` | auto | Override CLI command path |
| `--dry-run` | `false` | Only generate storyboard, skip render |
| `--fps` | `30` | Frames per second |
| `--width` | `1080` | Video width |
| `--height` | `1920` | Video height |
| `--codec` | `webm` | Output codec (`webm` \| `prores4444`) |
| `--storyboard` | — | Use existing storyboard JSON |

## Output

```
out/
├── overlay.webm        # Transparent overlay video
├── storyboard.json     # Structured storyboard
├── preview-0.png       # First frame
├── preview-XXX.png     # Middle frame
└── preview-YYY.png     # Last frame
```

## Customizing Style

Edit `src/config.ts` to change:
- **Fonts** — heading and monospace families
- **Colors** — text, accent, surface, border colors
- **Layout** — padding, gap, border radius
- **Motion** — spring damping/mass/stiffness

## Adding New Scene Types

1. Add a Zod schema in `src/schema.ts`
2. Add the new type to the `SceneSchema` discriminated union
3. Create a React component in `src/renderer/YourScene.tsx`
4. Register it in `src/renderer/Overlay.tsx` → `renderScene()`
5. Update the prompt in `src/prompts.ts` to include the new type

## Project Structure

```
src/
├── cli/index.ts          # CLI entry point (commander)
├── config.ts             # Global style tokens & defaults
├── highlighter.ts        # Shiki syntax highlighting
├── llm.ts                # LLM CLI orchestrator
├── prompts.ts            # LLM prompt templates
├── render.ts             # Remotion render helper
├── schema.ts             # Zod schemas & types
├── index.tsx             # Remotion entry (compositions)
└── renderer/
    ├── Overlay.tsx        # Root composition
    ├── TitleScene.tsx
    ├── BulletScene.tsx
    ├── CodeBlockScene.tsx
    ├── CodeEvolveScene.tsx
    ├── CalloutScene.tsx
    ├── DiagramScene.tsx
    └── MetaphorStackScene.tsx
examples/
├── script1.txt           # ESM vs CJS
├── script2.txt           # Debugging story
└── script3.txt           # Microservices vs Monolith
```

## How It Works

```
script.txt → [LLM CLI] → storyboard.json → [Remotion] → overlay.webm
                 ↑                              ↑
            Pass 1: Generate              Shiki highlighting
            Pass 2: Fix errors            Spring animations
```

The LLM decides **what** to show. Remotion decides **how** it looks. This separation keeps the output deterministic and visually consistent.
