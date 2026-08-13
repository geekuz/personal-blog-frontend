# Personal Blog

A small, fast personal blog built with **React + Vite** while learning React.
Published posts and tags come from the Spring Boot API; styling is Tailwind CSS.

## Tech

- **React 19** + **Vite** — UI and build/dev tooling
- **React Router** — client-side routing (`/`, `/about`, `/blog/:slug`, 404)
- **Tailwind CSS v4** + `@tailwindcss/typography` — styling and post body `prose`
- **react-markdown** + **remark-gfm** — render Markdown post bodies

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173; requires the backend on port 8080
```

Other scripts:

```bash
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run lint     # eslint
```

## Backend connection

Copy `.env.example` to `.env.local` and configure the required Spring Boot API:

```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

The frontend expects the API contract documented in
[`docs/BACKEND_HANDOFF.md`](docs/BACKEND_HANDOFF.md). Search, tags, pagination,
post detail requests, loading states, retries, and API errors are already wired.

Posts are authored and stored as Markdown source by the backend. The frontend
renders the `content` field using GitHub-flavored Markdown.

## Project structure

```
src/
  components/
    layout/   Layout, Header, Footer
    blog/     PostCard, PostList, SearchBar, TagFilter
    ui/       ThemeToggle
  pages/      Home, About, PostPage, NotFound
  hooks/      useLocalStorage, useTheme
  api/        Spring Boot API client
  lib/        readingTime and date formatting utilities
  index.css   Tailwind entry + design tokens
```

## Deploy

This is a static single-page app — any static host works.

**Vercel / Netlify:** import the repo, framework preset "Vite", build command
`npm run build`, output directory `dist`. Add a SPA rewrite so deep links like
`/blog/my-post` resolve to `index.html`:

- Netlify: add `public/_redirects` containing `/*  /index.html  200`
- Vercel: it handles SPA fallback for Vite automatically

## Project planning

- [Spring Boot backend handoff](docs/BACKEND_HANDOFF.md)
- [Frontend continuation and improvement guide](docs/FRONTEND_CONTINUATION.md)

## License

Personal project — all rights reserved.
