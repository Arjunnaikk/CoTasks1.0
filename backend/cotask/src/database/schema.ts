import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text, primaryKey, uniqueIndex } from 'drizzle-orm/sqlite-core';
import { unstable_generateASSETSBinding } from 'wrangler';

export const user = sqliteTable("user", {
  user_id: integer('user_id',{mode : 'number'}).primaryKey({ autoIncrement : true }),
  name: text('name').notNull(), 
  address: text('address'),
  gmail: text('gmail').notNull().unique(),
  password: text('password'),
  phone: integer('phone'),
  last_active_at: text("last_active_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const list = sqliteTable("list", {
  list_id: integer('list_id',{mode : 'number'}).primaryKey({ autoIncrement : true }),
  name: text('name').notNull(), 
  user_id: integer("user_id").references(() => user.user_id, { onDelete : 'cascade' }),

});

export const task = sqliteTable("task", {
  task_id: integer('task_id', {mode : 'number'}).primaryKey({ autoIncrement:true}),
  title: text('title').notNull(),
  descrption: text('description').notNull(),
  status: text("status",{ enum: ["completed", "ongoing", "missed"] }).notNull().default("ongoing"),
  start_d: text().default(sql`(CURRENT_TIMESTAMP)`),
  end_d: integer( "end_d",{ mode: 'timestamp' }),
  priority: integer("priority").default(0),
  assigner_id: integer("assigner_id").references(() => user.user_id, { onDelete : 'cascade' }),
  list_id : integer("list_id").references(() => list.list_id, { onDelete : 'cascade' }),
  team_id : integer("team_id").references(() => team.team_id, { onDelete : 'cascade' }),
});

export const task_assigned = sqliteTable("task_assigned", {
  assigned_id: integer('assigned_id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  user_id: integer("user_id").references(() => user.user_id, { onDelete: 'cascade' }),
  task_id: integer("task_id").references(() => task.task_id, { onDelete : 'cascade' }),
  

});

export const team = sqliteTable("team", {
  team_id: integer('team_id', { mode: 'number' }).primaryKey({ autoIncrement: true }),  
  title: text('title').notNull(),
  create_d: text("create_d").default(sql`CURRENT_TIMESTAMP`)

});

export const user_team = sqliteTable("user_team", {
  team_id: integer('team_id').references(() =>  team.team_id, { onDelete: 'cascade' }),
  user_id: integer('user_id').references(() => user.user_id, { onDelete: 'cascade' }),
  role: text("role").default("member").notNull(),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.team_id, table.user_id] }), 
  };
});

export const feedback = sqliteTable("feedback", {
  feedback_id: integer('feedback_id', { mode: 'number' }).primaryKey({ autoIncrement: true }),  
  rating: integer('rating').notNull(),
  comment: text("comment"),
  user_id: integer("user_id").references(() => user.user_id, { onDelete: 'cascade' }),

});

export const team_message = sqliteTable("team_message", {
  message_id: integer('message_id', { mode: 'number' }).primaryKey({ autoIncrement: true }),
  team_id: integer("team_id").references(() => team.team_id, { onDelete: 'cascade' }),
  user_id: integer("user_id").references(() => user.user_id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  created_at: text("created_at").default(sql`(CURRENT_TIMESTAMP)`),
});

export const user_team_last_read = sqliteTable("user_team_last_read", {
  user_id: integer("user_id").references(() => user.user_id, { onDelete: 'cascade' }),
  team_id: integer("team_id").references(() => team.team_id, { onDelete: 'cascade' }),
  last_read_message_id: integer("last_read_message_id").notNull().default(0),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.user_id, table.team_id] }),
  };
});

export const task_subtask = sqliteTable("task_subtask", {
  subtask_id: integer("subtask_id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  task_id: integer("task_id").references(() => task.task_id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  is_completed: integer("is_completed", { mode: "boolean" }).notNull().default(false),
});

export const task_comment = sqliteTable("task_comment", {
  comment_id: integer("comment_id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  task_id: integer("task_id").references(() => task.task_id, { onDelete: 'cascade' }),
  user_id: integer("user_id").references(() => user.user_id, { onDelete: 'cascade' }),
  content: text("content").notNull(),
  created_at: text("created_at").notNull(),
});

export const team_message_reaction = sqliteTable("team_message_reaction", {
  reaction_id: integer("reaction_id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  message_id: integer("message_id").references(() => team_message.message_id, { onDelete: 'cascade' }),
  user_id: integer("user_id").references(() => user.user_id, { onDelete: 'cascade' }),
  emoji: text("emoji").notNull(),
}, (table) => {
  return {
    uniq_reaction: uniqueIndex("uniq_reaction").on(table.message_id, table.user_id, table.emoji)
  };
});

export const activity_log = sqliteTable("activity_log", {
  activity_id: integer("activity_id", { mode: "number" }).primaryKey({ autoIncrement: true }),
  team_id: integer("team_id").references(() => team.team_id, { onDelete: 'cascade' }),
  user_id: integer("user_id").references(() => user.user_id, { onDelete: 'cascade' }),
  action: text("action").notNull(),
  description: text("description").notNull(),
  created_at: text("created_at").notNull(),
});






