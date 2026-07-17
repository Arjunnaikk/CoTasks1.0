CREATE TABLE `task_comment` (
	`comment_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer,
	`user_id` integer,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`task_id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`user_id`) ON UPDATE no action ON DELETE cascade
);
