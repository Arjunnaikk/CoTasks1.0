import { Hono } from 'hono';
import database from '../database';
import { eq } from 'drizzle-orm';
import { user, task_assigned } from '../database/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env }>();

const fetchTaskAssignedSchema = z.object({
	team_name: z.string().max(50),
	task_id: z.number().int(),
});
const fetchTaskAssignedValidator = zValidator('json', fetchTaskAssignedSchema);

// Fetch assigned users for a team task
app.post('/taskAssigned/fetch', fetchTaskAssignedValidator, async (c) => {
	const db = database(c.env.DB);
	const { task_id } = await c.req.json() as any;

	try {
		// Join task_assigned with user table to get names and IDs
		const assignedUsers = await db.select({
			user_id: user.user_id,
			assigner_name: user.name,
		})
		.from(task_assigned)
		.innerJoin(user, eq(task_assigned.user_id, user.user_id))
		.where(eq(task_assigned.task_id, task_id));

		return c.json({ tasksWithAssignedImages: assignedUsers });
	} catch (error) {
		console.error("Fetch task assigned error:", error);
		return c.json({ msg: "couldn't fetch assigned users" }, 500);
	}
});

export default app;
