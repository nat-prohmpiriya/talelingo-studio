import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { StoryService } from '$lib/server/services/Story.service';

/**
 * GET /api/stories/stats
 * Get story statistics
 */
export const GET: RequestHandler = async () => {
	try {
		const stats = await StoryService.getStats();
		return json(stats);
	} catch (error) {
		console.error('Failed to fetch stats:', error);
		return json({ total: 0, byLevel: {}, byCategory: {} });
	}
};
