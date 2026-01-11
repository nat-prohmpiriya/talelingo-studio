/**
 * Story Generation using Vercel AI SDK
 */

import { generateText, streamText } from 'ai';
import { getModel, MODELS } from './providers';
import { db } from '$lib/server/db';
import { stories, episodes, jobs } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// Story generation types
export interface StoryConfig {
	titleEn: string;
	level: 'A1' | 'A2' | 'B1' | 'B2';
	category: string;
	episodeCount: number;
	artStyle?: string;
}

export interface GeneratedPage {
	pageNumber: number;
	textEn: string;
	vocab: WordEntry[];
	translation?: {
		th?: string;
		ja?: string;
		zh?: string;
		vi?: string;
		id?: string;
	};
}

export interface WordEntry {
	word: string;
	definition: string;
	cefrLevel: string;
}

export interface GeneratedEpisode {
	episodeNumber: number;
	titleEn: string;
	titleTh?: string;
	pages: GeneratedPage[];
	summary: string;
}

export interface GeneratedStory {
	episodes: GeneratedEpisode[];
	totalWords: number;
	vocabularyList: WordEntry[];
}

// CEFR vocabulary limits
const CEFR_LIMITS = {
	A1: 500,
	A2: 1000,
	B1: 2000,
	B2: 3000
} as const;

// Prompt template for story generation
function getStoryPrompt(config: StoryConfig): string {
	const vocabLimit = CEFR_LIMITS[config.level];
	const wordsPerEpisode = config.level === 'A1' ? 150 : config.level === 'A2' ? 250 : 400;

	return `You are a children's story writer for language learners. Write a ${config.category} story called "${config.titleEn}".

REQUIREMENTS:
- CEFR Level: ${config.level} (Oxford 3000 vocabulary, max ${vocabLimit} word families)
- Episodes: ${config.episodeCount}
- Pages per episode: 3
- Words per page: ~${Math.round(wordsPerEpisode / 3)}
- Target audience: Children learning English

FORMAT - Return ONLY valid JSON:
{
  "episodes": [
    {
      "episodeNumber": 1,
      "titleEn": "Episode Title",
      "pages": [
        {
          "pageNumber": 1,
          "textEn": "Page text here...",
          "vocab": [
            {"word": "example", "definition": "a representative form", "cefrLevel": "A2"}
          ]
        }
      ],
      "summary": "Brief episode summary"
    }
  ],
  "totalWords": 1234,
  "vocabularyList": [
    {"word": "lion", "definition": "large wild cat", "cefrLevel": "A1"}
  ]
}

STYLE GUIDE:
- Use simple sentences
- Include dialogue
- Add sensory details
- Each page should end with a small cliffhanger
- Teach 3-5 new vocabulary words per page

STORY PLOT: ${config.category} about "${config.titleEn}"`;
}

// Generate story text
export async function generateStoryText(
	storyId: string,
	config: StoryConfig
): Promise<GeneratedStory> {
	// Update story status to generating
	await db
		.update(stories)
		.set({ status: 'generating', currentStep: 'text' })
		.where(eq(stories.id, storyId));

	// Create job record
	const job = await db
		.insert(jobs)
		.values({
			storyId,
			type: 'text',
			status: 'running',
			progress: 0
		})
		.returning();

	const jobId = job[0].id;

	try {
		// Generate with AI
		const prompt = getStoryPrompt(config);
		const model = getModel();

		const result = await generateText({
			model,
			prompt,
			temperature: 0.8,
			maxTokens: 4000
		});

		// Parse JSON response
		const jsonMatch = result.text.match(/```json\n?([\s\S]*?)\n?```/) ||
			result.text.match(/\{[\s\S]*\}/);

		if (!jsonMatch) {
			throw new Error('No JSON found in response');
		}

		const generated: GeneratedStory = JSON.parse(jsonMatch[1] || jsonMatch[0]);

		// Save episodes to database
		for (const episode of generated.episodes) {
			await db.insert(episodes).values({
				storyId,
				episodeNumber: episode.episodeNumber,
				titleEn: episode.titleEn,
				status: 'generated',
				content: JSON.stringify(episode)
			});
		}

		// Update story with generated content
		await db
			.update(stories)
			.set({
				content: JSON.stringify(generated),
				status: 'reviewing',
				currentStep: 'text'
			})
			.where(eq(stories.id, storyId));

		// Mark job complete
		await db
			.update(jobs)
			.set({
				status: 'completed',
				progress: 100,
				result: JSON.stringify({ episodes: generated.episodes.length })
			})
			.where(eq(jobs.id, jobId));

		return generated;
	} catch (error) {
		// Mark job failed
		await db
			.update(jobs)
			.set({
				status: 'failed',
				error: String(error)
			})
			.where(eq(jobs.id, jobId));

		// Reset story status
		await db
			.update(stories)
			.set({ status: 'draft' })
			.where(eq(stories.id, storyId));

		throw error;
	}
}

// Regenerate specific episode
export async function regenerateEpisode(
	storyId: string,
	episodeNumber: number,
	reason?: string
): Promise<GeneratedEpisode> {
	const story = await db.query.stories.findFirst({
		where: eq(stories.id, storyId)
	});

	if (!story) {
		throw new Error('Story not found');
	}

	const config = JSON.parse(story.config || '{}');

	const prompt = `Regenerate episode ${episodeNumber} of the story "${config.titleEn}".

${reason ? `REASON FOR REGENERATION: ${reason}\n` : ''}Keep the same story context, but create fresh content.

REQUIREMENTS:
- CEFR Level: ${config.level}
- 3 pages
- Same style as before

Return ONLY valid JSON for this episode:
{
  "episodeNumber": ${episodeNumber},
  "titleEn": "Episode Title",
  "pages": [...],
  "summary": "Summary"
}`;

	const result = await generateText({
		model: getModel(),
		prompt,
		temperature: 0.9
	});

	const jsonMatch = result.text.match(/\{[\s\S]*\}/);
	if (!jsonMatch) {
		throw new Error('No JSON found in response');
	}

	const regenerated: GeneratedEpisode = JSON.parse(jsonMatch[0]);

	// Update episode
	const existing = await db.query.episodes.findFirst({
		where: (eq(episodes.storyId, storyId), eq(episodes.episodeNumber, episodeNumber))
	});

	if (existing) {
		await db
			.update(episodes)
			.set({
				titleEn: regenerated.titleEn,
				content: JSON.stringify(regenerated),
				status: 'generated'
			})
			.where(eq(episodes.id, existing.id));
	} else {
		await db.insert(episodes).values({
			storyId,
			episodeNumber,
			titleEn: regenerated.titleEn,
			status: 'generated',
			content: JSON.stringify(regenerated)
		});
	}

	return regenerated;
}

// Stream generation progress
export async function streamStoryGeneration(
	storyId: string,
	config: StoryConfig
): Promise<ReadableStream> {
	const prompt = getStoryPrompt(config);
	const model = getModel();

	const result = await streamText({
		model,
		prompt,
		temperature: 0.8
	});

	return result.toDataStream();
}
