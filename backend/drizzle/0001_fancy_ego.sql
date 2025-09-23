ALTER TABLE "tree_elements" DISABLE ROW LEVEL SECURITY;--> statement-breakpoint
DROP TABLE "tree_elements" CASCADE;--> statement-breakpoint
ALTER TABLE "players" ALTER COLUMN "name" SET DATA TYPE varchar(100);--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "user_id" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "players" ADD COLUMN "inventory" json DEFAULT '{}'::json;