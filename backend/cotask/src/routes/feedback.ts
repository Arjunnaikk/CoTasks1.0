import { Hono } from 'hono';
import database from '../database';
import { and, eq } from 'drizzle-orm';
import { feedback, user } from '../database/schema';
import { env } from 'hono/adapter';
import { createFeedbackValidator} from '../validators';

const app = new Hono<{ Bindings: Env }>();
app.get('/', (c) => c.json({ msg: 'server up and running' }));

// app.get('/', getFeedbackValidator, async (c) => {
// 	const db = database(c.env.DB);
// 	const  user  = c.req.valid('json');

// 	try {
// 		const user = await db.query.user.findMany({
// 			columns: {
// 				user_id: true,
// 				name: true,
// 				gmail: true,
// 			},
// 		});

// 		if (!user) return c.json({ msg: 'user not found' }, 404);

	

// 		return c.json({ ...user});
// 	} catch (error) {
// 		return c.json({ msg: "couldn't fetch user" }, 500);
// 	}
// });


	app.post('/feedback',createFeedbackValidator, async (c) => {
		const db = database(c.env.DB);
		const data = await c.req.json();

		try {

			const [reqUser_id] = await db.select({ user_id: user.user_id }).from(user).where(eq(user.gmail, data.user_gmail));

			if (!reqUser_id) {
				return c.json({ msg: "User not found" }, 404);  // Handle case where user is not found
		}

			const feedbackData = {
				rating: data.rating,
            comment: data.comment || null,
            user_id: reqUser_id.user_id
			}
			
			const [newFeedback] = await db.insert(feedback).values(feedbackData).returning({feedback_id : feedback.feedback_id  });

			return c.json({ ...newFeedback, msg: 'Feedback sent' });
		} catch (error) {
			return c.json({ msg: "couldn't sent Feedback" }, 500);

		}
	});


export default app