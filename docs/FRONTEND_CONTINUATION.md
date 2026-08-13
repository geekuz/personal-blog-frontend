# Personal Blog Continuation and Improvement Guide

## 1. Current project state

The frontend is a working React/Vite single-page blog. It currently provides:

- Home, About, post detail, and 404 routes
- Published Markdown posts loaded from the Spring Boot API
- Search by title and summary
- Tag filtering
- Markdown/GFM rendering
- Reading-time and date display
- Persistent light/dark mode
- Responsive Tailwind design
- Route-level lazy loading

At the time this guide was written, both `npm run lint` and `npm run build`
passed. Git is initialized and its history can be inspected.

### Testing progress — August 12, 2026

The first automated-testing milestone is complete. The project now includes:

- Vitest with jsdom for unit and component tests
- React Testing Library and `@testing-library/user-event`
- MSW for frontend API response mocking
- Playwright with Chromium for browser tests
- Test-mode backend configuration in `.env.test`

Current automated coverage includes:

- `readingTime` and `formatDate`
- Post card metadata, tags, and detail links
- Search input and tag selection behavior
- Home loading, empty, API-error, and retry states
- Successful post-detail rendering and post 404 behavior
- Theme persistence and document theme application
- Search/tag URL updates in a browser
- Direct post routes and unknown-route 404 behavior
- Theme persistence across reloads and basic mobile navigation usability

Verified results on August 12, 2026:

```text
npm test          11 tests passed across 4 files
npm run test:e2e   3 Playwright tests passed
npm run lint       passed
npm run build      passed
```

### Backend migration completed — August 13, 2026

- The Spring Boot/PostgreSQL API is now the required content source.
- Flyway V3 preserves the three original frontend posts in PostgreSQL.
- The local Markdown/frontmatter fallback and `front-matter` dependency were removed.
- The production build no longer emits the old `buffer` compatibility warning.
- `npm run test:e2e:backend` covers the live API, filters, details, 404s, and
  out-of-range pagination recovery.

Remaining test work includes backend-connected browser coverage, invalid and
out-of-range pagination recovery, explicit offline behavior, background-refresh
behavior, broader accessibility checks, and running all suites in CI.

## 2. Architecture map

```text
src/
  components/blog/     Search, tags, post list, post cards
  components/layout/   Header, footer, shared route layout
  components/ui/       Theme toggle
  hooks/                Local storage and theme behavior
  api/posts.js          Spring Boot API client
  pages/                Route-level page components
  posts/                Current Markdown content source
```

`src/api/posts.js` is the content boundary. Visual components do not issue raw
HTTP requests directly.

## 3. Immediate repository cleanup

Before feature work:

1. Restore or initialize Git and create a baseline commit.
2. Keep `node_modules` and `dist` untracked (already listed in `.gitignore`).
3. Add an SPA rewrite for the chosen host so direct post URLs work.
4. Create `.env.example` containing only:

   ```text
   VITE_API_BASE_URL=http://localhost:8080/api/v1
   ```

5. Choose a deployment target and document its build/rewrite configuration.

## 4. Backend migration plan

### Phase A: introduce an API layer

Create a small module such as `src/api/posts.js`. Do not call `fetch` directly
from visual components.

Suggested functions:

```js
getPosts({ page, size, query, tag, signal })
getPostBySlug(slug, { signal })
getTags({ signal })
```

The module should:

- Read the base URL from `import.meta.env.VITE_API_BASE_URL`.
- Encode all query parameters with `URLSearchParams`.
- throw a typed application error for non-2xx responses.
- Accept `AbortSignal` so stale navigation/search requests can be cancelled.
- Keep DTO field names aligned with `docs/BACKEND_HANDOFF.md`.

### Phase B: replace synchronous page data

The current pages assume posts are immediately available. Convert them to handle:

```text
idle/loading -> success with data
             -> success with an empty list
             -> not found
             -> recoverable API error
```

Use TanStack Query if caching, retries, pagination, and invalidation are desired.
For a deliberately dependency-light version, use a custom hook with `useEffect`,
`AbortController`, and explicit loading/error states.

