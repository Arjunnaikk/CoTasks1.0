CREATE TABLE `user_team_last_read` (
	`user_id` integer,
	`team_id` integer,
	`last_read_message_id` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`user_id`, `team_id`),
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`team_id`) REFERENCES `team`(`team_id`) ON UPDATE no action ON DELETE cascade
);
