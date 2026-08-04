import { Hono } from 'hono';
import database from '../database';
import { eq, and, isNotNull, lt, gte, inArray } from 'drizzle-orm';
import { user, task, user_fcm_token } from '../database/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env }>();

// Schema for registering an FCM token
const registerFCMTokenSchema = z.object({
	user_gmail: z.string().email().max(200),
	token: z.string().min(10).max(500),
});
const registerFCMTokenValidator = zValidator('json', registerFCMTokenSchema);

// Endpoint: Register FCM token
app.post('/user/fcm-token', registerFCMTokenValidator, async (c) => {
	const db = database(c.env.DB);
	const { user_gmail, token } = await c.req.json() as any;

	try {
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Insert or ignore if it already exists
		const [existingToken] = await db.select()
			.from(user_fcm_token)
			.where(
				and(
					eq(user_fcm_token.user_id, reqUser.user_id),
					eq(user_fcm_token.token, token)
				)
			);

		if (!existingToken) {
			await db.insert(user_fcm_token).values({
				user_id: reqUser.user_id,
				token: token,
			});
		}

		return c.json({ msg: "FCM token registered successfully" });
	} catch (error) {
		console.error("FCM registration error:", error);
		return c.json({ msg: "Failed to register FCM token" }, 500);
	}
});

// Helper function to check due/missed tasks and send alerts
export const checkAndSendNotifications = async (db: any, env: any) => {
	const now = new Date();
	const next24Hours = new Date(now.getTime() + 24 * 60 * 60 * 1000);

	const notificationsSent: any[] = [];

	// 1. Fetch tasks within due date (uncompleted AND end_d is in the next 24 hours)
	const upcomingTasks = await db.select().from(task).where(
		and(
			inArray(task.status, ['backlog', 'in_progress', 'ongoing', 'blocked', 'in_review']),
			isNotNull(task.end_d),
			lt(task.end_d, next24Hours),
			gte(task.end_d, now)
		)
	);

	// 2. Fetch newly missed tasks (uncompleted AND end_d is past)
	// (Note: we also mark them as 'missed' status)
	const overdueTasks = await db.select().from(task).where(
		and(
			inArray(task.status, ['backlog', 'in_progress', 'ongoing', 'blocked', 'in_review']),
			isNotNull(task.end_d),
			lt(task.end_d, now)
		)
	);

	// Automatically update newly overdue tasks status to "missed"
	if (overdueTasks.length > 0) {
		const overdueIds = overdueTasks.map((t: any) => t.task_id);
		await db.update(task)
			.set({ status: 'missed' })
			.where(inArray(task.task_id, overdueIds));
	}

	// Helper to send alerts (FCM + Email Simulators)
	const dispatchAlerts = async (targetTask: any, alertType: 'approaching' | 'missed') => {
		// Find assigner and assigned users
		const assigneeGmail = targetTask.assigner_id
			? (await db.select({ gmail: user.gmail }).from(user).where(eq(user.user_id, targetTask.assigner_id)))[0]?.gmail
			: null;

		if (!assigneeGmail) return;

		// Fetch user's active FCM tokens
		const tokens = await db.select({ token: user_fcm_token.token })
			.from(user_fcm_token)
			.where(eq(user_fcm_token.user_id, targetTask.assigner_id));

		const fcmTokens = tokens.map((t: any) => t.token);

		// Email formatting
		const title = alertType === 'approaching' ? `Task Due Soon: ${targetTask.title}` : `Task Missed/Overdue: ${targetTask.title}`;
		const bodyText = alertType === 'approaching'
			? `Hello! The task "${targetTask.title}" is due soon. Due Date: ${new Date(targetTask.end_d).toLocaleString()}.\nDescription: ${targetTask.descrption}`
			: `Hello! The task "${targetTask.title}" has missed its due date. Due Date was: ${new Date(targetTask.end_d).toLocaleString()}.\nDescription: ${targetTask.descrption}`;

		// Send Email (simulate calling Resend: / nodemailer / email APIs)
		console.log(`[EMAIL DISPATCH] To: ${assigneeGmail} | Subject: ${title}`);
		console.log(`[EMAIL CONTENT]\n${bodyText}\n`);

		// Send FCM (simulate Firebase push)
		if (fcmTokens.length > 0) {
			console.log(`[PUSH DISPATCH] Sending FCM alert to ${fcmTokens.length} devices for user ${assigneeGmail}`);
			for (const fcmTok of fcmTokens) {
				console.log(`[FCM PAYLOAD] To: ${fcmTok} | Body: ${title}`);
			}
		}

		notificationsSent.push({
			task_id: targetTask.task_id,
			title: targetTask.title,
			assignee: assigneeGmail,
			alertType,
			email_sent: true,
			fcm_count: fcmTokens.length,
		});
	};

	// Process approaching
	for (const t of upcomingTasks) {
		await dispatchAlerts(t, 'approaching');
	}

	// Process missed
	for (const t of overdueTasks) {
		await dispatchAlerts(t, 'missed');
	}

	return notificationsSent;
};

// Endpoint: Manually trigger notification checks (useful for validation & manual execution)
app.post('/tasks/check-notifications', async (c) => {
	const db = database(c.env.DB);
	try {
		const results = await checkAndSendNotifications(db, c.env);
		return c.json({
			msg: "Notification check completed",
			processed_count: results.length,
			logs: results,
		});
	} catch (error: any) {
		console.error("Manual notification check error:", error);
		return c.json({ msg: "Notification scan failure", error: error.message }, 500);
	}
});

export default app;
