<svelte:head>
	<title>Workflow - TaleLingo Studio</title>
</svelte:head>

<div class="min-h-screen bg-slate-50 flex flex-col">
	<!-- Header -->
	<div class="bg-white shadow-sm border-b border-slate-200">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<a href="/stories" class="text-slate-400 hover:text-slate-600">
						<span>←</span>
					</a>
					<div>
						<h1 class="text-xl font-bold text-slate-900">{story?.titleEn || 'Loading...'}</h1>
						<p class="text-sm text-slate-500">
							{story?.level} • {story?.category} • {story?.episodeCount} episodes
						</p>
					</div>
				</div>
				<div class="flex items-center gap-2">
					<span
						class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {statusBadgeClasses[story?.status || 'draft']}"
					>
						{story?.status || 'draft'}
					</span>
				</div>
			</div>
		</div>
	</div>

	<!-- Step Wizard -->
	<div class="bg-white border-b border-slate-200">
		<div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex items-center justify-between">
				{#each STEPS as step, index}
					<div class="flex items-center">
						<div class="flex flex-col items-center">
							<button
								onclick={() => currentStep = step.key}
								class="w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all {
									currentStep === step.key
										? 'bg-primary text-white shadow-md'
										: isStepComplete(step.key)
											? 'bg-green-500 text-white'
											: 'bg-slate-200 text-slate-600'
								} {!isStepAccessible(step.key) ? 'opacity-50 cursor-not-allowed' : ''}"
								disabled={!isStepAccessible(step.key)}
							>
								{isStepComplete(step.key) ? '✓' : index + 1}
							</button>
							<span
								class="text-xs mt-1 {currentStep === step.key ? 'text-primary font-semibold' : 'text-slate-500'}"
							>
								{step.label}
							</span>
						</div>
						{#if index < STEPS.length - 1}
							<div
								class="w-16 h-1 mx-2 {isStepComplete(step.key) ? 'bg-green-500' : 'bg-slate-200'}"
							></div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	</div>

	<!-- Content Area -->
	<div class="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
		{#if currentStep === 'config'}
			<div class="bg-white rounded-xl shadow-sm border border-slate-200">
				<div class="p-6">
					<h2 class="text-2xl font-bold text-slate-900 mb-6">Story Configuration</h2>
				</div>
				<div class="px-6 pb-6">
					<div class="grid grid-cols-2 gap-6 mb-8">
						<div><label class="text-sm text-slate-500">Title</label><p class="font-medium">{story?.titleEn || '-'}</p></div>
						<div><label class="text-sm text-slate-500">Level</label><p class="font-medium">{story?.level || '-'}</p></div>
						<div><label class="text-sm text-slate-500">Category</label><p class="font-medium">{story?.category || '-'}</p></div>
						<div><label class="text-sm text-slate-500">Episodes</label><p class="font-medium">{story?.episodeCount || '-'}</p></div>
						<div class="col-span-2"><label class="text-sm text-slate-500">Art Style</label><p class="font-medium">{story?.artStyle || 'watercolor'}</p></div>
					</div>
				</div>
				{#if errorMessage}
					<div class="px-6 pb-6">
						<div class="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{errorMessage}</div>
					</div>
				{/if}
				<div class="px-6 pb-6 flex justify-end">
					<button
						onclick={generateText}
						disabled={generating}
						class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white px-4 py-2 hover:bg-primary-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
					>
						{#if generating}
							<span class="inline-block animate-spin mr-2">⟳</span>
							Generating...
						{:else}
							Start Text Generation →
						{/if}
					</button>
				</div>
			</div>
		{:else if currentStep === 'text'}
			<div class="bg-white rounded-xl shadow-sm border border-slate-200">
				<div class="p-6">
					<h2 class="text-2xl font-bold text-slate-900">Review Text Content</h2>
				</div>
				<div class="px-6 pb-6 space-y-4">
					{#if episodes.length === 0}
						<div class="text-center py-8 text-slate-500">
							<p>No episodes generated yet.</p>
							<button onclick={generateText} class="mt-4 text-primary hover:underline">
								Generate Text Content →
							</button>
						</div>
					{:else}
						{#each episodes as episode (episode.id)}
							{@const content = getEpisodeContent(episode)}
							<div class="border border-slate-200 rounded-lg overflow-hidden">
								<div class="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-200">
									<div class="flex items-center gap-3">
										<h3 class="font-medium">Episode {episode.episodeNumber}: {episode.titleEn}</h3>
										<span class="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold
											{episode.status === 'approved' ? 'bg-green-100 text-green-800' :
											 episode.status === 'rejected' ? 'bg-red-100 text-red-800' :
											 episode.status === 'generated' ? 'bg-blue-100 text-blue-800' :
											 'bg-slate-100 text-slate-800'}">
											{episode.status}
										</span>
									</div>
									<div class="flex items-center gap-2">
										<button
											onclick={() => regenerateEpisode(episode.episodeNumber)}
											disabled={generatingEpisode === episode.episodeNumber}
											class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white px-3 py-1 hover:bg-slate-50 text-xs disabled:opacity-50"
										>
											{generatingEpisode === episode.episodeNumber ? '...' : '🔄 Regenerate'}
										</button>
										{#if episode.status !== 'approved'}
											<button
												onclick={() => approveEpisode(episode.id)}
												class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-green-600 text-white px-3 py-1 hover:bg-green-700 text-xs"
											>
												✓ Approve
											</button>
										{/if}
									</div>
								</div>
								{#if content}
									<div class="p-4">
										<p class="text-sm text-slate-500 mb-3">{content.summary || ''}</p>
										<div class="space-y-3">
											{#each content.pages || [] as page}
												<div class="border border-slate-200 rounded p-3 bg-slate-50">
													<div class="flex items-center justify-between mb-2">
														<span class="text-xs font-medium text-slate-500">Page {page.pageNumber}</span>
														<span class="text-xs text-slate-400">{page.textEn?.split(' ').length || 0} words</span>
													</div>
													<p class="text-sm text-slate-700 mb-2">{page.textEn || ''}</p>
													{#if page.vocab && page.vocab.length > 0}
														<div class="flex flex-wrap gap-1 mt-2">
															{#each page.vocab.slice(0, 5) as word}
																<span class="inline-flex items-center rounded px-2 py-0.5 text-xs bg-amber-50 text-amber-700 border border-amber-200" title={word.definition}>
																	{word.word}
																</span>
															{/each}
														</div>
													{/if}
												</div>
											{/each}
										</div>
									</div>
								{:else}
									<div class="p-4 text-slate-500 text-sm">No content available</div>
								{/if}
							</div>
						{/each}
					{/if}
				</div>
				<div class="px-6 pb-6 flex justify-end">
					<button onclick={handleAdvance} class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white px-4 py-2 hover:bg-primary-hover transition-colors">
						Continue to Images →
					</button>
				</div>
			</div>
		{:else if currentStep === 'images'}
			<div class="bg-white rounded-xl shadow-sm border border-slate-200">
				<div class="p-6">
					<h2 class="text-2xl font-bold text-slate-900">Review Images</h2>
				</div>
				<div class="px-6 pb-6">
					<div class="grid grid-cols-3 gap-4">
						{#each Array(6) as _, i}
							<div class="aspect-square bg-slate-100 rounded-lg flex items-center justify-center relative group border border-slate-200">
								<span class="text-slate-400">Page {i + 1}</span>
								<div class="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
									<button class="px-3 py-1 text-sm bg-white rounded hover:bg-slate-100">🔄</button>
									<button class="px-3 py-1 text-sm bg-green-500 text-white rounded hover:bg-green-600">✓</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
				<div class="px-6 pb-6 flex justify-end">
					<button onclick={handleAdvance} class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white px-4 py-2 hover:bg-primary-hover transition-colors">
						Continue to Audio →
					</button>
				</div>
			</div>
		{:else if currentStep === 'audio'}
			<div class="bg-white rounded-xl shadow-sm border border-slate-200">
				<div class="p-6">
					<h2 class="text-2xl font-bold text-slate-900">Review Audio</h2>
				</div>
				<div class="px-6 pb-6 space-y-4">
					{#each Array(story?.episodeCount || 2) as _, ep}
						<div class="border border-slate-200 rounded-lg p-4">
							<div class="flex items-center justify-between">
								<div>
									<h3 class="font-medium">Episode {ep + 1}</h3>
									<p class="text-sm text-slate-500">Page 1 • Page 2 • Page 3</p>
								</div>
								<div class="flex items-center gap-4">
									<button class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50">▶ Play</button>
									<button class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white px-3 py-1 hover:bg-slate-50 text-xs">Regenerate</button>
									<button class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-green-600 text-white px-3 py-1 hover:bg-green-700 text-xs">Approve</button>
								</div>
							</div>
						</div>
					{/each}
				</div>
				<div class="px-6 pb-6 flex justify-end">
					<button onclick={handleAdvance} class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white px-4 py-2 hover:bg-primary-hover transition-colors">
						Continue to Translation →
					</button>
				</div>
			</div>
		{:else if currentStep === 'translate'}
			<div class="bg-white rounded-xl shadow-sm border border-slate-200">
				<div class="p-6">
					<h2 class="text-2xl font-bold text-slate-900">Review Translations</h2>
				</div>
				<div class="px-6 pb-6">
					<div class="grid grid-cols-5 gap-4">
						{#each LANGUAGES as lang}
							<div class="border border-slate-200 rounded-lg p-4 text-center">
								<div class="text-2xl mb-2">{lang.flag}</div>
								<div class="font-medium text-sm">{lang.name}</div>
								<div class="mt-3">
									<button class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-green-600 text-white px-3 py-1 hover:bg-green-700 w-full text-xs">Approve</button>
								</div>
							</div>
						{/each}
					</div>
				</div>
				<div class="px-6 pb-6 flex justify-end">
					<button onclick={handleAdvance} class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white px-4 py-2 hover:bg-primary-hover transition-colors">
						Continue to Final →
					</button>
				</div>
			</div>
		{:else if currentStep === 'final'}
			<div class="bg-white rounded-xl shadow-sm border border-slate-200">
				<div class="p-6">
					<h2 class="text-2xl font-bold text-slate-900">Final Preview & Publish</h2>
				</div>
				<div class="px-6 pb-6 space-y-6">
					<div class="border border-slate-200 rounded-lg p-6">
						<h3 class="font-medium mb-4">Story Summary</h3>
						<div class="grid grid-cols-4 gap-4 text-sm">
							<div><span class="text-slate-500">Title:</span> {story?.titleEn || '-'}</div>
							<div><span class="text-slate-500">Level:</span> {story?.level || '-'}</div>
							<div><span class="text-slate-500">Episodes:</span> {story?.episodeCount || '-'}</div>
							<div><span class="text-slate-500">Style:</span> {story?.artStyle || '-'}</div>
						</div>
					</div>
					<div class="border border-slate-200 rounded-lg p-6">
						<h3 class="font-medium mb-4">Generation Status</h3>
						<div class="space-y-2">
							<div class="flex items-center justify-between"><span>Text</span><span class="text-green-600">✓ Complete</span></div>
							<div class="flex items-center justify-between"><span>Images</span><span class="text-green-600">✓ Complete</span></div>
							<div class="flex items-center justify-between"><span>Audio</span><span class="text-green-600">✓ Complete</span></div>
							<div class="flex items-center justify-between"><span>Translations</span><span class="text-green-600">✓ Complete</span></div>
						</div>
					</div>
				</div>
				<div class="px-6 pb-6 flex justify-end gap-4">
					<button class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white px-6 py-2 hover:bg-slate-50">Preview All</button>
					<button class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white px-6 py-2 hover:bg-primary-hover">Publish Story</button>
				</div>
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';

	const STEPS = [
		{ key: 'config', label: 'Configure' },
		{ key: 'text', label: 'Text' },
		{ key: 'images', label: 'Images' },
		{ key: 'audio', label: 'Audio' },
		{ key: 'translate', label: 'Translate' },
		{ key: 'final', label: 'Final' }
	] as const;

	const LANGUAGES = [
		{ code: 'th', name: 'Thai', flag: '🇹🇭' },
		{ code: 'ja', name: 'Japanese', flag: '🇯🇵' },
		{ code: 'zh', name: 'Chinese', flag: '🇨🇳' },
		{ code: 'vi', name: 'Vietnamese', flag: '🇻🇳' },
		{ code: 'id', name: 'Indonesian', flag: '🇮🇩' }
	];

	type StepKey = typeof STEPS[number]['key'];

	interface Episode {
		id: string;
		episodeNumber: number;
		titleEn: string;
		status: 'draft' | 'generated' | 'approved' | 'rejected';
		content?: string;
	}

	interface Story {
		id: string;
		titleEn: string;
		level: string;
		category: string;
		status: string;
		currentStep: StepKey;
		episodeCount: number;
		artStyle?: string;
		episodes?: Episode[];
	}

	let currentStep = $state<StepKey>('config');
	let story = $state<Story | null>(null);
	let episodes = $state<Episode[]>([]);
	let generating = $state(false);
	let generatingEpisode = $state<number | null>(null);
	let errorMessage = $state('');
	let expandedEpisode = $state<number | null>(null);

	const statusBadgeClasses: Record<string, string> = {
		draft: 'bg-slate-100 text-slate-800',
		generating: 'bg-[oklch(95%_0.1_254.624)] text-[oklch(45%_0.2_254.624)]',
		reviewing: 'bg-yellow-100 text-yellow-800',
		approved: 'bg-green-100 text-green-800',
		published: 'bg-[oklch(95%_0.1_254.624)] text-[oklch(45%_0.2_254.624)]'
	};

	onMount(async () => {
		await loadStory();
	});

	async function loadStory() {
		const storyId = $page.params.id;
		try {
			const res = await fetch(`/api/stories/${storyId}`);
			if (res.ok) {
				const data = await res.json();
				story = data;
				episodes = data.episodes || [];
				currentStep = data.currentStep || 'config';
			}
		} catch (e) {
			console.error('Failed to load story:', e);
		}
	}

	async function generateText() {
		if (!story) return;
		generating = true;
		errorMessage = '';

		try {
			const res = await fetch('/api/generate/text', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ storyId: story.id })
			});

			if (res.ok) {
				await loadStory();
				currentStep = 'text';
				stepCompletion.text = false;
			} else {
				const error = await res.json();
				errorMessage = error.details || error.error || 'Generation failed';
			}
		} catch (e) {
			errorMessage = String(e);
		} finally {
			generating = false;
		}
	}

	async function regenerateEpisode(episodeNumber: number) {
		if (!story) return;
		generatingEpisode = episodeNumber;
		errorMessage = '';

		try {
			const res = await fetch('/api/generate/regenerate', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ storyId: story.id, episodeNumber })
			});

			if (res.ok) {
				await loadStory();
			} else {
				const error = await res.json();
				errorMessage = error.details || error.error || 'Regeneration failed';
			}
		} catch (e) {
			errorMessage = String(e);
		} finally {
			generatingEpisode = null;
		}
	}

	async function approveEpisode(episodeId: string) {
		try {
			const res = await fetch(`/api/episodes/${episodeId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'approved' })
			});

			if (res.ok) {
				await loadStory();
			}
		} catch (e) {
			console.error('Failed to approve episode:', e);
		}
	}

	async function rejectEpisode(episodeId: string) {
		try {
			const res = await fetch(`/api/episodes/${episodeId}`, {
				method: 'PATCH',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ status: 'rejected' })
			});

			if (res.ok) {
				await loadStory();
			}
		} catch (e) {
			console.error('Failed to reject episode:', e);
		}
	}

	let stepCompletion = $state<Record<string, boolean>>({
		config: false,
		text: false,
		images: false,
		audio: false,
		translate: false,
		final: false
	});

	function isStepComplete(step: StepKey): boolean {
		return stepCompletion[step] || false;
	}

	function isStepAccessible(step: StepKey): boolean {
		const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
		const targetIndex = STEPS.findIndex((s) => s.key === step);
		return targetIndex <= currentIndex || isStepComplete(step);
	}

	async function handleAdvance() {
		const currentIndex = STEPS.findIndex((s) => s.key === currentStep);
		stepCompletion[currentStep] = true;

		// Update story currentStep on server
		if (story && currentIndex < STEPS.length - 1) {
			const nextStep = STEPS[currentIndex + 1].key;
			try {
				await fetch(`/api/stories/${story.id}`, {
					method: 'PATCH',
					headers: { 'Content-Type': 'application/json' },
					body: JSON.stringify({ currentStep: nextStep })
				});
			} catch (e) {
				console.error('Failed to update step:', e);
			}
			currentStep = nextStep;
		}
	}

	function getEpisodeContent(episode: Episode) {
		if (!episode.content) return null;
		try {
			return JSON.parse(episode.content);
		} catch {
			return null;
		}
	}

	function isAllEpisodesApproved() {
		return episodes.length > 0 && episodes.every(ep => ep.status === 'approved');
	}
</script>
