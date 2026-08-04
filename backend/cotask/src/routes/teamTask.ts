import { Hono } from 'hono';
import database from '../database';
import { eq, and, or, inArray, lt, isNotNull } from 'drizzle-orm';
import { user, team, task, task_assigned, activity_log } from '../database/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env }>();

const autoUpdateOverdueTasks = async (db: any) => {
	const now = new Date();
	await db.update(task)
		.set({ status: 'missed' })
		.where(
			and(
				inArray(task.status, ['backlog', 'in_progress', 'ongoing', 'blocked', 'in_review']),
				isNotNull(task.end_d),
				lt(task.end_d, now)
			)
		);
};

const fetchTeamTaskSchema = z.object({
	user_gmail: z.string().email().max(200),
	team_name: z.string().max(50),
});
const fetchTeamTaskValidator = zValidator('json', fetchTeamTaskSchema);

const createTeamTaskSchema = z.object({
	title: z.string().max(50),
	description: z.string().max(300),
	status: z.string().max(15).optional(),
	end_d: z.string().max(40).nullable().optional(),
	priority: z.number().int().max(5).optional(),
	user_gmail: z.string().max(200).email(),
	team_name: z.string().max(50),
	user_array: z.array(z.string().max(200).email()),
});
const createTeamTaskValidator = zValidator('json', createTeamTaskSchema);

const deleteTeamTaskSchema = z.object({
	task_id: z.number().int(),
	team_name: z.string().max(50),
});
const deleteTeamTaskValidator = zValidator('json', deleteTeamTaskSchema);

// Fetch all tasks for a team
app.post('/teamTask/fetch', fetchTeamTaskValidator, async (c) => {
	const db = database(c.env.DB);
	const { team_name } = await c.req.json() as any;

	try {
		await autoUpdateOverdueTasks(db);
		// Find the team
		const decodedTeamName = decodeURIComponent(team_name);
		const [reqTeam] = await db.select().from(team).where(eq(team.title, decodedTeamName));
		if (!reqTeam) {
			return c.json([]);
		}

		// Fetch tasks matching the team_id
		const tasks = await db.select().from(task).where(eq(task.team_id, reqTeam.team_id));

		return c.json(tasks);
	} catch (error) {
		console.error("Fetch team task error:", error);
		return c.json({ msg: "couldn't fetch team tasks" }, 500);
	}
});

// Create a task for a team
app.post('/teamTask/create', createTeamTaskValidator, async (c) => {
	const db = database(c.env.DB);
	const { title, description, status, end_d, priority, user_gmail, team_name, user_array } = await c.req.json() as any;

	try {
		// Find the team
		const decodedTeamName = decodeURIComponent(team_name);
		const [reqTeam] = await db.select().from(team).where(eq(team.title, decodedTeamName));
		if (!reqTeam) {
			return c.json({ msg: "Team not found" }, 404);
		}

		// Find assigner user
		const [assigner] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!assigner) {
			return c.json({ msg: "Assigner user not found" }, 404);
		}

		const validStatuses = ["backlog", "in_progress", "ongoing", "in_review", "blocked", "completed", "missed"];
		const taskStatus = validStatuses.includes(status) ? status : 'backlog';

		// Insert task
		const [newTask] = await db.insert(task).values({
			title,
			descrption: description,
			status: taskStatus,
			end_d: end_d ? new Date(end_d) : null,
			priority: priority ?? 0,
			assigner_id: assigner.user_id,
			team_id: reqTeam.team_id,
		}).returning();

		const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
		await db.insert(activity_log).values({
			team_id: reqTeam.team_id,
			user_id: assigner.user_id,
			action: "task_created",
			description: `created task "${title}"`,
			created_at: timestamp,
		});

		// Add assignments for assigned users
		for (const email of user_array) {
			const [assignedUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, email));
			if (assignedUser) {
				await db.insert(task_assigned).values({
					task_id: newTask.task_id,
					user_id: assignedUser.user_id,
				});
			}
		}

		return c.json({ ...newTask, msg: 'team task created' });
	} catch (error) {
		console.error("Create team task error:", error);
		return c.json({ msg: "couldn't create team task" }, 500);
	}
});

// Delete a team task
app.delete('/teamTask/delete', deleteTeamTaskValidator, async (c) => {
	const db = database(c.env.DB);
	const { task_id, team_name } = await c.req.json() as any;

	try {
		// Verify team exists
		const decodedTeamName = decodeURIComponent(team_name);
		const [reqTeam] = await db.select({ team_id: team.team_id }).from(team).where(eq(team.title, decodedTeamName));
		if (!reqTeam) {
			return c.json({ msg: "Team not found" }, 404);
		}

		// Delete associations first
		await db.delete(task_assigned).where(eq(task_assigned.task_id, task_id));

		// Delete the task itself
		const result = await db.delete(task).where(
			and(
				eq(task.task_id, task_id),
				eq(task.team_id, reqTeam.team_id)
			)
		).returning();

		if (result.length === 0) {
			return c.json({ msg: "Task not found or not deleted" }, 404);
		}

		return c.json({ msg: "team task deleted", deletedTask: result[0] });
	} catch (error) {
		console.error("Delete team task error:", error);
		return c.json({ msg: "couldn't delete team task" }, 500);
	}
});

// Fetch all due/overdue team tasks for a user
app.post('/teamTask/due', zValidator('json', z.object({ user_gmail: z.string().email() })), async (c) => {
	const db = database(c.env.DB);
	const { user_gmail } = await c.req.json() as any;

	try {
		await autoUpdateOverdueTasks(db);
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Fetch task IDs assigned to the user
		const assignedTaskIds = await db.select({ task_id: task_assigned.task_id })
			.from(task_assigned)
			.where(eq(task_assigned.user_id, reqUser.user_id));
		const taskIds = assignedTaskIds.map(t => t.task_id).filter((id): id is number => id !== null);

		// Build matching conditions: either user is assigner OR task is in the assigned list
		const taskConditions = [
			eq(task.assigner_id, reqUser.user_id)
		];
		if (taskIds.length > 0) {
			taskConditions.push(inArray(task.task_id, taskIds));
		}

		// Fetch all team tasks matching conditions that are NOT completed and belong to a team
		const tasks = await db.select().from(task).where(
			and(
				or(...taskConditions),
				inArray(task.status, ['backlog', 'in_progress', 'ongoing', 'blocked', 'in_review']),
				isNotNull(task.team_id)
			)
		);

		return c.json({ tasks });
	} catch (error) {
		console.error("Fetch due team tasks error:", error);
		return c.json({ msg: "couldn't fetch due team tasks" }, 500);
	}
});

export default app;
