CREATE TABLE `ccd_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`parentFirstName` varchar(255) NOT NULL,
	`parentLastName` varchar(255) NOT NULL,
	`parentEmail` varchar(320) NOT NULL,
	`parentPhone` varchar(20) NOT NULL,
	`address` text NOT NULL,
	`childFirstName` varchar(255) NOT NULL,
	`childLastName` varchar(255) NOT NULL,
	`childDob` timestamp NOT NULL,
	`grade` varchar(20) NOT NULL,
	`baptized` boolean NOT NULL DEFAULT false,
	`baptismChurch` varchar(500),
	`firstCommunion` boolean NOT NULL DEFAULT false,
	`schoolYear` varchar(20) NOT NULL,
	`status` enum('pending','approved','waitlisted','cancelled') NOT NULL DEFAULT 'pending',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `ccd_registrations_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cyo_games` (
	`id` int AUTO_INCREMENT NOT NULL,
	`teamId` int NOT NULL,
	`opponent` varchar(255) NOT NULL,
	`gameDate` timestamp NOT NULL,
	`location` varchar(500) NOT NULL,
	`homeAway` enum('home','away') NOT NULL DEFAULT 'home',
	`ourScore` int,
	`theirScore` int,
	`status` enum('scheduled','completed','cancelled','postponed') NOT NULL DEFAULT 'scheduled',
	`notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cyo_games_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `cyo_teams` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255) NOT NULL,
	`division` varchar(100) NOT NULL,
	`ageGroup` varchar(50) NOT NULL,
	`season` varchar(20) NOT NULL,
	`coachName` varchar(255),
	`coachEmail` varchar(320),
	`coachPhone` varchar(20),
	`wins` int NOT NULL DEFAULT 0,
	`losses` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `cyo_teams_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `volunteer_opportunities` (
	`id` int AUTO_INCREMENT NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text,
	`ministry` varchar(255),
	`eventDate` timestamp,
	`startTime` varchar(20),
	`endTime` varchar(20),
	`spotsAvailable` int NOT NULL DEFAULT 0,
	`spotsFilled` int NOT NULL DEFAULT 0,
	`active` boolean NOT NULL DEFAULT true,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `volunteer_opportunities_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `volunteer_signups` (
	`id` int AUTO_INCREMENT NOT NULL,
	`opportunityId` int NOT NULL,
	`name` varchar(255) NOT NULL,
	`email` varchar(320) NOT NULL,
	`phone` varchar(20),
	`notes` text,
	`status` enum('confirmed','cancelled') NOT NULL DEFAULT 'confirmed',
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `volunteer_signups_id` PRIMARY KEY(`id`)
);
