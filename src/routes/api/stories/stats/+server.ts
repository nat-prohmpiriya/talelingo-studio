import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { db } from '$lib/server/db';
import { stories } from '$lib/server/db/schema';
import { count, eq } from 'drizzle-orm';

// GET /api/stories/stats - Get story statistics
export const GET: RequestHandler = async () => {
	try {
		// Get total count
		const [{ value: total }] = await db.select({ value: count() }).from(stories);

		// Get published count
		const [{ value: published }] = await db
			.select({ value: count() })
			.from(stories)
			.where(eq(stories.status, 'published'));

		// Get reviewing count
		const [{ value: reviewing }] = await db
			.select({ value: count() })
			.from(stories)
			.where(eq(stories.status, 'reviewing'));

		return json({
			total: total || 0,
			published: published || 0,
			reviewing: reviewing || 0
		});
	} catch (error) {
		console.error('Failed to fetch stats:', error);
		return json({ total: 0, published: 0, reviewing: 0 });
	}
};
