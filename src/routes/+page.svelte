<svelte:head>
	<title>TaleLingo Studio</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-[oklch(98%_0.05_254.624)] to-indigo-100 flex items-center justify-center p-4">
	<div class="max-w-4xl w-full">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-5xl font-bold text-slate-900 mb-4">TaleLingo Studio</h1>
			<p class="text-xl text-slate-600">AI-Powered Story Generation Platform</p>
		</div>

		<!-- Gateway Cards -->
		<div class="grid md:grid-cols-2 gap-6">
			<!-- Story Book Card -->
			<a
				href="/stories"
				class="group bg-white rounded-xl shadow-sm hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-primary-light cursor-pointer"
			>
				<div class="flex flex-col items-center text-center p-8">
					<div
						class="w-20 h-20 bg-[oklch(98%_0.05_254.624)] rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
					>
						<span class="text-4xl">📖</span>
					</div>
					<h2 class="text-2xl font-bold text-slate-800 mb-3">Story Books</h2>
					<p class="text-slate-600 mb-6">
						Create and manage interactive storybooks with AI-generated text, images, audio, and
						translations.
					</p>
					<div
						class="text-primary font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2"
					>
						Open Studio
						<span>→</span>
					</div>
				</div>
			</a>

			<!-- Story Video Card -->
			<div class="group bg-white rounded-xl shadow-sm opacity-60">
				<div class="flex flex-col items-center text-center p-8">
					<div class="w-20 h-20 bg-purple-50 rounded-full flex items-center justify-center mb-6">
						<span class="text-4xl">🎬</span>
					</div>
					<h2 class="text-2xl font-bold text-slate-800 mb-3">Story Videos</h2>
					<p class="text-slate-600 mb-6">
						Generate animated video stories from your content. Coming soon.
					</p>
					<div class="text-purple-600 font-semibold inline-flex items-center gap-2">
						Coming Soon
						<span class="text-sm">🔒</span>
					</div>
				</div>
			</div>
		</div>

		<!-- Stats -->
		<div class="mt-8 bg-white/90 backdrop-blur rounded-xl p-6 shadow-sm border border-slate-200">
			<div class="grid grid-cols-3 gap-4 text-center">
				<div>
					<div class="text-3xl font-bold text-primary">{stats.total ?? 0}</div>
					<div class="text-sm text-slate-600">Stories</div>
				</div>
				<div>
					<div class="text-3xl font-bold text-green-600">{stats.published ?? 0}</div>
					<div class="text-sm text-slate-600">Published</div>
				</div>
				<div>
					<div class="text-3xl font-bold text-orange-600">{stats.reviewing ?? 0}</div>
					<div class="text-sm text-slate-600">In Review</div>
				</div>
			</div>
		</div>
	</div>
</div>

<script lang="ts">
	import { onMount } from 'svelte';

	let stats = $state<{ total?: number; published?: number; reviewing?: number }>({});

	onMount(async () => {
		try {
			const res = await fetch('/api/stories/stats');
			if (res.ok) {
				stats = await res.json();
			}
		} catch {
			// Silently fail
		}
	});
</script>
