import { Hono } from 'hono';
import database from '../database';
import { eq, and, desc, sql, inArray } from 'drizzle-orm';
import { user, team, user_team, team_message, user_team_last_read, team_message_reaction } from '../database/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env }>();

const sendMessageSchema = z.object({
	team_name: z.string().max(50),
	user_gmail: z.string().email().max(200),
	content: z.string().max(1000),
});
const sendMessageValidator = zValidator('json', sendMessageSchema);

const fetchMessagesSchema = z.object({
	team_name: z.string().max(50),
});
const fetchMessagesValidator = zValidator('json', fetchMessagesSchema);

const deleteMessageSchema = z.object({
	message_id: z.number().int(),
	user_gmail: z.string().email().max(200),
});
const deleteMessageValidator = zValidator('json', deleteMessageSchema);

const markReadSchema = z.object({
	team_name: z.string().max(50),
	user_gmail: z.string().email().max(200),
});
const markReadValidator = zValidator('json', markReadSchema);

const unreadCountsSchema = z.object({
	user_gmail: z.string().email().max(200),
});
const unreadCountsValidator = zValidator('json', unreadCountsSchema);

// Send message to team chat
app.post('/team/message/send', sendMessageValidator, async (c) => {
	const db = database(c.env.DB);
	const { team_name, user_gmail, content } = await c.req.json() as any;

	try {
		// Get user ID
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Get team ID
		const decodedTeamName = decodeURIComponent(team_name);
		const [reqTeam] = await db.select({ team_id: team.team_id }).from(team).where(eq(team.title, decodedTeamName));
		if (!reqTeam) {
			return c.json({ msg: "Team not found" }, 404);
		}

		// Check if user belongs to team
		const [isMember] = await db.select().from(user_team).where(
			and(
				eq(user_team.team_id, reqTeam.team_id),
				eq(user_team.user_id, reqUser.user_id)
			)
		);
		if (!isMember) {
			return c.json({ msg: "Unauthorized" }, 403);
		}

		// Insert message
		const [newMessage] = await db.insert(team_message).values({
			team_id: reqTeam.team_id,
			user_id: reqUser.user_id,
			content: content,
		}).returning();

		// Auto-update sender's own last read message
		await db.insert(user_team_last_read).values({
			user_id: reqUser.user_id,
			team_id: reqTeam.team_id,
			last_read_message_id: newMessage.message_id,
		}).onConflictDoUpdate({
			target: [user_team_last_read.user_id, user_team_last_read.team_id],
			set: { last_read_message_id: newMessage.message_id }
		});

		return c.json({
			message_id: newMessage.message_id,
			content: newMessage.content,
			created_at: newMessage.created_at,
			user_id: reqUser.user_id,
		});
	} catch (error) {
		console.error("Send team message error:", error);
		return c.json({ msg: "couldn't send message" }, 500);
	}
});

// Fetch all messages for a team
app.post('/team/message/fetch', fetchMessagesValidator, async (c) => {
	const db = database(c.env.DB);
	const { team_name } = await c.req.json() as any;

	try {
		// Get team ID
		const decodedTeamName = decodeURIComponent(team_name);
		const [reqTeam] = await db.select({ team_id: team.team_id }).from(team).where(eq(team.title, decodedTeamName));
		if (!reqTeam) {
			return c.json({ msg: "Team not found" }, 404);
		}

		// Retrieve all messages for the team, joining the user table to get sender details
		const messages = await db.select({
			message_id: team_message.message_id,
			content: team_message.content,
			created_at: team_message.created_at,
			user_id: user.user_id,
			sender_name: user.name,
			sender_gmail: user.gmail,
		})
		.from(team_message)
		.innerJoin(user, eq(team_message.user_id, user.user_id))
		.where(eq(team_message.team_id, reqTeam.team_id))
		.orderBy(team_message.created_at);

		// Retrieve reactions for these messages
		const messageIds = messages.map(m => m.message_id);
		let reactions: any[] = [];
		if (messageIds.length > 0) {
			reactions = await db.select({
				reaction_id: team_message_reaction.reaction_id,
				message_id: team_message_reaction.message_id,
				user_id: team_message_reaction.user_id,
				emoji: team_message_reaction.emoji,
				sender_name: user.name,
				sender_gmail: user.gmail,
			})
			.from(team_message_reaction)
			.innerJoin(user, eq(team_message_reaction.user_id, user.user_id))
			.where(inArray(team_message_reaction.message_id, messageIds));
		}

		// Group reactions by message_id
		const reactionsMap: Record<number, any[]> = {};
		for (const r of reactions) {
			if (!reactionsMap[r.message_id]) {
				reactionsMap[r.message_id] = [];
			}
			reactionsMap[r.message_id].push({
				reaction_id: r.reaction_id,
				user_id: r.user_id,
				emoji: r.emoji,
				sender_name: r.sender_name,
				sender_gmail: r.sender_gmail,
			});
		}

		const messagesWithReactions = messages.map(m => ({
			...m,
			reactions: reactionsMap[m.message_id] || [],
		}));

		return c.json({ messages: messagesWithReactions });
	} catch (error) {
		console.error("Fetch team messages error:", error);
		return c.json({ msg: "couldn't fetch messages" }, 500);
	}
});

