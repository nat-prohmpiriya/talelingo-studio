import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { episodes } from '$lib/server/db/schema';
import { eq } from 'drizzle-orm';

// PATCH /api/episodes/:id - Update episode status (approve/reject)
export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const { status, reviewNotes } = body;

		if (!status || !['draft', 'generated', 'approved', 'rejected'].includes(status)) {
			return json({ error: 'Invalid status' }, { status: 400 });
		}

		const update: any = { status };
		if (reviewNotes) update.reviewNotes = reviewNotes;
		update.updatedAt = new Date();

		const [updated] = await db
			.update(episodes)
			.set(update)
			.where(eq(episodes.id, params.id))
			.returning();

		return json(updated);
	} catch (error) {
		console.error('Failed to update episode:', error);
		return json({ error: 'Failed to update episode' }, { status: 500 });
	}
};
