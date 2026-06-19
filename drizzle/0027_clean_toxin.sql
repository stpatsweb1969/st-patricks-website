CREATE TABLE `holy_days` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`date` varchar(10) NOT NULL,
	`mass_times` json NOT NULL,
	`category` enum('holy_day','special_mass','seasonal','parish_feast','triduum','other') NOT NULL DEFAULT 'holy_day',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `holy_days_id` PRIMARY KEY(`id`)
);
