ALTER TABLE "players" ALTER COLUMN "user_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "session_id" varchar(64);--> statement-breakpoint
UPDATE "players" SET "session_id" = 'temp_' || "id"::text WHERE "session_id" IS NULL;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "session_id" SET NOT NULL;