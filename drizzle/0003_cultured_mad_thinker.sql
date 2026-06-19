CREATE TABLE `ccd_events` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`eventDate` timestamp NOT NULL,
	`endDate` timestamp,
	`eventType` enum('class','holiday','special','sacrament') NOT NULL DEFAULT 'class',
	`grade` varchar(50),
	`location` varchar(500),
	`schoolYear` varchar(20) NOT NULL,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ccd_events_id` PRIMARY KEY(`id`)
);
