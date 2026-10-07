CREATE TYPE "public"."room_visibility" AS ENUM('public', 'semi-private', 'private');--> statement-breakpoint
CREATE TABLE "room" (
	"id" varchar(6) PRIMARY KEY NOT NULL,
	"name" varchar(28) NOT NULL,
	"players" integer DEFAULT 1 NOT NULL,
	"max_players" integer NOT NULL,
	"visibility" "room_visibility" NOT NULL,
	"mode" varchar(32) DEFAULT 'Grand Prix' NOT NULL,
	"password_hash" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "room_players_range" CHECK ("room"."players" >= 0 AND "room"."players" <= "room"."max_players"),
	CONSTRAINT "room_password_only_private" CHECK (("room"."visibility" = 'private') = ("room"."password_hash" IS NOT NULL))
);
