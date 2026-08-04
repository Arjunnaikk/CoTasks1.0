CREATE TABLE `user_fcm_token` (
	`token_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`user_id` integer,
	`token` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP) NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_fcm_token_token_unique` ON `user_fcm_token` (`token`);--> statement-breakpoint
PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_task` (
	`task_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`status` text DEFAULT 'backlog' NOT NULL,
	`start_d` text DEFAULT (CURRENT_TIMESTAMP),
	`end_d` integer,
	`priority` integer DEFAULT 0,
	`assigner_id` integer,
	`list_id` integer,
	`team_id` integer,
	FOREIGN KEY (`assigner_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`list_id`) REFERENCES `list`(`list_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`team_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_task`("task_id", "title", "description", "status", "start_d", "end_d", "priority", "assigner_id", "list_id", "team_id") SELECT "task_id", "title", "description", "status", "start_d", "end_d", "priority", "assigner_id", "list_id", "team_id" FROM `task`;--> statement-breakpoint
DROP TABLE `task`;--> statement-breakpoint
ALTER TABLE `__new_task` RENAME TO `task`;--> statement-breakpoint
PRAGMA foreign_keys=ON;