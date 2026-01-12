/**
 * Story Generation using Vercel AI SDK
 * Now uses MongoDB (Mongoose) instead of SQLite
 */

import { generateText, streamText } from 'ai';
import { getModel } from './providers';
import getStoryModel, { IStory } from '$lib/server/models/Story.model';
import dbConnect from '$lib/server/db/mongodb';

// Story generation types
export interface StoryConfig {
	titleEn: string;
	titleTh?: string;
	level: 'A1' | 'A2' | 'B1' | 'B2';
	category: string;
	episodeCount: number;
	artStyle?: string;
}

export interface GeneratedPage {
	pageNumber: number;
	textEn: string;
	textTh?: string;
	vocab: WordEntry[];
	translations?: {
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
      "titleTh": "Thai Title",
      "pages": [
        {
          "pageNumber": 1,
          "textEn": "Page text here...",
          "textTh": "Thai translation...",
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

/**
 * Convert generated pages to MongoDB page format
 */
function convertPageToMongoDB(page: GeneratedPage) {
	return {
		pageNumber: page.pageNumber,
		text: page.textEn,
		translations: {
			th: page.textTh || page.translations?.th || '',
			ja: page.translations?.ja || '',
			zh: page.translations?.zh || '',
			vi: page.translations?.vi || '',
			id: page.translations?.id || ''
		},
		vocabulary: page.vocab.map(v => ({
			word: v.word,
			highlight: true
		})),
		audioUrl: '',
		imageUrl: '',
		wordTimestamps: []
	};
}

/**
 * Convert generated episode to MongoDB episode format
 */
function convertEpisodeToMongoDB(episode: GeneratedEpisode) {
	return {
		episodeNumber: episode.episodeNumber,
		title: {
			en: episode.titleEn,
			th: episode.titleTh || ''
		},
		pages: episode.pages.map(convertPageToMongoDB),
		vocabularyDetails: [],
		miniGame: {
			type: 'multipleChoice' as const,
			questions: []
		}
	};
}

/**
 * Generate story text using AI
 */
export async function generateStoryText(
	storyId: string,
	config: StoryConfig
): Promise<GeneratedStory> {
	await dbConnect();

	try {
		// Update story status to generating
		await getStoryModel().findByIdAndUpdate(storyId, {
			'status': 'generating'
		});

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

		// Convert episodes to MongoDB format
		const mongoDBepisodes = generated.episodes.map(convertEpisodeToMongoDB);

		// Update story with generated episodes
		await getStoryModel().findByIdAndUpdate(storyId, {
			episodes: mongoDBepisodes,
			totalWords: generated.totalWords,
			'status': 'reviewing'
		});

		return generated;
	} catch (error) {
		// Reset story status on error
		await getStoryModel().findByIdAndUpdate(storyId, {
			'status': 'draft'
		}).catch(() => {});
		throw error;
	}
}

/**
 * Regenerate specific episode
 */
export async function regenerateEpisode(
	storyId: string,
	episodeNumber: number,
	reason?: string
): Promise<GeneratedEpisode> {
	await dbConnect();

	const story = await getStoryModel().findById(storyId).lean();
	if (!story) {
		throw new Error('Story not found');
	}

	const prompt = `Regenerate episode ${episodeNumber} of the story "${story.title.en}".

${reason ? `REASON FOR REGENERATION: ${reason}\n` : ''}Keep the same story context, but create fresh content.

REQUIREMENTS:
- CEFR Level: ${story.level}
- 3 pages
- Same style as before

Return ONLY valid JSON for this episode:
{
  "episodeNumber": ${episodeNumber},
  "titleEn": "Episode Title",
  "titleTh": "Thai Title",
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

	// Convert to MongoDB format
	const mongoDBEpisode = convertEpisodeToMongoDB(regenerated);

	// Update the specific episode in the story
	const episodes = story.episodes || [];
	const index = episodes.findIndex(ep => ep.episodeNumber === episodeNumber);

	if (index >= 0) {
		episodes[index] = mongoDBEpisode;
	} else {
		episodes.push(mongoDBEpisode);
	}

	await getStoryModel().findByIdAndUpdate(storyId, {
		episodes
	});

	return regenerated;
}

/**
 * Stream generation progress
 */
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
