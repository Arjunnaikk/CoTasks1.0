/**
 * Welcome to Cloudflare Workers! This is your first worker.
 *
 * - Run `npm run dev` in your terminal to start a development server
 * - Open a browser tab at http://localhost:8787/ to see your worker in action
 * - Run `npm run deploy` to publish your worker
 *
 * Bind resources to your worker in `wrangler.toml`. After adding bindings, a type definition for the
 * `Env` object can be regenerated with `npm run cf-typegen`.
 *
 * Learn more at https://developers.cloudflare.com/workers/
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import user from './routes/user';
import feedback from './routes/feedback';
import list from './routes/list';
import task from './routes/task';
import team from './routes/team';
import teamTask from './routes/teamTask';
import taskAssigned from './routes/task_assigned';
import teamMessage from './routes/team_message';
import subtask from './routes/subtask';
import comment from './routes/comment';
import reaction from './routes/reaction';
import activity from './routes/activity';

const app = new Hono();

app.use('*', cors());
app.route('/', user);
app.route('/', feedback);
app.route('/', list);
app.route('/', task);
app.route('/', team);
app.route('/', teamTask);
app.route('/', taskAssigned);
app.route('/', teamMessage);
app.route('/', subtask);
app.route('/', comment);
app.route('/', reaction);
app.route('/', activity);

app.notFound((c) => c.json({ msg: 'not found' }, 404));

export default app;