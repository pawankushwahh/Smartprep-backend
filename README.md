# SmartPrep Backend API

AI-powered exam preparation backend — Node.js + Express + Supabase + Gemini AI

---

## Quick Start

### 1. Clone & Install

```bash
git clone <your-repo-url>
cd smartprep-backend
npm install
```

### 2. Set Up Environment Variables

```bash
cp .env.example .env
# Fill in your values in .env
```

### 3. Set Up Supabase

1. Go to [supabase.com](https://supabase.com) → Create a free project called `smartprep`
2. Go to **SQL Editor → New Query**
3. Paste the contents of `db/schema.sql` and click **Run**
4. Go to **Project Settings → API** and copy:
   - `Project URL` → `SUPABASE_URL` in `.env`
   - `anon public` key → `SUPABASE_ANON_KEY` in `.env`

### 4. Get Gemini API Key (Free)

1. Go to [aistudio.google.com](https://aistudio.google.com)
2. Sign in with Google → click **Get API Key**
3. Copy it → `GEMINI_API_KEY` in `.env`

### 5. Run Locally

```bash
npm run dev
# Server starts at http://localhost:4000
```

---

## API Endpoints

### Auth

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/auth/signup` | `{ name, email, password, examType, targetDate? }` | `{ token, user }` |
| POST | `/auth/login` | `{ email, password }` | `{ token, user }` |
| POST | `/auth/logout` | — | `{ message }` |

### AI (🔒 requires Bearer token)

| Method | Endpoint | Body | Response |
|--------|----------|------|----------|
| POST | `/ai/recommend` | `{ examType, subjects[] }` | `{ topics: [{name, priority, timeEst, tip}] }` |
| POST | `/ai/notes` | `{ topic }` | `{ notes: "markdown string", topic }` |
| POST | `/ai/quiz` | `{ topic, numQuestions? }` | `{ quiz: [{question, options, answer, explanation}] }` |

### Resources (🔒 requires Bearer token)

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/resources/:topic` | `{ resources: [{id, title, url, source, topic}] }` |
| GET | `/resources?page=1&limit=20` | `{ resources, total, page, totalPages }` |
| POST | `/resources` | `{ resource }` |

### User (🔒 requires Bearer token)

| Method | Endpoint | Response |
|--------|----------|----------|
| GET | `/user/profile` | `{ profile: { id, email, name, exam_type, target_date } }` |
| PATCH | `/user/profile` | `{ profile }` |
| GET | `/user/progress` | `{ progress, topics, totalTopics }` |
| GET | `/user/topics` | `{ topics[] }` |

### Auth Header Format
```
Authorization: Bearer <token>
```

---

## Deploy to Railway

1. Push code to GitHub (`.env` must be in `.gitignore`)
2. Go to [railway.app](https://railway.app) → Sign up with GitHub
3. **New Project → Deploy from GitHub repo** → select this repo
4. In the **Variables** tab, add all variables from `.env.example`
5. Railway auto-deploys — you'll get a URL like `https://smartprep-api.up.railway.app`
6. Share this URL with your frontend partner
7. Update `FRONTEND_URL` in Railway Variables to your partner's Vercel URL

---

## Testing with Postman

1. **Signup**: `POST localhost:4000/auth/signup` → copy the `token`
2. **Login**: `POST localhost:4000/auth/login` → copy the `token`
3. **Recommend**: `POST localhost:4000/ai/recommend` with header `Authorization: Bearer <token>`
   - Body: `{ "examType": "UPSC", "subjects": ["History", "Geography"] }`
4. **Notes**: `POST localhost:4000/ai/notes`
   - Body: `{ "topic": "French Revolution" }`
5. **Resources**: `GET localhost:4000/resources/History`
6. **Progress**: `GET localhost:4000/user/progress`

---

## Project Structure

```
smartprep-backend/
├── index.js              # Main server entry point
├── package.json
├── .env.example          # Template — copy to .env
├── .gitignore
├── db/
│   ├── supabase.js       # Supabase client
│   └── schema.sql        # Run this in Supabase SQL Editor
├── middleware/
│   └── auth.js           # JWT verification middleware
└── routes/
    ├── auth.js           # /auth/signup, /auth/login
    ├── ai.js             # /ai/recommend, /ai/notes, /ai/quiz
    ├── resources.js      # /resources/:topic
    └── user.js           # /user/profile, /user/progress
```

---

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (JWT)
- **AI**: Google Gemini 1.5 Flash (free tier: 60 req/min)
- **Deployment**: Railway (free tier)
