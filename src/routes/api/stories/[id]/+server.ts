import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { StoryService } from '$lib/server/services/Story.service';
import type { IStory } from '$lib/server/models/Story.model';

/**
 * GET /api/stories/:id
 * Get single story by ID
 */
export const GET: RequestHandler = async ({ params }) => {
	try {
		const story = await StoryService.getStoryById(params.id);

		if (!story) {
			return json({ error: 'Story not found' }, { status: 404 });
		}

		return json(story);
	} catch (error) {
		console.error('Failed to fetch story:', error);
		return json({ error: 'Failed to fetch story' }, { status: 500 });
	}
};

/**
 * PATCH /api/stories/:id
 * Update story by ID
 *
 * Body: Partial<IStory> (excluding direct episode updates)
 */
export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();

		const story = await StoryService.getStoryById(params.id);
		if (!story) {
			return json({ error: 'Story not found' }, { status: 404 });
		}

		// Update by slug since slug is our unique identifier
		const updated = await StoryService.updateStory(story.slug, body);

		return json(updated);
	} catch (error) {
		console.error('Failed to update story:', error);
		return json({ error: 'Failed to update story' }, { status: 500 });
	}
};

/**
 * DELETE /api/stories/:id
 * Delete story by ID
 */
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		const story = await StoryService.getStoryById(params.id);
		if (!story) {
			return json({ error: 'Story not found' }, { status: 404 });
		}

		await StoryService.deleteStory(story.slug);
		return json({ success: true });
	} catch (error) {
		console.error('Failed to delete story:', error);
		return json({ error: 'Failed to delete story' }, { status: 500 });
	}
};