// Delete a message
app.delete('/team/message/delete', deleteMessageValidator, async (c) => {
	const db = database(c.env.DB);
	const { message_id, user_gmail } = await c.req.json() as any;

	try {
		// Get user ID
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Get message
		const [reqMsg] = await db.select().from(team_message).where(eq(team_message.message_id, message_id));
		if (!reqMsg) {
			return c.json({ msg: "Message not found" }, 404);
		}

		// Verify user is author
		if (reqMsg.user_id !== reqUser.user_id) {
			return c.json({ msg: "Unauthorized" }, 403);
		}

		// Delete message
		await db.delete(team_message).where(eq(team_message.message_id, message_id));

		return c.json({ msg: "message deleted", message_id });
	} catch (error) {
		console.error("Delete message error:", error);
		return c.json({ msg: "couldn't delete message" }, 500);
	}
});

// Mark messages as read
app.post('/team/message/read', markReadValidator, async (c) => {
	const db = database(c.env.DB);
	const { team_name, user_gmail } = await c.req.json() as any;

	try {
		// Get user ID
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Get team ID
		const decodedTeamName = decodeURIComponent(team_name);
		const [reqTeam] = await db.select({ team_id: team.team_id }).from(team).where(eq(team.title, decodedTeamName));
		if (!reqTeam) {
			return c.json({ msg: "Team not found" }, 404);
		}

		// Find latest message ID
		const [latestMsg] = await db.select({ 
			message_id: team_message.message_id 
		})
		.from(team_message)
		.where(eq(team_message.team_id, reqTeam.team_id))
		.orderBy(desc(team_message.message_id))
		.limit(1);

		const lastReadId = latestMsg ? latestMsg.message_id : 0;

		// Upsert user_team_last_read
		await db.insert(user_team_last_read).values({
			user_id: reqUser.user_id,
			team_id: reqTeam.team_id,
			last_read_message_id: lastReadId,
		}).onConflictDoUpdate({
			target: [user_team_last_read.user_id, user_team_last_read.team_id],
			set: { last_read_message_id: lastReadId }
		});

		return c.json({ msg: "messages marked as read", team_name, last_read_message_id: lastReadId });
	} catch (error) {
		console.error("Mark messages read error:", error);
		return c.json({ msg: "couldn't mark messages as read" }, 500);
	}
});

// Fetch unread counts for all teams the user belongs to
app.post('/team/unread_counts', unreadCountsValidator, async (c) => {
	const db = database(c.env.DB);
	const { user_gmail } = await c.req.json() as any;

	try {
		// Get user ID
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Query all teams of the user
		const userTeams = await db.select({
			team_id: team.team_id,
			team_title: team.title,
		})
		.from(user_team)
		.innerJoin(team, eq(user_team.team_id, team.team_id))
		.where(eq(user_team.user_id, reqUser.user_id));

		const unreadCounts: Record<string, number> = {};

		for (const t of userTeams) {
			// Find last read message ID for this team
			const [lastRead] = await db.select({
				last_read_message_id: user_team_last_read.last_read_message_id
			})
			.from(user_team_last_read)
			.where(
				and(
					eq(user_team_last_read.user_id, reqUser.user_id),
					eq(user_team_last_read.team_id, t.team_id)
				)
			);

			const lastReadId = lastRead ? lastRead.last_read_message_id : 0;

			// Count messages since lastReadId that were NOT sent by the current user
			const [countResult] = await db.select({
				count: sql<number>`count(*)`
			})
			.from(team_message)
			.where(
				and(
					eq(team_message.team_id, t.team_id),
					sql`${team_message.message_id} > ${lastReadId}`,
					sql`${team_message.user_id} != ${reqUser.user_id}`
				)
			);

			unreadCounts[t.team_title] = countResult ? countResult.count : 0;
		}

		return c.json({ unreadCounts });
	} catch (error) {
		console.error("Fetch unread counts error:", error);
		return c.json({ msg: "couldn't fetch unread counts" }, 500);
	}
});

export default app;
