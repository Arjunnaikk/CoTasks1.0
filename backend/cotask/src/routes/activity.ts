import { Hono } from 'hono';
import database from '../database';
import { eq, desc } from 'drizzle-orm';
import { user, team, activity_log } from '../database/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env }>();

const fetchActivitySchema = z.object({
	team_name: z.string().max(200),
});
const fetchActivityValidator = zValidator('json', fetchActivitySchema);

// Fetch recent activity logs for a team
app.post('/team/activity/fetch', fetchActivityValidator, async (c) => {
	const db = database(c.env.DB);
	const { team_name } = await c.req.json() as any;

	try {
		const decodedTeamName = decodeURIComponent(team_name);
		const [reqTeam] = await db.select({ team_id: team.team_id }).from(team).where(eq(team.title, decodedTeamName));
		if (!reqTeam) {
			return c.json({ msg: "Team not found" }, 404);
		}

		// Query activity logs for the team, joining the user table to get the performer details
		const logs = await db.select({
			activity_id: activity_log.activity_id,
			action: activity_log.action,
			description: activity_log.description,
			created_at: activity_log.created_at,
			user_id: user.user_id,
			user_name: user.name,
			user_gmail: user.gmail,
		})
		.from(activity_log)
		.innerJoin(user, eq(activity_log.user_id, user.user_id))
		.where(eq(activity_log.team_id, reqTeam.team_id))
		.orderBy(desc(activity_log.created_at))
		.limit(100);

		return c.json({ logs });
	} catch (error) {
		console.error("Fetch team activity error:", error);
		return c.json({ msg: "couldn't fetch activity logs" }, 500);
	}
});

export default app;
