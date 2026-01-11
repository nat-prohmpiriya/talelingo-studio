/**
 * AI Provider Configuration
 * Uses Vercel AI SDK for multi-model support
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

// Get model by provider
export function getModel(provider: AIProvider = 'gemini') {
	switch (provider) {
		case 'gemini':
			return gemini('gemini-2.0-flash-exp');
		case 'claude':
			return claude('claude-3-5-sonnet-20241022');
		default:
			return gemini('gemini-2.0-flash-exp');
	}
}

// Model aliases for specific tasks
export const MODELS = {
	// Text generation
	generateText: 'gemini-2.0-flash-exp',
	generateTextClaude: 'claude-3-5-sonnet-20241022',

	// Image prompts
	imagePrompt: 'gemini-2.0-flash-exp',

	// Translation
	translate: 'gemini-2.0-flash-exp',

	// Review/Validation
	review: 'claude-3-5-sonnet-20241022'
} as const;
