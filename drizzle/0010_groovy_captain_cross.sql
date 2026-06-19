CREATE TABLE `important_dates` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`eventDate` timestamp NOT NULL,
	`location` varchar(300),
	`note` text,
	`category` enum('ccd','cyo','sacrament','parish','teen_life','social') NOT NULL DEFAULT 'parish',
	`published` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `important_dates_id` PRIMARY KEY(`id`)
);
