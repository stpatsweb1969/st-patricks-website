CREATE TABLE `prayer_support` (
	`id` int AUTO_INCREMENT NOT NULL,
	`intentionId` int NOT NULL,
	`userId` int,
	`name` varchar(100),
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `prayer_support_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `volunteer_need_responses` (
	`id` int AUTO_INCREMENT NOT NULL,
	`needId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`message` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `volunteer_need_responses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `volunteer_needs` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`urgency` enum('low','medium','high') NOT NULL DEFAULT 'medium',
	`category` varchar(100),
	`neededBy` timestamp,
	`spotsNeeded` int NOT NULL DEFAULT 1,
	`spotsFilled` int NOT NULL DEFAULT 0,
	`contactName` varchar(255),
	`contactEmail` varchar(320),
	`contactPhone` varchar(20),
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `volunteer_needs_id` PRIMARY KEY(`id`)
);
