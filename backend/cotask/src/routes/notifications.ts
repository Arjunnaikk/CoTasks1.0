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

	// 1. Fetch active tasks with future due date that haven't been notified yet
	const upcomingTasks = await db.select().from(task).where(
		and(
			inArray(task.status, ['backlog', 'in_progress', 'ongoing', 'blocked', 'in_review']),
			isNotNull(task.end_d),
			gte(task.end_d, now),
			eq(task.notified_due, false)
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
		// Find all assignees for this task
		const assignees = await db.select({ 
				user_id: user.user_id,
				gmail: user.gmail 
			})
			.from(task_assigned)
			.innerJoin(user, eq(task_assigned.user_id, user.user_id))
			.where(eq(task_assigned.task_id, targetTask.task_id));

		let targetUsers = assignees;

		// If no assignees are found, fall back to the task creator (assigner)
		if (targetUsers.length === 0 && targetTask.assigner_id) {
			const creator = (await db.select({ 
				user_id: user.user_id,
				gmail: user.gmail 
			}).from(user).where(eq(user.user_id, targetTask.assigner_id)))[0];
			if (creator) {
				targetUsers.push(creator);
			}
		}

		if (targetUsers.length === 0) return;

		// Email formatting
		const title = alertType === 'approaching' ? `Task Due Soon: ${targetTask.title}` : `Task Missed/Overdue: ${targetTask.title}`;
		const bodyText = alertType === 'approaching'
			? `Hello! The task "${targetTask.title}" is due soon. Due Date: ${new Date(targetTask.end_d).toLocaleString()}.\nDescription: ${targetTask.descrption}`
			: `Hello! The task "${targetTask.title}" has missed its due date. Due Date was: ${new Date(targetTask.end_d).toLocaleString()}.\nDescription: ${targetTask.descrption}`;

		for (const targetUser of targetUsers) {
			const targetGmail = targetUser.gmail;
			if (!targetGmail) continue;

			// Fetch target user's email preference
			const [userPrefs] = await db.select({
				email_reminders_enabled: user.email_reminders_enabled,
				personal_email_reminders_enabled: user.personal_email_reminders_enabled,
				group_email_reminders_enabled: user.group_email_reminders_enabled,
			}).from(user).where(eq(user.user_id, targetUser.user_id));

			let shouldSendEmail = true;
			if (userPrefs) {
				if (!userPrefs.email_reminders_enabled) {
					console.log(`[EMAIL DISPATCH] Suppressed for ${targetGmail} (master toggle off)`);
					shouldSendEmail = false;
				} else {
					const isGroupTask = !!targetTask.team_id;
					if (isGroupTask && !userPrefs.group_email_reminders_enabled) {
						console.log(`[EMAIL DISPATCH] Suppressed for ${targetGmail} (group toggle off)`);
						shouldSendEmail = false;
					}
					if (!isGroupTask && !userPrefs.personal_email_reminders_enabled) {
						console.log(`[EMAIL DISPATCH] Suppressed for ${targetGmail} (personal toggle off)`);
						shouldSendEmail = false;
					}
				}
			}

			// Fetch user's active FCM tokens
			const tokens = await db.select({ token: user_fcm_token.token })
				.from(user_fcm_token)
				.where(eq(user_fcm_token.user_id, targetUser.user_id));

			const fcmTokens = tokens.map((t: any) => t.token);

			let emailSent = false;
			console.log(`[DEBUG] env keys: ${Object.keys(env || {}).join(', ')}`);
			console.log(`[DEBUG] env.RESEND_SECRET_KEY type: ${typeof env?.RESEND_SECRET_KEY}, value exists: ${!!env?.RESEND_SECRET_KEY}`);
			if (shouldSendEmail && env && env.RESEND_SECRET_KEY) {
				try {
					const response = await fetch('https://api.resend.com/emails', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json',
							'Authorization': `Bearer ${env.RESEND_SECRET_KEY}`
						},
						body: JSON.stringify({
							from: 'CoTask <onboarding@resend.dev>',
							to: [targetGmail],
							subject: title,
							html: `
								<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; background-color: #09090b; border: 1px solid #27272a; border-radius: 16px; color: #f4f4f5;">
									<div style="display: flex; align-items: center; gap: 8px; margin-bottom: 24px; padding-bottom: 16px; border-bottom: 1px solid #27272a;">
										<div style="height: 28px; width: 28px; border-radius: 8px; background-color: #ffffff; display: flex; align-items: center; justify-content: center; font-weight: 900; color: #000000; font-size: 16px;">
											C
										</div>
										<span style="font-weight: 700; font-size: 18px; letter-spacing: -0.025em; color: #ffffff;">CoTask Alert</span>
									</div>
									<div style="margin-bottom: 24px;">
										<p style="font-size: 14px; line-height: 1.6; color: #a1a1aa; margin: 0 0 16px 0;">Hello,</p>
										<p style="font-size: 14px; line-height: 1.6; color: #e4e4e7; margin: 0 0 20px 0;">
											${alertType === 'approaching' ? 'One of your assigned tasks is due soon. Please review the details below:' : 'A task assigned to you has missed its deadline:'}
										</p>
										<div style="padding: 20px; background-color: #18181b; border: 1px solid #27272a; border-left: 4px solid ${alertType === 'approaching' ? '#0ea5e9' : '#f43f5e'}; border-radius: 12px; margin-bottom: 20px;">
											<h3 style="margin: 0 0 8px 0; font-size: 16px; font-weight: 700; color: #ffffff;">${targetTask.title}</h3>
											<p style="margin: 0 0 12px 0; font-size: 13px; line-height: 1.5; color: #d4d4d8;">${targetTask.descrption}</p>
											<div style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: ${alertType === 'approaching' ? '#38bdf8' : '#fb7185'};">
												Due Date: ${new Date(targetTask.end_d).toLocaleString()}
											</div>
										</div>
									</div>
									<div style="border-top: 1px solid #27272a; padding-top: 16px; font-size: 11px; text-align: center; color: #71717a;">
										This is an automated notification from your CoTask workspace.
									</div>
								</div>
							`
						})
					});
					if (response.ok) {
						emailSent = true;
						console.log(`[EMAIL DISPATCH] Resend API successful for ${targetGmail}`);
					} else {
						const errText = await response.text();
						console.error(`[EMAIL DISPATCH] Resend API failed: ${response.status} - ${errText}`);
					}
				} catch (err) {
					console.error(`[EMAIL DISPATCH] Resend fetch exception:`, err);
				}
			}

			if (!emailSent) {
				if (shouldSendEmail) {
					// Fallback: Console simulator
					console.log(`[EMAIL DISPATCH] To: ${targetGmail} | Subject: ${title}`);
					console.log(`[EMAIL CONTENT]\n${bodyText}\n`);
				} else {
					console.log(`[EMAIL DISPATCH] Skipped email sending for ${targetGmail} per settings.`);
				}
			}

			// Send FCM (simulate Firebase push)
			if (fcmTokens.length > 0) {
				console.log(`[PUSH DISPATCH] Sending FCM alert to ${fcmTokens.length} devices for user ${targetGmail}`);
				for (const fcmTok of fcmTokens) {
					console.log(`[FCM PAYLOAD] To: ${fcmTok} | Body: ${title}`);
				}
			}

			notificationsSent.push({
				task_id: targetTask.task_id,
				title: targetTask.title,
				assignee: targetGmail,
				alertType,
				email_sent: true,
				fcm_count: fcmTokens.length,
			});
		}
	};

	// Process approaching with dynamic alert thresholds
	for (const t of upcomingTasks) {
		const createdTime = t.start_d ? new Date(t.start_d.replace(' ', 'T') + 'Z').getTime() : now.getTime();
		const dueTime = new Date(t.end_d).getTime();
		const tTotal = dueTime - createdTime;
		const tLeft = dueTime - now.getTime();

		let wAlert = 0;
		const dayMs = 24 * 60 * 60 * 1000;
		if (tTotal > 3 * dayMs) {
			wAlert = dayMs; // > 3 days -> alert 1 day before
		} else if (tTotal >= dayMs) {
			wAlert = 12 * 60 * 60 * 1000; // 1-3 days -> alert 12 hours before
		} else {
			wAlert = 0.25 * tTotal; // < 24 hours -> alert at 25% of duration before
		}

		if (tLeft <= wAlert) {
			await dispatchAlerts(t, 'approaching');
			await db.update(task)
				.set({ notified_due: true })
				.where(eq(task.task_id, t.task_id));
		}
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
