CREATE TABLE `homilies` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`date` timestamp NOT NULL,
	`celebrant` varchar(200),
	`topic` varchar(200),
	`audioUrl` text,
	`audioKey` varchar(500),
	`notes` text,
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `homilies_id` PRIMARY KEY(`id`)
);
