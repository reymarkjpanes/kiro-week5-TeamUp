# TeamUp

**Find the Right People. Build Better Teams.**

TeamUp is a full-stack collaboration platform that helps users create teams or join existing ones for hackathons, capstone projects, research initiatives, or startup ideas. Built with Next.js, Supabase, and Tailwind CSS.

![Next.js](https://img.shields.io/badge/Next.js-16-black?logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Postgres-3fcf8e?logo=supabase)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178c6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?logo=tailwindcss)

---

## Features

- **Authentication** — Email/password signup, login, password reset with email verification
- **Team Creation** — Publish team listings with title, description, category, roles needed, and member limits
- **Browse & Search** — Discover open teams with search, category filters, and sorting
- **Applications** — Apply to teams with a message; owners review, accept, or reject
- **Team Management** — View members, remove members, leave teams, change team status
- **Profile** — Editable profile with avatar upload, skills, bio, and social links
- **Dashboard** — Overview of owned teams, joined teams, and application statuses
- **Row-Level Security** — All data access scoped by authenticated user via Supabase RLS

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Backend | Supabase (Postgres, Auth, Storage) |
| Database | PostgreSQL with Row-Level Security |
| Auth | Supabase Auth (email/password) |
| Storage | Supabase Storage (avatars, team logos) |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ installed
- A [Supabase](https://supabase.com/) project (free tier works)
- npm (comes with Node.js)

### 1. Clone the repository

```bash
git clone https://github.com/reymarkjpanes/kiro-week5-TeamUp.git
cd kiro-week5-TeamUp
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a `.env.local` file in the root directory:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

You can find these in your Supabase Dashboard → Settings → API.

### 4. Set up the database

The database schema and RLS policies are managed via Supabase migrations. If you're using a fresh Supabase project, you'll need to apply the migrations.

The schema includes:
- `profiles` — User profiles linked to auth.users
- `teams` — Team listings with status and category
- `roles` — Predefined roles (Frontend, Backend, UI/UX, etc.)
- `team_roles` — Join table linking teams to their required roles
- `applications` — User applications to teams
- `team_members` — Accepted members of teams
- `notifications` — User notifications

All tables have RLS enabled with proper policies.

### 5. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

---

## Project Structure

```
src/
├── app/
│   ├── auth/callback/       # OAuth/email verification callback
│   ├── dashboard/           # User dashboard (protected)
│   ├── forgot-password/     # Password reset request
│   ├── login/               # Login page
│   ├── profile/             # Profile editor (protected)
│   ├── reset-password/      # Set new password
│   ├── signup/              # Registration page
│   ├── teams/
│   │   ├── [id]/            # Team detail + applications
│   │   └── create/          # Create new team (protected)
│   ├── globals.css          # Tailwind + design system
│   ├── layout.tsx           # Root layout
│   └── page.tsx             # Landing page
├── components/
│   ├── Navbar.tsx           # Responsive navigation with mobile menu
│   └── Footer.tsx           # Site footer
├── lib/
│   ├── database.types.ts    # Auto-generated Supabase types
│   └── supabase/
│       ├── client.ts        # Browser Supabase client
│       ├── middleware.ts    # Session refresh logic
│       └── server.ts       # Server-side Supabase client
└── middleware.ts            # Route protection + session management
```

---

## Database Schema

```
profiles ─────────┐
                  │
teams ────────────┼──── team_roles ──── roles
  │               │
  ├── team_members┘
  │
  └── applications
  
notifications ──── profiles
```

### Key relationships:
- A **user** has one **profile** (auto-created on signup)
- A **team** belongs to one **owner** (profile)
- A **team** has many **team_roles** (each linking to a role with slot count)
- A **team** has many **applications** from users
- A **team** has many **team_members** (accepted applicants)

---

## Row-Level Security

Every table has RLS enabled with scoped policies:

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Public | Own ID | Own + WITH CHECK | Own |
| teams | Non-archived | Owner only | Owner + WITH CHECK | Owner |
| roles | Public | Service only | — | — |
| team_roles | Public | Team owner | Team owner + WITH CHECK | Team owner |
| applications | Own + team owner | Own user_id | Own cancel / owner accept | Own |
| team_members | Public | Team owner | — | Own leave / owner remove |
| notifications | Own only | Own user_id | Own + WITH CHECK | Own |

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Create production build |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |

---

## Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import the repository on [Vercel](https://vercel.com/new)
3. Add environment variables in Vercel's project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy

### Supabase Configuration

Make sure to configure in your Supabase dashboard:
- **Auth → URL Configuration** — Add your Vercel URL to "Site URL" and "Redirect URLs"
- **Auth → Email Templates** — Customize confirmation and reset emails (optional)
- **Auth → Settings** — Enable leaked password protection (recommended)

---

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes (`git commit -m "feat: add my feature"`)
4. Push to the branch (`git push origin feature/my-feature`)
5. Open a Pull Request

---

## License

This project is open source and available under the [MIT License](LICENSE).

---

## Acknowledgments

- Built during **Kiroverse Week 5** workshop
- Powered by [Kiro IDE](https://kiro.dev) (Vibe mode)
- Backend by [Supabase](https://supabase.com)
- Frontend by [Next.js](https://nextjs.org) + [Tailwind CSS](https://tailwindcss.com)
