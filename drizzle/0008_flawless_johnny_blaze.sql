CREATE TABLE `parish_registrations` (
	`id` int AUTO_INCREMENT NOT NULL,
	`headOfHousehold` varchar(200) NOT NULL,
	`spouseName` varchar(200),
	`address` text NOT NULL,
	`city` varchar(100) NOT NULL,
	`state` varchar(10) NOT NULL DEFAULT 'NY',
	`zip` varchar(10) NOT NULL,
	`phone` varchar(20) NOT NULL,
	`email` varchar(320) NOT NULL,
	`previousParish` varchar(300),
	`numChildren` varchar(10),
	`notes` text,
	`status` enum('pending','welcomed','active') NOT NULL DEFAULT 'pending',
	`adminNotes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `parish_registrations_id` PRIMARY KEY(`id`)
);
