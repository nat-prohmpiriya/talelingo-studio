import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { StoryService } from '$lib/server/services/Story.service';

/**
 * GET /api/stories
 * List all stories with pagination and filters
 *
 * Query params:
 * - page: number (default: 1)
 * - limit: number (default: 20)
 * - level: 'A1' | 'A2' | 'B1' | 'B2'
 * - category: string
 */
export const GET: RequestHandler = async ({ url }) => {
	try {
		const page = parseInt(url.searchParams.get('page') || '1');
		const limit = parseInt(url.searchParams.get('limit') || '20');
		const level = url.searchParams.get('level') || undefined;
		const category = url.searchParams.get('category') || undefined;

		const result = await StoryService.getAllStories({
			page,
			limit,
			level,
			category
		});

		return json(result);
	} catch (error) {
		console.error('Failed to fetch stories:', error);
		return json({ error: 'Failed to fetch stories' }, { status: 500 });
	}
};

/**
 * POST /api/stories
 * Create a new story (draft)
 *
 * Body:
 * - titleEn: string (required)
 * - titleTh?: string
 * - level: 'A1' | 'A2' | 'B1' | 'B2' (required)
 * - category: string (required)
 * - episodeCount: number (required)
 * - artStyle?: string
 */
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { titleEn, titleTh, level, category, episodeCount, artStyle } = body;

		// Validate required fields
		if (!titleEn || !level || !category || !episodeCount) {
			return json({ error: 'Missing required fields: titleEn, level, category, episodeCount' }, { status: 400 });
		}

		// Validate level
		const validLevels = ['A1', 'A2', 'B1', 'B2'];
		if (!validLevels.includes(level)) {
			return json({ error: 'Invalid level. Must be A1, A2, B1, or B2' }, { status: 400 });
		}

		// Create story
		const story = await StoryService.createStory({
			titleEn,
			titleTh,
			level,
			category,
			episodeCount,
			artStyle
		});

		return json(story, { status: 201 });
	} catch (error: any) {
		console.error('Failed to create story:', error);

		// Handle duplicate slug error
		if (error.message && error.message.includes('already exists')) {
			return json({ error: error.message }, { status: 409 });
		}

		return json({ error: 'Failed to create story' }, { status: 500 });
	}
};
