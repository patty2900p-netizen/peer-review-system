# PeerLoop — Student Peer Review System

PeerLoop is a student peer-review web app. It uses Supabase Authentication and a shared PostgreSQL database so signed-in classmates can publish assignments and exchange feedback.

## Live app
https://patty2900p-netizen.github.io/peer-review-system/

## Main features
- Student account creation and login through Supabase Auth.
- Dashboard with submission, review, and feedback counts.
- Publish text-based assignments with a subject.
- Browse classmates' submissions.
- Review another student's work with a 1–5 rating, strengths, and one suggestion.
- View feedback received on your own assignments.
- Responsive layout for desktop and mobile.

## Files
- `index.html` — page structure and forms.
- `style.css` — styling and responsive layout.
- `app.js` — Supabase authentication, database operations, and page behaviour.
- `config.js` — Supabase project URL and publishable browser key.
- `supabase_schema.sql` — database tables, indexes, and Row Level Security policies.

## Supabase setup
1. Create or open your Supabase project.
2. Open **SQL Editor**.
3. Run the complete `supabase_schema.sql` file.
4. In **Project Settings → API**, copy the Project URL and publishable key.
5. Put those two values in `config.js`.
6. In **Authentication → URL Configuration**, add the deployed GitHub Pages URL to the allowed redirect URLs.

## Before making the app public
- Keep Row Level Security enabled on both tables. The SQL policies allow signed-in students to read class submissions and reviews, only create assignments as their own account, and only review another student's assignment as themselves.
- The browser publishable key is expected to be visible. Never put a Supabase `service_role` or secret key in `config.js`.
- For a public launch, configure a trusted SMTP email provider in Supabase before enabling email confirmation. Supabase's built-in email sender is rate-limited and is intended for testing.
- Test account creation, email confirmation, login, logout, assignment submission, review submission, and feedback on a second browser/account.
- Only collect information students are comfortable sharing with their class. This version accepts text submissions only.

## Run locally
Use a local static web server (for example, VS Code Live Server) rather than opening the HTML file directly, because `app.js` loads Supabase as an ES module.

## Important
This is a student project prototype, not a production-grade learning management system. It does not include moderation, reporting, password reset UI, or administrator tools.
