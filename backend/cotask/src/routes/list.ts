import { Hono } from 'hono';
import database from '../database';
import { and, eq } from 'drizzle-orm';
import { user, list } from '../database/schema';
import { createListValidator } from '../validators';
import { z } from 'zod';
import { zValidator } from '@hono/zod-validator';

const app = new Hono<{ Bindings: Env }>();

const fetchListSchema = z.object({
	user_gmail: z.string().email().max(200),
});
const fetchListValidator = zValidator('json', fetchListSchema);

const deleteListSchema = z.object({
	user_gmail: z.string().email().max(200),
	name: z.string().max(50),
});
const deleteListValidator = zValidator('json', deleteListSchema);

// Fetch lists for a user
app.post('/list/fetch', fetchListValidator, async (c) => {
	const db = database(c.env.DB);
	const { user_gmail } = await c.req.json() as any;

	try {
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		const userLists = await db.select({
			list_id: list.list_id,
			name: list.name,
		}).from(list).where(eq(list.user_id, reqUser.user_id));

		return c.json({ newList: userLists });
	} catch (error) {
		console.error("Fetch list error:", error);
		return c.json({ msg: "couldn't fetch lists" }, 500);
	}
});

// Create a list
app.post('/list/create', createListValidator, async (c) => {
	const db = database(c.env.DB);
	const { name, user_gmail } = await c.req.json() as any;

	try {
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		// Check if list already exists for this user
		const [existingList] = await db.select().from(list).where(
			and(
				eq(list.user_id, reqUser.user_id),
				eq(list.name, name)
			)
		);
		if (existingList) {
			return c.json({ list_id: existingList.list_id, name: existingList.name, msg: 'list already exists' });
		}

		const [newList] = await db.insert(list).values({
			name,
			user_id: reqUser.user_id,
		}).returning({
			list_id: list.list_id,
			name: list.name,
		});

		return c.json({ ...newList, msg: 'list created' });
	} catch (error) {
		console.error("Create list error:", error);
		return c.json({ msg: "couldn't create list" }, 500);
	}
});

// Delete a list
app.delete('/list/delete', deleteListValidator, async (c) => {
	const db = database(c.env.DB);
	const { user_gmail, name } = await c.req.json() as any;

	try {
		const [reqUser] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, user_gmail));
		if (!reqUser) {
			return c.json({ msg: "User not found" }, 404);
		}

		const result = await db.delete(list).where(
			and(
				eq(list.user_id, reqUser.user_id),
				eq(list.name, name)
			)
		).returning({
			list_id: list.list_id,
			name: list.name,
		});

		if (result.length === 0) {
			return c.json({ msg: "List not found or not deleted" }, 404);
		}

		return c.json({ msg: "list deleted", deletedList: result[0] });
	} catch (error) {
		console.error("Delete list error:", error);
		return c.json({ msg: "couldn't delete list" }, 500);
	}
});

export default app;
