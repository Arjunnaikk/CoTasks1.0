import { Hono } from 'hono';
import database from '../database';
import { eq, and, asc, desc, sql } from 'drizzle-orm';
import { user, task_comment, task, activity_log } from '../database/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env }>();

const fetchCommentsSchema = z.object({
	task_id: z.number().int(),
});
const fetchCommentsValidator = zValidator('json', fetchCommentsSchema);

const createCommentSchema = z.object({
	task_id: z.number().int(),
	user_gmail: z.string().email().max(200),
	content: z.string().max(1000),
});
const createCommentValidator = zValidator('json', createCommentSchema);

const deleteCommentSchema = z.object({
	comment_id: z.number().int(),
	user_gmail: z.string().email().max(200),
});
const deleteCommentValidator = zValidator('json', deleteCommentSchema);

// Fetch comments for a task
app.post('/comment/fetch', fetchCommentsValidator, async (c) => {
	const db = database(c.env.DB);
	const { task_id } = await c.req.json() as any;

	try {
		const comments = await db.select({
			comment_id: task_comment.comment_id,
			task_id: task_comment.task_id,
			content: task_comment.content,
			created_at: task_comment.created_at,
			user_id: user.user_id,
			sender_name: user.name,
			sender_gmail: user.gmail,
		})
		.from(task_comment)
		.innerJoin(user, eq(task_comment.user_id, user.user_id))
		.where(eq(task_comment.task_id, task_id))
		.orderBy(asc(task_comment.comment_id));

		return c.json({ comments });
	} catch (error) {
		console.error("Fetch comments error:", error);
		return c.json({ msg: "couldn't fetch comments" }, 500);
	}
});

// Create a comment on a task
app.post('/comment/create', createCommentValidator, async (c) => {
	const db = database(c.env.DB);
	const { task_id, user_gmail, content } = await c.req.json() as any;

	try {
		// Get user ID
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);

		const [newComment] = await db.insert(task_comment).values({
			task_id,
			user_id: reqUser.user_id,
			content,
			created_at: timestamp,
		}).returning();

		// Add activity log if task belongs to a team
		const [commentedTask] = await db.select({ title: task.title, team_id: task.team_id })
			.from(task)
			.where(eq(task.task_id, task_id));

		if (commentedTask && commentedTask.team_id) {
			await db.insert(activity_log).values({
				team_id: commentedTask.team_id,
				user_id: reqUser.user_id,
				action: "comment_created",
				description: `commented on task "${commentedTask.title}"`,
				created_at: timestamp,
			});
		}

		return c.json({ comment: newComment, msg: "comment created" });
	} catch (error) {
		console.error("Create comment error:", error);
		return c.json({ msg: "couldn't create comment" }, 500);
	}
});

// Delete a comment
app.delete('/comment/delete', deleteCommentValidator, async (c) => {
	const db = database(c.env.DB);
	const { comment_id, user_gmail } = await c.req.json() as any;

	try {
		// Get user ID
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Get comment
		const [reqComment] = await db.select().from(task_comment).where(eq(task_comment.comment_id, comment_id));
		if (!reqComment) {
			return c.json({ msg: "Comment not found" }, 404);
		}

		// Verify user is author
		if (reqComment.user_id !== reqUser.user_id) {
			return c.json({ msg: "Unauthorized" }, 403);
		}

		// Delete comment
		await db.delete(task_comment).where(eq(task_comment.comment_id, comment_id));

		return c.json({ msg: "comment deleted", comment_id });
	} catch (error) {
		console.error("Delete comment error:", error);
		return c.json({ msg: "couldn't delete comment" }, 500);
	}
});

export default app;
