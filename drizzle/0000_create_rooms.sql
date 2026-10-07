CREATE TYPE "public"."room_visibility" AS ENUM('public', 'semi-public', 'private');--> statement-breakpoint
CREATE TABLE "room" (
	"id" varchar(6) PRIMARY KEY NOT NULL,
	"name" varchar(28) NOT NULL,
	"players" integer DEFAULT 1 NOT NULL,
	"max_players" integer NOT NULL,
	"visibility" "room_visibility" NOT NULL,
	"mode" varchar(32) DEFAULT 'Grand Prix' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "room_players_range" CHECK ("room"."players" >= 0 AND "room"."players" <= "room"."max_players")
);
--> statement-breakpoint
CREATE TABLE "room_invite" (
	"token_hash" varchar(64) PRIMARY KEY NOT NULL,
	"room_id" varchar(6) NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "room_invite" ADD CONSTRAINT "room_invite_room_id_room_id_fk" FOREIGN KEY ("room_id") REFERENCES "public"."room"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "room_invite_room_id_idx" ON "room_invite" USING btree ("room_id");