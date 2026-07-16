import { Hono } from 'hono';
import database from '../database';
import { eq, and, inArray } from 'drizzle-orm';
import { user, team, user_team, task, task_assigned } from '../database/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env }>();

const fetchTeamSchema = z.object({
	user_gmail: z.string().email().max(200),
});
const fetchTeamValidator = zValidator('json', fetchTeamSchema);

const createTeamLocalSchema = z.object({
	title: z.string().max(50),
	user_array: z.array(z.string().email().max(200)),
});
const createTeamValidator = zValidator('json', createTeamLocalSchema);

const deleteTeamSchema = z.object({
	user_gmail: z.string().email().max(200),
	team_name: z.string().max(50),
});
const deleteTeamValidator = zValidator('json', deleteTeamSchema);

// Fetch teams for a user
app.post('/team/fetch', fetchTeamValidator, async (c) => {
	const db = database(c.env.DB);
	const { user_gmail } = await c.req.json() as any;

	try {
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Find teams the user belongs to
		const userTeamsList = await db.select({
			team_id: team.team_id,
			team_title: team.title,
		})
		.from(user_team)
		.innerJoin(team, eq(user_team.team_id, team.team_id))
		.where(eq(user_team.user_id, reqUser.user_id));

		return c.json({ teamTitle: userTeamsList });
	} catch (error) {
		console.error("Fetch team error:", error);
		return c.json({ msg: "couldn't fetch teams" }, 500);
	}
});

// Create a team
app.post('/team/create', createTeamValidator, async (c) => {
	const db = database(c.env.DB);
	const { title, user_array } = await c.req.json() as any;

	try {
		// Create the team
		const [newTeam] = await db.insert(team).values({ title }).returning();

		// Add users to team
		const membersAdded = [];
		for (const email of user_array) {
			const [reqUser] = await db.select({ user_id: user.user_id, name: user.name }).from(user).where(eq(user.gmail, email));
			if (reqUser) {
				await db.insert(user_team).values({
					team_id: newTeam.team_id,
					user_id: reqUser.user_id,
				}).onConflictDoNothing();
				membersAdded.push(reqUser.name);
			}
		}

		return c.json({
			team_id: newTeam.team_id,
			title: newTeam.title,
			members: membersAdded,
			msg: 'team created',
		});
	} catch (error) {
		console.error("Create team error:", error);
		return c.json({ msg: "couldn't create team" }, 500);
	}
});

// Delete a team
app.delete('/team/delete', deleteTeamValidator, async (c) => {
	const db = database(c.env.DB);
	const { user_gmail, team_name } = await c.req.json() as any;

	try {
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Find the team by title
		const decodedTeamName = decodeURIComponent(team_name);
		const [reqTeam] = await db.select().from(team).where(eq(team.title, decodedTeamName));
		if (!reqTeam) {
			return c.json({ msg: "Team not found" }, 404);
		}

		// Verify user is member of the team to delete it
		const [isMember] = await db.select().from(user_team).where(
			and(
				eq(user_team.team_id, reqTeam.team_id),
				eq(user_team.user_id, reqUser.user_id)
			)
		);
		if (!isMember) {
			return c.json({ msg: "Unauthorized" }, 403);
		}

		// Delete references from user_team
		await db.delete(user_team).where(eq(user_team.team_id, reqTeam.team_id));

		// Find all tasks belonging to this team
		const teamTasks = await db.select({ task_id: task.task_id }).from(task).where(eq(task.team_id, reqTeam.team_id));
		const taskIds = teamTasks.map(t => t.task_id);

		if (taskIds.length > 0) {
			// Delete task assignments
			await db.delete(task_assigned).where(inArray(task_assigned.task_id, taskIds));
			// Delete team tasks
			await db.delete(task).where(eq(task.team_id, reqTeam.team_id));
		}

		// Delete the team
		await db.delete(team).where(eq(team.team_id, reqTeam.team_id));

		return c.json({ msg: "team deleted", team_title: team_name });
	} catch (error) {
		console.error("Delete team error:", error);
		return c.json({ msg: "couldn't delete team" }, 500);
	}
});

const fetchTeamMembersSchema = z.object({
	team_name: z.string().max(50),
});
const fetchTeamMembersValidator = zValidator('json', fetchTeamMembersSchema);

app.post('/team/members', fetchTeamMembersValidator, async (c) => {
	const db = database(c.env.DB);
	const { team_name } = await c.req.json() as any;

	try {
		const decodedTeamName = decodeURIComponent(team_name);
		const [reqTeam] = await db.select({ team_id: team.team_id }).from(team).where(eq(team.title, decodedTeamName));
		if (!reqTeam) {
			return c.json({ msg: "Team not found" }, 404);
		}

		const members = await db.select({
			user_id: user.user_id,
			name: user.name,
			gmail: user.gmail,
		})
		.from(user_team)
		.innerJoin(user, eq(user_team.user_id, user.user_id))
		.where(eq(user_team.team_id, reqTeam.team_id));

		return c.json({ members });
	} catch (error) {
		console.error("Fetch team members error:", error);
		return c.json({ msg: "couldn't fetch team members" }, 500);
	}
});

export default app;
