CREATE TABLE `team_message` (
	`message_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`team_id` integer,
	`user_id` integer,
	`content` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`team_id`) REFERENCES `team`(`team_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
