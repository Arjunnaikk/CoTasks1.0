# CoTask 1.0 🚀

CoTask is a modern, premium, collaborative task management web application designed to help individuals and teams organize tasks, chat in real-time, receive automated notifications, and synchronize deadlines seamlessly.

---

## 🌟 5 Major Features

### 1. Collaborative Workspaces & Task Management
Organize tasks in private personal lists or team workspaces. Define detailed task summaries, statuses (Backlog, In Progress, Ongoing, In Review, Blocked, Completed, Missed), priority ratings, and due dates.

### 2. Google Calendar Synchronization (With Invites)
Synchronize task timelines directly with your Google Calendar:
* **Selective Sync**: Choose whether to add a task to your calendar using the "Google Calendar Sync" toggle during task creation.
* **Automatic Updates**: Marking a task as completed prefixes the event with `[Completed]`, and deleting a task automatically removes the event.
* **Collaborative Invites**: Assigning group members to a task automatically adds them as attendees, adding the event to their personal Google Calendars.

### 3. Real-Time Chat & Activity Feed
Communicate instantly with your team inside collaborative workspaces:
* **Interactive Chat**: Send messages, track unread counts, and react with emojis.
* **Presence Indicators**: Visual indicators show who is online or offline in real-time based on active session pings.
* **Activity Log**: Keep track of task updates, comments, and members joining or leaving.

### 4. Smart Email Reminders & Notifications Control
Stay on top of deadlines with automated background alerts:
* **Overdue & Missed Alerts**: Receives styled HTML emails when tasks are due soon (next 24 hours) or have missed their deadlines, sent using Resend.
* **Granular Controls**: A dedicated **Notification Settings** panel in *MySettings* lets you turn off all emails, disable warnings for personal lists only, or disable warnings for group lists only.

### 5. Team Roles & Membership Controls
Structured group policies to keep workspaces clean and secure:
* **Role Hierarchy**: Appoint or revoke Admin statuses for members. Only admins can delete the group.
* **Appoint & Leave**: Members can leave groups cleanly. Sole admins are prevented from leaving until they designate another member as the admin first to ensure uninterrupted workspace ownership.

---

## 🛠️ Technology Stack

* **Frontend**: Next.js 14 (React), Tailwind CSS, NextAuth.js (Google OAuth), Axios, React Query
* **Backend**: Hono (Typescript), Cloudflare Workers
* **Database**: Drizzle ORM, SQLite (Cloudflare D1)
* **Notifications**: Resend API, Cloudflare Cron Triggers

---

## 🚀 Setup & Installation

### Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend/cotask
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set your production secrets (e.g. Resend API key):
   ```bash
   npx wrangler secret put RESEND_SECRET_KEY
   ```
4. Run Drizzle migration checks:
   ```bash
   npx drizzle-kit generate
   npx wrangler d1 migrations apply dbtest2 --local
   ```
5. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```

### Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd ../../frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure your local `.env` file with Google OAuth keys (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`), NextAuth configurations, and `NEXT_PUBLIC_API_BASE_URL`.
4. Start the local Next.js development server:
   ```bash
   npm run dev
   ```
