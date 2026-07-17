import { Hono } from 'hono';
import database from '../database';
import { eq } from 'drizzle-orm';
import { user, task, task_subtask, activity_log } from '../database/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env }>();

const fetchSubtasksSchema = z.object({
	task_id: z.number().int(),
});
const fetchSubtasksValidator = zValidator('json', fetchSubtasksSchema);

const createSubtaskSchema = z.object({
	task_id: z.number().int(),
	title: z.string().max(100),
	user_gmail: z.string().email().max(200).optional(),
});
const createSubtaskValidator = zValidator('json', createSubtaskSchema);

const toggleSubtaskSchema = z.object({
	subtask_id: z.number().int(),
	is_completed: z.boolean(),
	user_gmail: z.string().email().max(200).optional(),
});
const toggleSubtaskValidator = zValidator('json', toggleSubtaskSchema);

const deleteSubtaskSchema = z.object({
	subtask_id: z.number().int(),
});
const deleteSubtaskValidator = zValidator('json', deleteSubtaskSchema);

// Fetch subtasks for a task
app.post('/subtask/fetch', fetchSubtasksValidator, async (c) => {
	const db = database(c.env.DB);
	const { task_id } = await c.req.json() as any;

	try {
		const subtasks = await db.select().from(task_subtask).where(eq(task_subtask.task_id, task_id));
		return c.json({ subtasks });
	} catch (error) {
		console.error("Fetch subtasks error:", error);
		return c.json({ msg: "couldn't fetch subtasks" }, 500);
	}
});

// Create a subtask
app.post('/subtask/create', createSubtaskValidator, async (c) => {
	const db = database(c.env.DB);
	const { task_id, title, user_gmail } = await c.req.json() as any;

	try {
		const [newSubtask] = await db.insert(task_subtask).values({
			task_id,
			title,
			is_completed: false,
		}).returning();

		// Add activity log if task belongs to a team and user_gmail is provided
		const [subtaskTask] = await db.select({ title: task.title, team_id: task.team_id })
			.from(task)
			.where(eq(task.task_id, task_id));

		if (subtaskTask && subtaskTask.team_id && user_gmail) {
			const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
			if (reqUser) {
				const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
				await db.insert(activity_log).values({
					team_id: subtaskTask.team_id,
					user_id: reqUser.user_id,
					action: "subtask_created",
					description: `added subtask "${title}" to task "${subtaskTask.title}"`,
					created_at: timestamp,
				});
			}
		}

		return c.json({ subtask: newSubtask, msg: "subtask created" });
	} catch (error) {
		console.error("Create subtask error:", error);
		return c.json({ msg: "couldn't create subtask" }, 500);
	}
});

// Toggle subtask status
app.patch('/subtask/toggle', toggleSubtaskValidator, async (c) => {
	const db = database(c.env.DB);
	const { subtask_id, is_completed, user_gmail } = await c.req.json() as any;

	try {
		const [updated] = await db.update(task_subtask)
			.set({ is_completed })
			.where(eq(task_subtask.subtask_id, subtask_id))
			.returning();

		// Add activity log if task belongs to a team and user_gmail is provided
		const [subtaskTask] = await db.select({ title: task.title, team_id: task.team_id, subtask_title: task_subtask.title })
			.from(task_subtask)
			.innerJoin(task, eq(task_subtask.task_id, task.task_id))
			.where(eq(task_subtask.subtask_id, subtask_id));

		if (subtaskTask && subtaskTask.team_id && user_gmail) {
			const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
			if (reqUser) {
				const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
				await db.insert(activity_log).values({
					team_id: subtaskTask.team_id,
					user_id: reqUser.user_id,
					action: "subtask_toggled",
					description: `${is_completed ? 'completed' : 'uncompleted'} subtask "${subtaskTask.subtask_title}" on task "${subtaskTask.title}"`,
					created_at: timestamp,
				});
			}
		}

		return c.json({ subtask: updated, msg: "subtask toggled" });
	} catch (error) {
		console.error("Toggle subtask error:", error);
		return c.json({ msg: "couldn't toggle subtask" }, 500);
	}
});

// Delete a subtask
app.delete('/subtask/delete', deleteSubtaskValidator, async (c) => {
	const db = database(c.env.DB);
	const { subtask_id } = await c.req.json() as any;

	try {
		await db.delete(task_subtask).where(eq(task_subtask.subtask_id, subtask_id));
		return c.json({ msg: "subtask deleted", subtask_id });
	} catch (error) {
		console.error("Delete subtask error:", error);
		return c.json({ msg: "couldn't delete subtask" }, 500);
	}
});

export default app;
