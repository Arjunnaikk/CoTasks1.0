CREATE TABLE `team_message_reaction` (
	`reaction_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`message_id` integer,
	`user_id` integer,
	`emoji` text NOT NULL,
	FOREIGN KEY (`message_id`) REFERENCES `team_message`(`message_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `uniq_reaction` ON `team_message_reaction` (`message_id`,`user_id`,`emoji`);