/**
 * AI Provider Configuration
 * Uses Vercel AI SDK for multi-model support
 *
 * Latest Models (2025):
 * - Gemini 3.0 Flash (Dec 2025)
 * - Claude Opus 4.5, Haiku 4.5, Sonnet 4.5
 */

import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createAnthropic } from '@ai-sdk/anthropic';
import { env } from '$env/dynamic/private';

// Provider types
export type AIProvider = 'gemini' | 'claude';

// Initialize Gemini
export const gemini = createGoogleGenerativeAI({
	apiKey: env.GEMINI_API_KEY || ''
});

// Initialize Claude
export const claude = createAnthropic({
	apiKey: env.ANTHROPIC_API_KEY || ''
});

// Get default provider
export function getDefaultProvider(): AIProvider {
	return (env.DEFAULT_AI_PROVIDER as AIProvider) || 'gemini';
}

// Get model by provider (uses latest models)
export function getModel(provider: AIProvider = 'gemini') {
	switch (provider) {
		case 'gemini':
			return gemini('gemini-3.0-flash-exp');
		case 'claude':
			return claude('claude-sonnet-4-5-20250620');
		default:
			return gemini('gemini-3.0-flash-exp');
	}
}

// Model aliases for specific tasks
export const MODELS = {
	// Text generation (latest Gemini 3)
	generateText: 'gemini-3.0-flash-exp',
	generateTextClaude: 'claude-sonnet-4-5-20250620',

	// Image prompts
	imagePrompt: 'gemini-3.0-flash-exp',

	// Translation
	translate: 'gemini-3.0-flash-exp',

	// Review/Validation (Claude Sonnet 4.5 for quality)
	review: 'claude-sonnet-4-5-20250620',

	// Fast/cheap operations (Haiku 4.5)
	fast: 'claude-haiku-4-5-20250620',

	// High-quality reasoning (Opus 4.5)
	reasoning: 'claude-opus-4-5-20250620'
} as const;
