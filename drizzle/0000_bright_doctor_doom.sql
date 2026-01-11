CREATE TABLE `episodes` (
	`id` text PRIMARY KEY NOT NULL,
	`story_id` text NOT NULL,
	`episode_number` integer NOT NULL,
	`title_en` text NOT NULL,
	`title_th` text,
	`status` text NOT NULL,
	`content` text,
	`review_notes` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `jobs` (
	`id` text PRIMARY KEY NOT NULL,
	`story_id` text NOT NULL,
	`type` text NOT NULL,
	`status` text NOT NULL,
	`progress` integer DEFAULT 0 NOT NULL,
	`result` text,
	`error` text,
	`created_at` integer NOT NULL,
	`completed_at` integer,
	FOREIGN KEY (`story_id`) REFERENCES `stories`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `stories` (
	`id` text PRIMARY KEY NOT NULL,
	`title_en` text NOT NULL,
	`title_th` text,
	`level` text NOT NULL,
	`category` text NOT NULL,
	`status` text NOT NULL,
	`current_step` text,
	`episode_count` integer DEFAULT 0 NOT NULL,
	`art_style` text,
	`config` text,
	`content` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
