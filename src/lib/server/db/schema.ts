import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';
import { relations } from 'drizzle-orm';

// Story statuses
export type StoryStatus = 'draft' | 'generating' | 'reviewing' | 'approved' | 'published';

// Step in workflow
export type WorkflowStep = 'config' | 'text' | 'images' | 'audio' | 'translate' | 'final';

// Job statuses
export type JobStatus = 'pending' | 'running' | 'completed' | 'failed';

// Stories table
export const stories = sqliteTable('stories', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	titleEn: text('title_en').notNull(),
	titleTh: text('title_th'),
	level: text('level').notNull(), // A1, A2, B1, B2
	category: text('category').notNull(), // Fable, Fairy, Mystery, etc.
	status: text('status', { enum: ['draft', 'generating', 'reviewing', 'approved', 'published'] })
		.notNull()
		.$default(() => 'draft'),
	currentStep: text('current_step', { enum: ['config', 'text', 'images', 'audio', 'translate', 'final'] })
		.$default(() => 'config'),
	episodeCount: integer('episode_count').notNull().default(0),
	artStyle: text('art_style'), // watercolor, ghibli, children, etc.
	config: text('config'), // JSON string - generation parameters
	content: text('content'), // JSON string - full generated story
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Episodes table
export const episodes = sqliteTable('episodes', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	storyId: text('story_id')
		.notNull()
		.references(() => stories.id, { onDelete: 'cascade' }),
	episodeNumber: integer('episode_number').notNull(),
	titleEn: text('title_en').notNull(),
	titleTh: text('title_th'),
	status: text('status', { enum: ['draft', 'generated', 'approved', 'rejected'] })
		.notNull()
		.$default(() => 'draft'),
	content: text('content'), // JSON string - episode pages, vocab, etc.
	reviewNotes: text('review_notes'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	updatedAt: integer('updated_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date())
});

// Jobs table - for async generation tasks
export const jobs = sqliteTable('jobs', {
	id: text('id')
		.primaryKey()
		.$defaultFn(() => crypto.randomUUID()),
	storyId: text('story_id')
		.notNull()
		.references(() => stories.id, { onDelete: 'cascade' }),
	type: text('type', { enum: ['text', 'images', 'audio', 'translate', 'validate'] }).notNull(),
	status: text('status', { enum: ['pending', 'running', 'completed', 'failed'] })
		.notNull()
		.$default(() => 'pending'),
	progress: integer('progress').notNull().default(0), // 0-100
	result: text('result'), // JSON string - job result
	error: text('error'),
	createdAt: integer('created_at', { mode: 'timestamp' })
		.notNull()
		.$defaultFn(() => new Date()),
	completedAt: integer('completed_at', { mode: 'timestamp' })
});

// Relations
export const storiesRelations = relations(stories, ({ many }) => ({
	episodes: many(episodes),
	jobs: many(jobs)
}));

export const episodesRelations = relations(episodes, ({ one }) => ({
	story: one(stories, {
		fields: [episodes.storyId],
		references: [stories.id]
	})
}));

export const jobsRelations = relations(jobs, ({ one }) => ({
	story: one(stories, {
		fields: [jobs.storyId],
		references: [stories.id]
	})
}));
