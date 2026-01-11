import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { stories } from '$lib/server/db/schema';
import { desc } from 'drizzle-orm';

// GET /api/stories - List all stories
export const GET: RequestHandler = async () => {
	try {
		const allStories = await db
			.select({
				id: stories.id,
				titleEn: stories.titleEn,
				level: stories.level,
				category: stories.category,
				status: stories.status,
				currentStep: stories.currentStep,
				episodeCount: stories.episodeCount,
				artStyle: stories.artStyle,
				createdAt: stories.createdAt,
				updatedAt: stories.updatedAt
			})
			.from(stories)
			.orderBy(desc(stories.createdAt));

		return json(allStories);
	} catch (error) {
		console.error('Failed to fetch stories:', error);
		return json({ error: 'Failed to fetch stories' }, { status: 500 });
	}
};

// POST /api/stories - Create new story
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { titleEn, level, category, episodeCount, artStyle } = body;

		// Validate required fields
		if (!titleEn || !level || !category || !episodeCount) {
			return json({ error: 'Missing required fields' }, { status: 400 });
		}

		// Create story
		const newStory = await db
			.insert(stories)
			.values({
				titleEn,
				level,
				category,
				episodeCount: parseInt(episodeCount),
				artStyle: artStyle || 'watercolor',
				status: 'draft',
				currentStep: 'config',
				config: JSON.stringify({ titleEn, level, category, episodeCount, artStyle })
			})
			.returning();

		return json(newStory[0], { status: 201 });
	} catch (error) {
		console.error('Failed to create story:', error);
		return json({ error: 'Failed to create story' }, { status: 500 });
	}
};
