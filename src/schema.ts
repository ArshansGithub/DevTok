import { z } from 'zod';

const BaseSceneSchema = z.object({
	start: z.number(),
	end: z.number(),
});

// ─── Kept Scenes ────────────────────────────────────────────

export const TitleSceneSchema = BaseSceneSchema.extend({
	type: z.literal('title'),
	data: z.object({
		text: z.string(),
		subtitle: z.string().optional(),
	}),
});

export const CalloutSceneSchema = BaseSceneSchema.extend({
	type: z.literal('callout'),
	data: z.object({
		text: z.string(),
		emphasizedTokens: z.array(z.string()).optional(),
	}),
});

export const CodeBlockSceneSchema = BaseSceneSchema.extend({
	type: z.literal('code-block'),
	data: z.object({
		language: z.string(),
		code: z.string(),
		fileName: z.string().optional(),
	}),
});

export const CodeEvolveSceneSchema = BaseSceneSchema.extend({
	type: z.literal('code-evolve'),
	data: z.object({
		language: z.string(),
		from: z.string(),
		to: z.string(),
		highlights: z
			.array(
				z.object({
					token: z.string(),
					at: z.number(), // 0–1 fraction of beat duration
				}),
			)
			.optional(),
		caption: z.string().optional(),
	}),
});

// ─── New Code-Centric Scenes ────────────────────────────────

export const CodeDiffSceneSchema = BaseSceneSchema.extend({
	type: z.literal('code-diff'),
	data: z.object({
		language: z.string(),
		/** Each line prefixed with "+" (added), "-" (removed), or " " (context) */
		lines: z.array(z.string()),
		fileName: z.string().optional(),
		caption: z.string().optional(),
	}),
});

export const CodeCompareSceneSchema = BaseSceneSchema.extend({
	type: z.literal('code-compare'),
	data: z.object({
		language: z.string(),
		left: z.object({
			label: z.string(),
			code: z.string(),
		}),
		right: z.object({
			label: z.string(),
			code: z.string(),
		}),
	}),
});

export const CodeHighlightSceneSchema = BaseSceneSchema.extend({
	type: z.literal('code-highlight'),
	data: z.object({
		language: z.string(),
		code: z.string(),
		/** 1-indexed line numbers to highlight */
		highlightLines: z.array(z.number()),
		fileName: z.string().optional(),
		caption: z.string().optional(),
	}),
});

export const TerminalSceneSchema = BaseSceneSchema.extend({
	type: z.literal('terminal'),
	data: z.object({
		command: z.string(),
		output: z.string(),
		caption: z.string().optional(),
	}),
});

export const CodeScrollSceneSchema = BaseSceneSchema.extend({
	type: z.literal('code-scroll'),
	data: z.object({
		language: z.string(),
		code: z.string(),
		fileName: z.string().optional(),
	}),
});

// ─── Union & Exports ────────────────────────────────────────

export const SceneSchema = z.discriminatedUnion('type', [
	TitleSceneSchema,
	CalloutSceneSchema,
	CodeBlockSceneSchema,
	CodeEvolveSceneSchema,
	CodeDiffSceneSchema,
	CodeCompareSceneSchema,
	CodeHighlightSceneSchema,
	TerminalSceneSchema,
	CodeScrollSceneSchema,
]);

export const StoryboardSchema = z.array(SceneSchema);

// Types
export type TitleScene = z.infer<typeof TitleSceneSchema>;
export type CalloutScene = z.infer<typeof CalloutSceneSchema>;
export type CodeBlockScene = z.infer<typeof CodeBlockSceneSchema>;
export type CodeEvolveScene = z.infer<typeof CodeEvolveSceneSchema>;
export type CodeDiffScene = z.infer<typeof CodeDiffSceneSchema>;
export type CodeCompareScene = z.infer<typeof CodeCompareSceneSchema>;
export type CodeHighlightScene = z.infer<typeof CodeHighlightSceneSchema>;
export type TerminalScene = z.infer<typeof TerminalSceneSchema>;
export type CodeScrollScene = z.infer<typeof CodeScrollSceneSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Storyboard = z.infer<typeof StoryboardSchema>;
