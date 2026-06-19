CREATE TABLE `mass_intentions` (
	`id` int AUTO_INCREMENT NOT NULL,
	`requester_name` varchar(255) NOT NULL,
	`requester_email` varchar(255) NOT NULL,
	`requester_phone` varchar(50),
	`intention_for` varchar(500) NOT NULL,
	`intention_type` varchar(50) NOT NULL,
	`preferred_date` varchar(50),
	`preferred_mass` varchar(100),
	`notes` text,
	`status` varchar(30) NOT NULL DEFAULT 'pending',
	`scheduled_date` timestamp,
	`scheduled_mass` varchar(100),
	`admin_notes` text,
	`createdAt` timestamp NOT NULL DEFAULT (now()),
	`updatedAt` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `mass_intentions_id` PRIMARY KEY(`id`)
);
