ALTER TABLE `ccd_registrations` ADD `reminderOptIn` boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE `ccd_registrations` ADD `unsubscribeToken` varchar(64);