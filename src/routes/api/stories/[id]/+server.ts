import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { stories, episodes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// GET /api/stories/:id - Get single story with episodes
export const GET: RequestHandler = async ({ params }) => {
	try {
		// Get story
		const [story] = await db.select().from(stories).where(eq(stories.id, params.id));

		if (!story) {
			return json({ error: 'Story not found' }, { status: 404 });
		}

		// Get episodes
		const storyEpisodes = await db
			.select()
			.from(episodes)
			.where(eq(episodes.storyId, params.id))
			.orderBy(episodes.episodeNumber);

		return json({
			...story,
			episodes: storyEpisodes
		});
	} catch (error) {
		console.error('Failed to fetch story:', error);
		return json({ error: 'Failed to fetch story' }, { status: 500 });
	}
};

// PATCH /api/stories/:id - Update story
export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const { status, currentStep, content, reviewNotes } = body;

		// Build update object
		const update: any = {};
		if (status) update.status = status;
		if (currentStep) update.currentStep = currentStep;
		if (content) update.content = JSON.stringify(content);
		update.updatedAt = new Date();

		const [updated] = await db
			.update(stories)
			.set(update)
			.where(eq(stories.id, params.id))
			.returning();

		return json(updated);
	} catch (error) {
		console.error('Failed to update story:', error);
		return json({ error: 'Failed to update story' }, { status: 500 });
	}
};

// DELETE /api/stories/:id - Delete story
export const DELETE: RequestHandler = async ({ params }) => {
	try {
		await db.delete(stories).where(eq(stories.id, params.id));
		return json({ success: true });
	} catch (error) {
		console.error('Failed to delete story:', error);
		return json({ error: 'Failed to delete story' }, { status: 500 });
	}
};
