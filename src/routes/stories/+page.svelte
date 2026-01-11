<svelte:head>
	<title>Stories - TaleLingo Studio</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<!-- Header -->
	<div class="bg-white shadow-sm border-b border-slate-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-4">
					<a href="/" class="text-slate-400 hover:text-slate-600">
						<span class="text-xl">←</span>
					</a>
					<div>
						<h1 class="text-2xl font-bold text-slate-900">Story Books</h1>
						<p class="text-sm text-slate-500">Manage your AI-generated stories</p>
					</div>
				</div>
				<a
					href="/stories/create"
					class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white px-4 py-2 hover:bg-primary-hover transition-colors"
				>
					<span>+</span> New Story
				</a>
			</div>
		</div>
	</div>

	<!-- Filters -->
	<div class="bg-white border-b border-slate-200">
		<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
			<div class="flex items-center gap-4">
				<select
					bind:value={filterStatus}
					class="flex h-10 w-40 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
				>
					<option value="">All Status</option>
					<option value="draft">Draft</option>
					<option value="generating">Generating</option>
					<option value="reviewing">Reviewing</option>
					<option value="approved">Approved</option>
					<option value="published">Published</option>
				</select>
				<select
					bind:value={filterLevel}
					class="flex h-10 w-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600"
				>
					<option value="">All Levels</option>
					<option value="A1">A1</option>
					<option value="A2">A2</option>
					<option value="B1">B1</option>
					<option value="B2">B2</option>
				</select>
				<input
					type="text"
					bind:value={searchQuery}
					placeholder="Search stories..."
					class="flex h-10 w-full max-w-xs rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600"
				/>
			</div>
		</div>
	</div>

	<!-- Stories Grid -->
	<div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		{#if loading}
			<div class="text-center py-12">
				<div class="inline-block animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent"></div>
			</div>
		{:else if filteredStories.length === 0}
			<div class="text-center py-12">
				<p class="text-slate-500 mb-4">No stories found</p>
				<a
					href="/stories/create"
					class="text-primary hover:text-primary-hover font-medium"
				>
					Create your first story →
				</a>
			</div>
		{:else}
			<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{#each filteredStories as story (story.id)}
					<a
						href="/stories/{story.id}"
						class="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden border border-slate-200"
					>
						<div class="p-6">
							<div class="flex items-start justify-between mb-3">
								<span
									class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold {statusBadgeClasses[story.status] || 'bg-slate-100 text-slate-800'}"
								>
									{story.status}
								</span>
								<span class="text-sm font-medium text-primary">{story.level}</span>
							</div>
							<h3 class="font-semibold text-slate-900 mb-1 truncate">{story.titleEn}</h3>
							<p class="text-sm text-slate-500 mb-3">{story.category}</p>
							<div class="flex items-center justify-between text-sm text-slate-400">
								<span>{story.episodeCount} episodes</span>
								<span class="capitalize">{story.currentStep}</span>
							</div>
						</div>
						{#if story.status === 'generating' || story.status === 'reviewing'}
							<div class="h-1 bg-slate-200">
								<div
									class="h-full bg-primary transition-all"
									style="width: {stepProgress[story.currentStep] || 0}%"
								></div>
							</div>
						{/if}
					</a>
				{/each}
			</div>
		{/if}
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';

	type Story = {
		id: string;
		titleEn: string;
		level: string;
		category: string;
		status: 'draft' | 'generating' | 'reviewing' | 'approved' | 'published';
		currentStep: 'config' | 'text' | 'images' | 'audio' | 'translate' | 'final';
		episodeCount: number;
		createdAt: Date;
	};

	let stories = $state<Story[]>([]);
	let loading = $state(true);
	let filterStatus = $state('');
	let filterLevel = $state('');
	let searchQuery = $state('');

	const statusBadgeClasses: Record<string, string> = {
		draft: 'bg-slate-100 text-slate-800',
		generating: 'bg-[oklch(95%_0.1_254.624)] text-[oklch(45%_0.2_254.624)]',
		reviewing: 'bg-yellow-100 text-yellow-800',
		approved: 'bg-green-100 text-green-800',
		published: 'bg-[oklch(95%_0.1_254.624)] text-[oklch(45%_0.2_254.624)]'
	};

	const stepProgress: Record<string, number> = {
		config: 0,
		text: 20,
		images: 40,
		audio: 60,
		translate: 80,
		final: 100
	};

	let filteredStories = $derived(() =>
		stories.filter((s) => {
			if (filterStatus && s.status !== filterStatus) return false;
			if (filterLevel && s.level !== filterLevel) return false;
			if (searchQuery && !s.titleEn.toLowerCase().includes(searchQuery.toLowerCase())) return false;
			return true;
		})
	);

	onMount(async () => {
		await loadStories();
	});

	async function loadStories() {
		loading = true;
		try {
			const res = await fetch('/api/stories');
			if (res.ok) {
				const data = await res.json();
				stories = data.map((s: any) => ({
					...s,
					createdAt: new Date(s.createdAt)
				}));
			}
		} catch (e) {
			console.error('Failed to load stories:', e);
		} finally {
			loading = false;
		}
	}
</script>
