import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateStoryText } from '$lib/server/ai/story';
import { StoryService } from '$lib/server/services/Story.service';

/**
 * POST /api/generate/text
 * Generate story text using AI
 *
 * Body:
 * - storyId: string (MongoDB _id)
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { storyId } = body;

		if (!storyId) {
			return json({ error: 'storyId is required' }, { status: 400 });
		}

		// Get story
		const story = await StoryService.getStoryById(storyId);

		if (!story) {
			return json({ error: 'Story not found' }, { status: 404 });
		}

		// Build config from story
		const config = {
			titleEn: story.title.en,
			titleTh: story.title.th,
			level: story.level,
			category: story.category,
			episodeCount: story.episodes?.length || 5,
			artStyle: story.artStyle || 'watercolor'
		};

		// Generate story text (this updates the story in DB)
		const result = await generateStoryText(storyId, config as any);

		return json({
			success: true,
			storyId,
			episodes: result.episodes.length,
			totalWords: result.totalWords
		});
	} catch (error) {
		console.error('Text generation failed:', error);
		return json(
			{
				error: 'Text generation failed',
				details: String(error)
			},
			{ status: 500 }
		);
	}
};
