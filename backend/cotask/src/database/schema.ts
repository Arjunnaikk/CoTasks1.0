import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text , primaryKey} from 'drizzle-orm/sqlite-core';
import { unstable_generateASSETSBinding } from 'wrangler';

export const user = sqliteTable("user", {
  user_id: integer('user_id',{mode : 'number'}).primaryKey({ autoIncrement : true }),
  name: text('name').notNull(), 
  address: text('address'),
  gmail: text('gmail').notNull().unique(),
  password: text('password'),
  phone: integer('phone'),
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
  team_id: integer('team_id').references(() =>  team.team_id),
  user_id: integer('user_id').references(() => user.user_id),
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

