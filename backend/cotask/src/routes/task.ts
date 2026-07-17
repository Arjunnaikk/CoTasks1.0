import { Hono } from 'hono';
import database from '../database';
import { and, eq, or, inArray } from 'drizzle-orm';
import { user, list, task, task_assigned, activity_log } from '../database/schema';
import { createTaskValidator } from '../validators';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env }>();

const fetchTaskSchema = z.object({
	user_gmail: z.string().email().max(200),
	list_name: z.string().max(50),
});
const fetchTaskValidator = zValidator('json', fetchTaskSchema);

const updateTaskStatusSchema = z.object({
	user_gmail: z.string().email().max(200),
	task_name: z.string().max(100),
	status: z.enum(["completed", "ongoing", "missed"]),
});
const updateTaskStatusValidator = zValidator('json', updateTaskStatusSchema);

const deleteTaskSchema = z.object({
	user_gmail: z.string().email().max(200),
	task_id: z.number().int(),
});
const deleteTaskValidator = zValidator('json', deleteTaskSchema);

// Fetch tasks for a list
app.post('/myTask/fetch', fetchTaskValidator, async (c) => {
	const db = database(c.env.DB);
	const { user_gmail, list_name } = await c.req.json() as any;

	try {
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		const [reqList] = await db.select({ list_id: list.list_id }).from(list).where(
			and(
				eq(list.user_id, reqUser.user_id),
				eq(list.name, list_name)
			)
		);
		if (!reqList) {
			return c.json({ newTask: [] });
		}

		const tasks = await db.select().from(task).where(eq(task.list_id, reqList.list_id));

		return c.json({ newTask: tasks });
	} catch (error) {
		console.error("Fetch task error:", error);
		return c.json({ msg: "couldn't fetch tasks" }, 500);
	}
});

// Create a task
app.post('/myTask/create', createTaskValidator, async (c) => {
	const db = database(c.env.DB);
	const { title, description, status, end_d, priority, user_gmail, list_name } = await c.req.json() as any;

	try {
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		let [reqList] = await db.select({ list_id: list.list_id }).from(list).where(
			and(
				eq(list.user_id, reqUser.user_id),
				eq(list.name, list_name)
			)
		);

		// If list doesn't exist, create it dynamically
		if (!reqList) {
			[reqList] = await db.insert(list).values({
				name: list_name,
				user_id: reqUser.user_id,
			}).returning({ list_id: list.list_id });
		}

		const taskStatus = (status === 'completed' || status === 'ongoing' || status === 'missed') ? status : 'ongoing';

		const [newTask] = await db.insert(task).values({
			title,
			descrption: description,
			status: taskStatus,
			end_d: end_d ? new Date(end_d) : null,
			priority: priority ?? 0,
			assigner_id: reqUser.user_id,
			list_id: reqList.list_id,
		}).returning();

		return c.json({ ...newTask, msg: 'task created' });
	} catch (error) {
		console.error("Create task error:", error);
		return c.json({ msg: "couldn't create task" }, 500);
	}
});

// Update task status (for personal and team tasks)
app.patch('/myTask/update', updateTaskStatusValidator, async (c) => {
	const db = database(c.env.DB);
	const { user_gmail, task_name, status } = await c.req.json() as any;

	try {
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Find tasks with the given title where user is either the assigner OR assigned
		const assignedTaskIds = await db.select({ task_id: task_assigned.task_id })
			.from(task_assigned)
			.where(eq(task_assigned.user_id, reqUser.user_id));

		const taskIds = assignedTaskIds.map(t => t.task_id).filter((id): id is number => id !== null);

		const taskConditions = [
			eq(task.assigner_id, reqUser.user_id)
		];
		if (taskIds.length > 0) {
			taskConditions.push(inArray(task.task_id, taskIds));
		}

		const matchingTasks = await db.select({ task_id: task.task_id })
			.from(task)
			.where(
				and(
					eq(task.title, task_name),
					or(...taskConditions)
				)
			);

		if (matchingTasks.length === 0) {
			return c.json({ msg: "Task not found" }, 404);
		}

		// Update the status of the first matching task
		const [updatedTask] = await db.update(task)
			.set({ status })
			.where(eq(task.task_id, matchingTasks[0].task_id))
			.returning();

		if (updatedTask && updatedTask.team_id) {
			const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
			await db.insert(activity_log).values({
				team_id: updatedTask.team_id,
				user_id: reqUser.user_id,
				action: "task_status_updated",
				description: `updated task "${updatedTask.title}" status to "${status}"`,
				created_at: timestamp,
			});
		}

		return c.json({ ...updatedTask, msg: 'task status updated' });
	} catch (error) {
		console.error("Update task status error:", error);
		return c.json({ msg: "couldn't update task status" }, 500);
	}
});

// Delete a task
app.delete('/myTask/delete', deleteTaskValidator, async (c) => {
	const db = database(c.env.DB);
	const { user_gmail, task_id } = await c.req.json() as any;

	try {
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		const result = await db.delete(task).where(
			and(
				eq(task.task_id, task_id),
				eq(task.assigner_id, reqUser.user_id)
			)
		).returning();

		if (result.length === 0) {
			return c.json({ msg: "Task not found or not deleted" }, 404);
		}

		return c.json({ msg: "task deleted", deletedTask: result[0] });
	} catch (error) {
		console.error("Delete task error:", error);
		return c.json({ msg: "couldn't delete task" }, 500);
	}
});

export default app;
