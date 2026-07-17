CREATE TABLE `task_subtask` (
	`subtask_id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`task_id` integer,
	`title` text NOT NULL,
	`is_completed` integer DEFAULT false NOT NULL,
	FOREIGN KEY (`task_id`) REFERENCES `task`(`task_id`) ON UPDATE no action ON DELETE cascade
);