### Phase C: move filtering to the backend

Search and tag filters currently run in `Home.jsx`. Once the API is connected,
send `q` and `tag` to `GET /posts`. Debounce search by about 250–400 ms and reset
the page number whenever search or tag changes.

Keep search and filter state in the URL, for example:

```text
/?q=react&tag=learning&page=0
```

This makes results shareable and preserves state during browser navigation.

### Phase D: remove the old content pipeline

After API behavior is verified:

- Remove the `front-matter` dependency.
- Remove `src/lib/posts.js` or retain only unrelated formatting utilities.
- Archive/remove `src/posts` only after its content is safely imported.
- Confirm the build no longer emits the `buffer` compatibility warning.

Do not delete the Markdown source before validating every migrated post in the
database.

## 5. Testing plan

Vitest, React Testing Library, `@testing-library/user-event`, MSW, and Playwright
are now installed and configured. Extend the existing suites as features are
added instead of creating a separate testing setup.

Minimum unit/component coverage:

- `readingTime` and `formatDate`
- Post card metadata and links
- Search input and tag selection
- Loading, empty, error, and retry states
- A successful post response and a post 404
- Theme persistence and accessible button label

Minimum browser coverage with Playwright:

- Home loads API posts
- Search and tag filters update results and URL state
- Opening a post directly works
- Unknown routes and unknown slugs render the correct 404 state
- Theme survives reload
- Mobile navigation/layout remains usable
- Out-of-range pages recover without leaving the visitor on an empty invalid page
- Offline and backend-error responses expose a working retry action

The following scripts are available:

```json
{
  "test": "vitest run",
  "test:watch": "vitest",
  "test:e2e": "playwright test"
}
```

## 6. Production improvements

### SEO and discovery

- Set a unique title and description for each route/post.
- Add canonical, Open Graph, and Twitter metadata.
- Generate `sitemap.xml` and `robots.txt`.
- Add an RSS/Atom feed.
- Consider prerendering or an SSR-capable architecture if search indexing and
  social previews are priorities; a purely client-rendered SPA is limited here.
- Add Article structured data to post pages.
- Ensure social metadata is present in the initial HTML through prerendering or
  SSR before treating social previews as complete; runtime-only meta changes are
  not consistently read by link crawlers.

### UX and accessibility

- Add skeleton or stable loading UI to reduce layout shifts.
- Add a retry action and human-friendly offline/server error messages.
- Move focus to the main heading after client-side navigation when appropriate.
- Add a visible keyboard focus style to every interactive element.
- Check color contrast in both themes.
- Add previous/next post links and an accessible table of contents for long posts.
- Use real icon components instead of emoji if consistent rendering matters.
- Preserve the previous post list while a filter request is loading and indicate
  background refresh without replacing the full page.
- Add one “Clear filters” action when search or tag filtering is active.
- Treat unknown tags and pages beyond the final page as recoverable URL states.

### Performance

- Keep full post bodies out of list responses.
- Cache public GET requests appropriately.
- Lazy-load post-only Markdown rendering code.
- Optimize post images and include width/height to avoid layout shifts.
- Monitor bundle size after adding API/query libraries.

### Content features

Prioritize features that strengthen the blog itself:

1. Draft/publish workflow
2. Post preview
3. Pagination
4. RSS and sitemap
5. Image support with captions/alt text
6. Syntax highlighting with a lightweight, safe renderer
7. Related and previous/next posts

Post rendering should also include:

- A copy button with accessible success feedback on fenced code blocks.
- Language-aware syntax highlighting that does not enable unsafe raw HTML.
- A generated table of contents for posts with multiple headings.
- Stable heading IDs so table-of-contents and shared section links work.
- Responsive, lazy-loaded images with explicit dimensions, required alt text,
  and optional captions.

### Admin authoring interface (after backend authentication)

Keep authoring routes under a separately lazy-loaded `/admin` area. Include:

