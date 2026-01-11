import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { generateStoryText } from '$lib/server/ai/story';
import { db } from '$lib/server/db';
import { stories } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// POST /api/generate/text - Generate story text
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { storyId } = body;

		if (!storyId) {
			return json({ error: 'storyId is required' }, { status: 400 });
		}

		// Get story
		const story = await db.query.stories.findFirst({
			where: eq(stories.id, storyId)
		});

		if (!story) {
			return json({ error: 'Story not found' }, { status: 404 });
		}

		// Parse config
		const config = JSON.parse(story.config || '{}');

		// Generate story text
		const result = await generateStoryText(storyId, config);

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
