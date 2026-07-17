CREATE TABLE `activity_log` (
	`activity_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer,
	`user_id` integer,
	`action` text NOT NULL,
	`description` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`team_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
