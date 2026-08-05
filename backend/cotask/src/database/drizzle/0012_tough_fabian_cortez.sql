ALTER TABLE `user` ADD `email_reminders_enabled` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `personal_email_reminders_enabled` integer DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `user` ADD `group_email_reminders_enabled` integer DEFAULT true NOT NULL;