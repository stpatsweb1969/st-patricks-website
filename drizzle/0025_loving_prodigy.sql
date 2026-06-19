CREATE TABLE `staff_members` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(300) NOT NULL,
	`role` varchar(300) NOT NULL,
	`category` enum('clergy','staff','leadership','ministry_leader','emeritus') NOT NULL,
	`phone` varchar(50),
	`email` varchar(320),
	`sort_order` int NOT NULL DEFAULT 0,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `staff_members_id` PRIMARY KEY(`id`)
);
