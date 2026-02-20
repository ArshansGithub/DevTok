import { z } from 'zod';

const BaseSceneSchema = z.object({
	start: z.number(),
	end: z.number(),
});

export const TitleSceneSchema = BaseSceneSchema.extend({
	type: z.literal('title'),
	data: z.object({
		text: z.string(),
		subtitle: z.string().optional(),
	}),
});

export const BulletSceneSchema = BaseSceneSchema.extend({
	type: z.literal('bullet'),
	data: z.object({
		title: z.string().optional(),
		bullets: z.array(z.string()),
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
					at: z.number(), // Percentage through the scene (0 to 1)
				}),
			)
			.optional(),
		caption: z.string().optional(),
	}),
});

export const CalloutSceneSchema = BaseSceneSchema.extend({
	type: z.literal('callout'),
	data: z.object({
		text: z.string(),
		emphasizedTokens: z.array(z.string()).optional(),
	}),
});

export const DiagramSceneSchema = BaseSceneSchema.extend({
	type: z.literal('diagram'),
	data: z.object({
		nodes: z.array(z.string()),
		edges: z.array(
			z.object({
				from: z.string(),
				to: z.string(),
				label: z.string().optional(),
			}),
		),
	}),
});

export const MetaphorStackSceneSchema = BaseSceneSchema.extend({
	type: z.literal('metaphor-stack'),
	data: z.object({
		title: z.string().optional(),
		layers: z.array(z.string()), // Representing patches, tech debt layers, etc.
	}),
});

// A single segment/beat in the storyboard
export const SceneSchema = z.discriminatedUnion('type', [
	TitleSceneSchema,
	BulletSceneSchema,
	CodeBlockSceneSchema,
	CodeEvolveSceneSchema,
	CalloutSceneSchema,
	DiagramSceneSchema,
	MetaphorStackSceneSchema,
]);

// The entire storyboard output
export const StoryboardSchema = z.array(SceneSchema);

// Types
export type TitleScene = z.infer<typeof TitleSceneSchema>;
export type BulletScene = z.infer<typeof BulletSceneSchema>;
export type CodeBlockScene = z.infer<typeof CodeBlockSceneSchema>;
export type CodeEvolveScene = z.infer<typeof CodeEvolveSceneSchema>;
export type CalloutScene = z.infer<typeof CalloutSceneSchema>;
export type DiagramScene = z.infer<typeof DiagramSceneSchema>;
export type MetaphorStackScene = z.infer<typeof MetaphorStackSceneSchema>;
export type Scene = z.infer<typeof SceneSchema>;
export type Storyboard = z.infer<typeof StoryboardSchema>;
