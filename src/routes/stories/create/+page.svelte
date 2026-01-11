<svelte:head>
	<title>Create Story - TaleLingo Studio</title>
</svelte:head>

<div class="min-h-screen bg-slate-50">
	<!-- Header -->
	<div class="bg-white shadow-sm border-b border-slate-200">
		<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
			<div class="flex items-center gap-4">
				<a href="/stories" class="text-slate-400 hover:text-slate-600">
					<span>←</span>
				</a>
				<div>
					<h1 class="text-2xl font-bold text-slate-900">Create New Story</h1>
					<p class="text-sm text-slate-500">Configure your AI-generated story</p>
				</div>
			</div>
		</div>
	</div>

	<!-- Form -->
	<div class="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
		<form onsubmit={handleSubmit} class="space-y-6">
			<!-- Title -->
			<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
				<label class="block text-sm font-medium text-slate-700 mb-2">
					Story Title <span class="text-red-500">*</span>
				</label>
				<input
					type="text"
					bind:value={formData.titleEn}
					required
					placeholder="e.g., The Lion and the Mouse"
					class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary"
				/>
				<p class="mt-1 text-sm text-slate-500">English title for the story</p>
			</div>

			<!-- Level & Category -->
			<div class="grid grid-cols-2 gap-6">
				<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
					<label class="block text-sm font-medium text-slate-700 mb-2">
						CEFR Level <span class="text-red-500">*</span>
					</label>
					<select
						bind:value={formData.level}
						required
						class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<option value="">Select level</option>
						<option value="A1">A1 - Beginner (500 words)</option>
						<option value="A2">A2 - Elementary (1000 words)</option>
						<option value="B1">B1 - Intermediate (2000 words)</option>
						<option value="B2">B2 - Upper Intermediate (3000 words)</option>
					</select>
					<p class="mt-1 text-sm text-slate-500">
						Oxford 3000 vocabulary limit
					</p>
				</div>

				<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
					<label class="block text-sm font-medium text-slate-700 mb-2">
						Category <span class="text-red-500">*</span>
					</label>
					<select
						bind:value={formData.category}
						required
						class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
					>
						<option value="">Select category</option>
						<option value="Fable">Fable</option>
						<option value="Fairy">Fairy Tale</option>
						<option value="Mystery">Mystery</option>
						<option value="Fantasy">Fantasy</option>
						<option value="Romance">Romance</option>
						<option value="Daily">Daily Life</option>
						<option value="Adventure">Adventure</option>
						<option value="Sci-Fi">Sci-Fi</option>
					</select>
				</div>
			</div>

			<!-- Episodes -->
			<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
				<label class="block text-sm font-medium text-slate-700 mb-2">
					Number of Episodes <span class="text-red-500">*</span>
				</label>
				<div class="flex items-center gap-4">
					<input
						type="range"
						min="2"
						max="10"
						bind:value={formData.episodeCount}
						class="flex-1"
					/>
					<span
						class="text-2xl font-bold text-primary w-12 text-center"
					>
						{formData.episodeCount}
					</span>
				</div>
				<p class="mt-1 text-sm text-slate-500">
					2-10 episodes per story
				</p>
			</div>

			<!-- Art Style -->
			<div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
				<label class="block text-sm font-medium text-slate-700 mb-2">
					Art Style
				</label>
				<select
					bind:value={formData.artStyle}
					class="flex h-10 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
				>
					<option value="watercolor">Watercolor</option>
					<option value="children">Children's Book</option>
					<option value="ghibli">Ghibli Style</option>
					<option value="pixar">Pixar Style</option>
					<option value="realistic">Realistic</option>
					<option value="cartoon">Cartoon</option>
				</select>
				<p class="mt-1 text-sm text-slate-500">
					Visual style for story illustrations
				</p>
			</div>

			<!-- Submit -->
			<div class="flex items-center justify-end gap-4">
				<a
					href="/stories"
					class="inline-flex items-center justify-center rounded-md text-sm font-medium border border-slate-300 bg-white px-4 py-2 hover:bg-slate-50 transition-colors"
				>
					Cancel
				</a>
				<button
					type="submit"
					disabled={submitting}
					class="inline-flex items-center justify-center rounded-md text-sm font-medium bg-primary text-white px-4 py-2 hover:bg-primary-hover transition-colors disabled:opacity-50"
				>
					{#if submitting}
						<span class="inline-block animate-spin">⟳</span>
						Creating...
					{:else}
						Start Generation →
					{/if}
				</button>
			</div>
		</form>
	</div>
</div>

<script lang="ts">
	import { goto } from '$app/navigation';

	let formData = $state({
		titleEn: '',
		level: 'A2',
		category: 'Fable',
		episodeCount: 5,
		artStyle: 'watercolor'
	});

	let submitting = $state(false);

	async function handleSubmit(e: Event) {
		e.preventDefault();
		submitting = true;

		try {
			const res = await fetch('/api/stories', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify(formData)
			});

			if (res.ok) {
				const story = await res.json();
				goto(`/stories/${story.id}/workflow`);
			} else {
				alert('Failed to create story');
			}
		} catch (e) {
			console.error('Failed to create story:', e);
			alert('Failed to create story');
		} finally {
			submitting = false;
		}
	}
</script>
