# SEU Rate My Faculty

A student-built faculty review and academic resource platform for **Southeast University (SEU), Bangladesh**.

SEU Rate My Faculty helps students explore faculty feedback, share their own course experiences, and find available previous-year question papers (PYQs) — all in one place.

---

## About the Project

Students often ask for faculty reviews or previous-year question papers in Facebook groups and have to wait for replies. This platform was created to make that information easier to find, and to help students contribute their experiences for the benefit of others.

Built by SEU students, for SEU students. Its usefulness grows as more students contribute honest, constructive reviews and useful academic resources.

> **Disclaimer:** Reviews reflect students' individual experiences and opinions. They should be read as peer feedback, not as official university evaluations or guaranteed statements of fact. AI-generated summaries may be incomplete or inaccurate — always consult the original reviews when making decisions.

---

## Features

| Feature | Description |
|---|---|
| **Faculty Profiles** | Search for faculty members and explore their profiles |
| **Student Reviews** | Submit feedback based on courses you have actually taken |
| **Review Categories** | Share marking style, question difficulty, personality, and more |
| **Anonymous Reviews** | Reviews are displayed without showing the reviewer's name or email |
| **Previous-Year Question Papers** | Find available PYQs associated with faculty members |
| **AI Review Assistant (Kitty AI)** | Get an AI-generated overview of student feedback and help locating PYQs |
| **University Email Sign-In** | Sign in via Google using your supported university email |
| **Favorites** | Save faculty profiles for quick access later |
| **Leaderboard** | Discover top-rated faculty across departments |
| **Admin Dashboard** | Manage faculty, reviews, and PYQ uploads (admin/moderator only) |

---

## Tech Stack

**Frontend**
- [React 18](https://react.dev/) with [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — build tool
- [Tailwind CSS](https://tailwindcss.com/) — utility-first styling
- [Radix UI](https://www.radix-ui.com/) — accessible headless components
- [shadcn/ui](https://ui.shadcn.com/) — component library built on Radix
- [Framer Motion](https://www.framer.com/motion/) — animations
- [TanStack Query](https://tanstack.com/query) — server state management
- [React Hook Form](https://react-hook-form.com/) + [Zod](https://zod.dev/) — form validation
- [Wouter](https://github.com/molefrog/wouter) — lightweight client-side routing

**Backend**
- [Node.js](https://nodejs.org/) with [Express 5](https://expressjs.com/)
- [PostgreSQL](https://www.postgresql.org/) — relational database
- [Drizzle ORM](https://orm.drizzle.team/) — type-safe database queries
- [Passport.js](https://www.passportjs.org/) — authentication (Local + Google OAuth 2.0)
- [Multer](https://github.com/expressjs/multer) — file uploads for PYQs
- [express-session](https://github.com/expressjs/session) — cookie-based sessions

---

## Project Structure

```
seu.ratemyfaculty/
├── client/                 # React frontend (Vite)
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Route-level page components
│   │   └── lib/            # Utilities and API helpers
│   └── public/
│       └── uploads/        # Uploaded PYQ files
├── server/                 # Express backend
│   ├── index.ts            # Server entry point
│   ├── routes.ts           # API route definitions
│   ├── auth.ts             # Authentication setup
│   ├── db.ts               # Database connection
│   └── storage.ts          # Data access layer
├── shared/
│   └── schema.ts           # Drizzle schema + shared types
├── script/
│   ├── build.ts            # Production build script
│   └── seed.ts             # Database seed script
├── drizzle.config.ts
├── tailwind.config.ts
├── vite.config.ts
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database
- Google OAuth credentials (for sign-in)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/seu.ratemyfaculty.git
   cd seu.ratemyfaculty
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Create a `.env` file in the project root:

   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/seu_rmf
   SESSION_SECRET=your_session_secret
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   ```

4. **Push the database schema**

   ```bash
   npm run db:push
   ```

5. **Seed the database** *(optional)*

   ```bash
   npx tsx script/seed.ts
   ```

6. **Start the development server**

   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5000`.

### Production Build

```bash
npm run build
npm start
```

---

## How to Use

### Find faculty reviews
1. Open the website and search for a faculty member by name or initials.
2. Open their profile and read the available student reviews.

### Submit a review
1. Open the relevant faculty profile and select **Write a Review**.
2. Sign in with your university Google account if prompted.
3. Select the course you took with that faculty member.
4. Complete the review categories based on your own experience and submit.

> Please avoid personal attacks, unverified allegations, or information that identifies other students. Focus on relevant academic experiences.

### Find previous-year question papers
Open a faculty profile and check the available question-paper resources. Availability varies by faculty and course.

### Use the AI assistant (Kitty AI)
Enter a faculty member's name or initials to request a summary of submitted feedback or help finding available question papers. AI responses are generated from available information and should not be treated as definitive judgments.

---

## User Roles

| Role | Capabilities |
|---|---|
| **Student** | Sign in, submit reviews, save favorites, upload PYQs |
| **Moderator** | All student capabilities + manage reviews |
| **Admin** | Full access including faculty management and all content moderation |

---

## Contributing

This platform grows with student contributions. If you would like to help:

- Submit honest, respectful reviews for faculty you have had.
- Upload previous-year question papers you have access to.
- Report any inaccurate or inappropriate content.

For code contributions, open a pull request with a clear description of the change.

---

*Made with care by SEU mahmud.*
