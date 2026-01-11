import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { regenerateEpisode } from '$lib/server/ai/story';

// POST /api/generate/regenerate - Regenerate an episode
export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { storyId, episodeNumber, reason } = body;

		if (!storyId || episodeNumber === undefined) {
			return json({ error: 'storyId and episodeNumber are required' }, { status: 400 });
		}

		const result = await regenerateEpisode(storyId, episodeNumber, reason);

		return json({
			success: true,
			episode: result
		});
	} catch (error) {
		console.error('Regeneration failed:', error);
		return json(
			{
				error: 'Regeneration failed',
				details: String(error)
			},
			{ status: 500 }
		);
	}
};