- Login/logout integrated with the backend's chosen authentication mechanism.
- Draft and published post dashboard with search and status filters.
- Markdown editor with side-by-side or toggleable preview.
- Create, edit, publish, unpublish, and soft-delete flows.
- Slug validation and conflict messages.
- Tag creation and selection.
- Unsaved-change protection before navigation or tab closure.
- Optimistic-lock conflict handling so a stale editor cannot overwrite changes.

Do not persist access tokens in `localStorage`. Final authentication storage and
CSRF handling must follow the backend security design.

### CI, monitoring, and operational readiness

Add a GitHub Actions workflow that runs on pull requests and pushes to `main`:

```text
npm ci
npm run lint
npm test
npm run build
npm run test:e2e
```

Use dependency caching, but always install from `package-lock.json`. Add bundle
size monitoring and deployment preview checks. After deployment, configure:

- Frontend error reporting with source maps stored securely.
- A basic uptime check for the site and backend health endpoint.
- Privacy-conscious analytics only after documenting what is collected.
- Alerts that identify the environment and release/commit involved.

### Content and branding readiness

Before public launch:

- Replace learning-demo copy with final author biography and positioning.
- Add verified contact and social links.
- Create a consistent logo, favicon set, and social preview image.
- Publish enough substantial posts that search, tags, related-post links, and
  pagination represent real content rather than fixtures.
- Document editorial rules for titles, excerpts, headings, alt text, and tags.

Comments, analytics, reactions, subscriptions, and view counts should be added
only after their privacy, moderation, and operational costs are decided.

## 7. Suggested implementation milestones

### Milestone 1 — API-ready frontend

- Git repository is healthy.
- `.env.example` and API client exist.
- API calls have loading, empty, error, and retry states.
- MSW-backed component tests pass (11 Vitest tests as of August 12, 2026).

### Milestone 2 — backend integration

- Home uses paginated `GET /posts`.
- Search/tag state is sent to the backend and stored in the URL.
- Post pages use `GET /posts/{slug}`.
- The three existing posts render equivalently from the database.
- Old frontmatter parsing is removed.

### Milestone 3 — deployment readiness

- Frontend and backend deployments use environment configuration.
- Direct route refreshes work.
- CORS is restricted to real origins.
- Unit, integration, and browser tests pass in CI.
- Error monitoring and basic uptime checks are configured.

### Milestone 4 — discoverability and polish

- Route-level metadata, canonical URLs, sitemap, RSS, and social cards exist.
- Accessibility and mobile browser checks pass.
- Real author/about content replaces learning placeholders where appropriate.
- Performance budgets are documented and met.

### Milestone 5 — rich reading experience

- Code blocks support syntax highlighting and accessible copy actions.
- Long posts have stable heading links and an accessible table of contents.
- Previous/next and related-post navigation use backend-provided relationships.
- Post images are responsive, lazy-loaded, dimensioned, and accessible.

### Milestone 6 — authoring and operations

- The protected `/admin` bundle supports the complete draft/publish workflow.
- Stale edits and unsaved navigation are handled safely.
- GitHub Actions gates merges on lint, unit tests, build, and browser tests.
- Error monitoring, uptime checks, and release identification are operational.

## 8. Definition of done for the integrated blog

- A visitor can list, search, filter, paginate, and open published posts.
- Draft content is never visible publicly.
- Reloading any frontend route does not cause a host-level 404.
- Loading, empty, offline, server-error, and post-not-found states are distinct.
- Unknown filters and invalid pagination URLs recover predictably.
- Content is keyboard accessible and usable on common mobile widths.
- No secrets or environment-specific URLs are committed.
- Lint, unit tests, backend integration tests, browser tests, and production builds
  pass in CI.
- Database schema changes are reproducible through migrations.
- Setup and deployment can be completed from repository documentation alone.
- Code examples, heading navigation, and content images meet the documented
  accessibility behavior.

## 9. Working rule for future changes

For each feature, update the API contract first, implement and test the backend,
then update the frontend API module and UI states. Avoid allowing components to
depend directly on database concepts or persistence entities. This keeps the API
contract as the stable boundary between the two projects.
