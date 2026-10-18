import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const places = sqliteTable("places", {
  slug: text("slug").primaryKey(),
  content: text("content").notNull(),
  revision: integer("revision").notNull().default(1),
});
export const owners = sqliteTable("owners", {
  role: text("role").primaryKey(),
  userId: text("user_id").notNull(),
});
