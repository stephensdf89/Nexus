This is a Next.js 16 project for Content Creator Nexus with Supabase authentication.

## Getting Started

Create a local env file before running the app:

```bash
cp .env.example .env.local
```

Fill in these values from your Supabase project settings:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

Then run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

For deployed environments, set the same two variables in Vercel and Netlify so the login page matches local behavior.

GitHub should only contain the code and `.env.example`; do not commit real Supabase credentials.

## Deployment Checklist

- GitHub `main` is the source of truth for code.
- Vercel project should point to this repository and deploy from `main`.
- Netlify should use `npm run build` with Node `20.9.0`.
- Supabase URL and anon key must match the same project in all environments.
