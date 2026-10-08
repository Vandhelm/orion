ALTER TABLE "room" ADD COLUMN "language" varchar(2) DEFAULT 'fr' NOT NULL;--> statement-breakpoint
ALTER TABLE "room" ADD COLUMN "bots" boolean DEFAULT false NOT NULL;