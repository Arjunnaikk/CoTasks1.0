PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_user_team` (
	`team_id` integer,
	`user_id` integer,
	`role` text DEFAULT 'member' NOT NULL,
	PRIMARY KEY(`team_id`, `user_id`),
	FOREIGN KEY (`team_id`) REFERENCES `team`(`team_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
INSERT INTO `__new_user_team`("team_id", "user_id") SELECT "team_id", "user_id" FROM `user_team`;--> statement-breakpoint
DROP TABLE `user_team`;--> statement-breakpoint
ALTER TABLE `__new_user_team` RENAME TO `user_team`;--> statement-breakpoint
PRAGMA foreign_keys=ON;