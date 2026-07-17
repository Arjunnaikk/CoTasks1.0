import { Hono } from 'hono';
import database from '../database';
import { eq, and } from 'drizzle-orm';
import { user, team_message_reaction } from '../database/schema';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env }>();

const reactSchema = z.object({
	message_id: z.number().int(),
	user_gmail: z.string().email().max(200),
	emoji: z.string().max(20),
});
const reactValidator = zValidator('json', reactSchema);

// Toggle reaction on a message
app.post('/team/message/react', reactValidator, async (c) => {
	const db = database(c.env.DB);
	const { message_id, user_gmail, emoji } = await c.req.json() as any;

	try {
		// Get user ID
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Check if reaction already exists
		const [existing] = await db.select().from(team_message_reaction).where(
			and(
				eq(team_message_reaction.message_id, message_id),
				eq(team_message_reaction.user_id, reqUser.user_id),
				eq(team_message_reaction.emoji, emoji)
			)
		);

		if (existing) {
			// Delete reaction
			await db.delete(team_message_reaction).where(
				eq(team_message_reaction.reaction_id, existing.reaction_id)
			);
			return c.json({ msg: "reaction removed", action: "removed", emoji });
		} else {
			// Insert reaction
			await db.insert(team_message_reaction).values({
				message_id,
				user_id: reqUser.user_id,
				emoji,
			});
			return c.json({ msg: "reaction added", action: "added", emoji });
		}
	} catch (error) {
		console.error("Toggle reaction error:", error);
		return c.json({ msg: "couldn't toggle reaction" }, 500);
	}
});

export default app;
