import { Hono } from 'hono';
import database from '../database';
import { eq } from 'drizzle-orm';
import { user } from '../database/schema';
import { createUserValidator } from '../validators';

const app = new Hono<{ Bindings: Env }>();

app.get('/', (c) => c.json({ msg: 'user server up and running' }));

// Fetch all users
app.get('/user/fetch', async (c) => {
	const db = database(c.env.DB);
	try {
		const users = await db.select({
			user_id: user.user_id,
			name: user.name,
			gmail: user.gmail,
		}).from(user);

		return c.json({ user: users });
	} catch (error) {
		console.error("Fetch user error:", error);
		return c.json({ msg: "couldn't fetch users" }, 500);
	}
});

// For backward compatibility (GET /user/data)
app.get('/user/data', async (c) => {
	const db = database(c.env.DB);
	try {
		const users = await db.select({
			user_id: user.user_id,
			name: user.name,
			gmail: user.gmail,
		}).from(user);
		return c.json(users);
	} catch (error) {
		return c.json({ msg: "couldn't fetch user data" }, 500);
	}
});

// Create user (POST /user/create)
app.post('/user/create', createUserValidator, async (c) => {
	const db = database(c.env.DB);
	const data = await c.req.json();

	try {
		// Check if user already exists
		const [existingUser] = await db.select().from(user).where(eq(user.gmail, data.gmail));
		if (existingUser) {
			return c.json({
				user_id: existingUser.user_id,
				name: existingUser.name,
				gmail: existingUser.gmail,
				msg: 'user already exists',
			});
		}

		// Insert user
		const [newUser] = await db.insert(user).values({
			name: data.name,
			gmail: data.gmail,
			address: data.address,
			phone: data.phone,
			password: data.password,
		}).returning({
			user_id: user.user_id,
			name: user.name,
			gmail: user.gmail,
		});

		return c.json({ ...newUser, msg: 'user created' });
	} catch (error) {
		console.error("Create user error:", error);
		return c.json({ msg: "couldn't create user" }, 500);
	}
});

// For backward compatibility (POST /my)
app.post('/my', createUserValidator, async (c) => {
	const db = database(c.env.DB);
	const data = await c.req.json();

	try {
		const [existingUser] = await db.select().from(user).where(eq(user.gmail, data.gmail));
		if (existingUser) {
			return c.json({
				name: existingUser.name,
				gmail: existingUser.gmail,
				msg: 'user already exists',
			});
		}

		const [newUser] = await db.insert(user).values(data).returning({ name: user.name, gmail: user.gmail });
		return c.json({ ...newUser, msg: 'user created' });
	} catch (error) {
		return c.json({ msg: "couldn't create user" }, 500);
	}
});

export default app;