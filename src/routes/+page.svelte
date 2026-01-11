<script lang="ts">
	// TaleLingo Studio - Home / Gateway
</script>

<svelte:head>
	<title>TaleLingo Studio</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
	<div class="max-w-4xl w-full">
		<!-- Header -->
		<div class="text-center mb-12">
			<h1 class="text-5xl font-bold text-indigo-900 mb-4">TaleLingo Studio</h1>
			<p class="text-xl text-indigo-700">AI-Powered Story Generation Platform</p>
		</div>

		<!-- Gateway Cards -->
		<div class="grid md:grid-cols-2 gap-8">
			<!-- Story Book Card -->
			<a
				href="/stories"
				class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-indigo-300"
			>
				<div class="flex flex-col items-center text-center">
					<div
						class="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
					>
						<span class="text-4xl">📖</span>
					</div>
					<h2 class="text-2xl font-bold text-gray-800 mb-3">Story Books</h2>
					<p class="text-gray-600">
						Create and manage interactive storybooks with AI-generated text, images, audio, and
						translations.
					</p>
					<div
						class="mt-6 text-indigo-600 font-semibold group-hover:translate-x-2 transition-transform inline-flex items-center gap-2"
					>
						Open Studio
						<span>→</span>
					</div>
				</div>
			</a>

			<!-- Story Video Card -->
			<a
				href="/videos"
				class="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-purple-300 opacity-60 cursor-not-allowed"
			>
				<div class="flex flex-col items-center text-center">
					<div
						class="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform"
					>
						<span class="text-4xl">🎬</span>
					</div>
					<h2 class="text-2xl font-bold text-gray-800 mb-3">Story Videos</h2>
					<p class="text-gray-600">
						Generate animated video stories from your content. Coming soon.
					</p>
					<div
						class="mt-6 text-purple-600 font-semibold inline-flex items-center gap-2"
					>
						Coming Soon
						<span class="text-sm">🔒</span>
					</div>
				</div>
			</a>
		</div>

		<!-- Stats -->
		<div class="mt-12 bg-white/80 backdrop-blur rounded-xl p-6 shadow-md">
			<div class="grid grid-cols-3 gap-4 text-center">
				<div>
					<div class="text-3xl font-bold text-indigo-600" id="story-count">-</div>
					<div class="text-sm text-gray-600">Stories</div>
				</div>
				<div>
					<div class="text-3xl font-bold text-green-600" id="published-count">-</div>
					<div class="text-sm text-gray-600">Published</div>
				</div>
				<div>
					<div class="text-3xl font-bold text-orange-600" id="pending-count">-</div>
					<div class="text-sm text-gray-600">In Review</div>
				</div>
			</div>
		</div>
	</div>
</div>

<script lang="ts">
	// Fetch stats on mount
	async function loadStats() {
		try {
			const res = await fetch('/api/stories/stats');
			if (res.ok) {
				const stats = await res.json();
				document.getElementById('story-count')!.textContent = stats.total || 0;
				document.getElementById('published-count')!.textContent = stats.published || 0;
				document.getElementById('pending-count')!.textContent = stats.reviewing || 0;
			}
		} catch {
			// Silently fail
		}
	}

	loadStats();
</script>
