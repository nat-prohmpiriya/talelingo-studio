import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { StoryRepository } from '$lib/server/repositories/Story.repository';

// PATCH /api/episodes/:id - Update episode status (approve/reject)
// Note: This updates an episode nested within a story
export const PATCH: RequestHandler = async ({ params, request }) => {
	try {
		const body = await request.json();
		const { status, reviewNotes, storyId } = body;

		if (!storyId) {
			return json({ error: 'storyId is required' }, { status: 400 });
		}

		if (!status || !['draft', 'generated', 'approved', 'rejected'].includes(status)) {
			return json({ error: 'Invalid status' }, { status: 400 });
		}

		// Find the story containing the episode
		const story = await StoryRepository.findBySlug(storyId);
		if (!story) {
			// Try finding by MongoDB _id if slug doesn't work
			const storyById = await StoryRepository.findById(storyId);
			if (!storyById) {
				return json({ error: 'Story not found' }, { status: 404 });
			}
		}

		// Update the specific episode within the story
		const episodeNumber = parseInt(params.id);
		const updatedStory = await StoryRepository.updateEpisode(
			storyId,
			episodeNumber,
			status,
			reviewNotes
		);

		if (!updatedStory) {
			return json({ error: 'Episode not found' }, { status: 404 });
		}

		// Return the updated episode
		const episode = updatedStory.episodes.find(
			(ep) => ep.episodeNumber === episodeNumber
		);

		return json(episode);
	} catch (error) {
		console.error('Failed to update episode:', error);
		return json({ error: 'Failed to update episode' }, { status: 500 });
	}
};
