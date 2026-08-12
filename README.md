# Personal Blog

A small, fast personal blog built with **React + Vite** while learning React. Posts
are plain Markdown files; styling is Tailwind CSS.

## Tech

- **React 19** + **Vite** — UI and build/dev tooling
- **React Router** — client-side routing (`/`, `/about`, `/blog/:slug`, 404)
- **Tailwind CSS v4** + `@tailwindcss/typography` — styling and post body `prose`
- **react-markdown** + **remark-gfm** — render Markdown post bodies
- **front-matter** — parse YAML frontmatter from posts

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173
```

Other scripts:

```bash
npm run build    # production build into dist/
npm run preview  # serve the production build locally
npm run lint     # eslint
```

## Backend connection

The blog continues to use local Markdown when no backend URL is configured. To
connect the Spring Boot API, copy `.env.example` to `.env.local` and set:

```text
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

The frontend expects the API contract documented in
[`docs/BACKEND_HANDOFF.md`](docs/BACKEND_HANDOFF.md). Search, tags, pagination,
post detail requests, loading states, retries, and API errors are already wired.

## Writing a post

Add a Markdown file to `src/posts/`. The filename becomes the URL slug
(`my-post.md` → `/blog/my-post`). Include frontmatter at the top:

```markdown
---
title: My Post Title
date: 2026-06-23
summary: One-line summary shown on the home feed.
tags: [react, learning]
---

Your Markdown content here. Tables, lists, code blocks, and other
GitHub-flavored Markdown all work.
```

The post appears on the home page automatically — no code changes needed.

## Project structure

```
src/
  components/
    layout/   Layout, Header, Footer
    blog/     PostCard, PostList, SearchBar, TagFilter
    ui/       ThemeToggle
  pages/      Home, About, PostPage, NotFound
  hooks/      useLocalStorage, useTheme
  lib/        posts (loader), readingTime, formatDate
  posts/      *.md content
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
