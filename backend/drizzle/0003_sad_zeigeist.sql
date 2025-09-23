ALTER TABLE "players" DROP COLUMN "user_id";--> statement-breakpoint
ALTER TABLE "players" ADD CONSTRAINT "players_session_id_unique" UNIQUE("session_id");