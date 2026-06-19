CREATE TABLE `prayer_intentions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(100),
	`intention` text NOT NULL,
	`isPublic` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prayer_intentions_id` PRIMARY KEY(`id`)
);
