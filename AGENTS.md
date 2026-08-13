# AGENTS.md

This repository contains a React frontend application.

Primary technologies may include:

* React
* TypeScript
* JavaScript
* HTML
* CSS
* npm, pnpm, or Yarn
* Vite, Next.js, or another existing build system
* REST API integration
* React Router
* TanStack Query
* Redux Toolkit
* Zustand
* React Hook Form
* Jest or Vitest
* React Testing Library
* Playwright or Cypress

Before making changes, inspect the project structure, `package.json`, existing components, hooks, API clients, state management, tests, and styling conventions.

Always prefer the smallest correct change that fits the existing codebase.

---

# General Rules

Before changing code:

1. Inspect the relevant components and modules.
2. Understand the current implementation.
3. Identify affected pages, components, hooks, API calls, and types.
4. Inspect `package.json`.
5. Check existing tests.
6. Follow existing architecture and naming conventions.
7. Understand the root cause before fixing bugs.

Do not start rewriting components immediately after receiving a task.

Follow existing project conventions rather than introducing personal preferences.

---

# Scope Discipline

Do not modify unrelated files.

Do not:

* rename unrelated components
* reformat unrelated code
* reorganize directories unnecessarily
* replace existing libraries without reason
* upgrade dependencies unless requested
* rewrite functioning components unnecessarily
* perform broad refactoring while fixing a small issue
* change API contracts without reason
* change styling systems during unrelated work

If a broader refactoring would be useful, mention it separately instead of silently including it.

---

# Project Architecture

Inspect the existing structure before adding files.

Common structures may include:

```text
src/
├── api/
├── assets/
├── components/
├── features/
├── hooks/
├── layouts/
├── pages/
├── routes/
├── services/
├── store/
├── types/
└── utils/
```

Do not reorganize the project simply because another directory structure is personally preferable.

Follow existing feature boundaries.

---

# TypeScript

Prefer strong typing.

Avoid:

```typescript
any
```

unless there is a genuine technical reason.

Prefer explicit types:

```typescript
interface User {
  id: number;
  username: string;
  email: string;
}
```

or:

```typescript
type User = {
  id: number;
  username: string;
  email: string;
};
```

Follow whichever convention the repository already uses.

Do not use type assertions merely to silence compiler errors.

Avoid:

```typescript
const user = response.data as User;
```

when the actual response shape is uncertain.

Fix the type or data handling instead.

---

# API Types

Frontend types must accurately match backend API contracts.

Pay attention to:

* field names
* data types
* enum values
* nullable fields
* optional fields
* pagination structures
* date formats
* nested objects

Example:

```typescript
type UserResponse = {
  id: number;
  fullName: string;
  email: string | null;
};
```

Do not mark values non-nullable merely because the UI would prefer them to be.

Model the actual API contract.

---

# React Components

Prefer functional components.

Example:

```tsx
export function UserProfile() {
  return <div>User profile</div>;
}
```

Keep components focused.

Extract logic when it improves:

* readability
* reuse
* testability
* separation of concerns

Do not split components solely because they exceed an arbitrary number of lines.

Avoid giant components that combine:

* data fetching
* business rules
* form state
* complex presentation
* routing logic
* unrelated modals

when meaningful separation would improve clarity.

---

# Component Responsibilities

Presentation-focused components should mostly handle rendering and interaction.

Complex data-fetching or reusable behavior may belong in:

```text
hooks/
services/
api/
features/
```

depending on existing architecture.

Avoid putting unrelated API logic directly into deeply nested UI components.

---

# Props

Define clear prop types.

Example:

```tsx
type UserCardProps = {
  user: User;
  onSelect: (userId: number) => void;
};

export function UserCard({
  user,
  onSelect,
}: UserCardProps) {
  return (
    <button onClick={() => onSelect(user.id)}>
      {user.username}
    </button>
  );
}
```

Avoid vague props such as:

```typescript
data: any
callback: Function
value: object
```

Use specific types.

---

# State Management

Use local state for local UI concerns.

Example:

```tsx
const [isOpen, setIsOpen] = useState(false);
```

Do not put every state value into global state.

Use global state only when data genuinely needs to be shared across distant parts of the application or persisted according to existing architecture.

Follow the state-management solution already used by the repository.

Possible examples:

```text
Redux Toolkit
Zustand
Context API
MobX
```

Do not introduce another state library unless clearly justified.

---

# Server State

Treat remote server data differently from local UI state.

If the project already uses TanStack Query, React Query, SWR, RTK Query, or another server-state library, use it consistently.

Example:

```tsx
const {
  data,
  isLoading,
  error,
} = useQuery({
  queryKey: ['users'],
  queryFn: getUsers,
});
```

Do not unnecessarily copy fetched server data into another state store.

Avoid patterns such as:

```tsx
const { data } = useQuery(...);
const [users, setUsers] = useState([]);

useEffect(() => {
  setUsers(data);
}, [data]);
```

unless there is a concrete reason for maintaining a separate mutable copy.

---

# Hooks

Follow the Rules of Hooks.

Do not call hooks:

* conditionally
* inside loops
* inside event handlers
* inside ordinary nested functions

Correct:

```tsx
const [user, setUser] = useState<User | null>(null);
```

Incorrect:

```tsx
if (isLoggedIn) {
  const [user, setUser] = useState<User | null>(null);
}
```

---

# useEffect

Use `useEffect` only for synchronization with external systems or effects.

Do not use it for values that can be calculated directly during rendering.

Avoid:

```tsx
const [fullName, setFullName] = useState('');

useEffect(() => {
  setFullName(`${firstName} ${lastName}`);
}, [firstName, lastName]);
```

Prefer:

```tsx
const fullName = `${firstName} ${lastName}`;
```

When modifying effects, inspect dependencies carefully.

Do not disable lint rules merely to silence dependency warnings without understanding the effect.

---

# Custom Hooks

Use custom hooks for reusable stateful behavior.

Example:

```tsx
function useCurrentUser() {
}
```

Custom hooks should:

* start with `use`
* follow hook rules
* have focused responsibilities
* avoid hidden unrelated side effects

Do not create custom hooks merely as wrappers around one trivial line unless they provide meaningful abstraction.

---

# API Layer

Keep API communication centralized according to the existing project structure.

Prefer:

```text
src/api/
src/services/
```

or the repository's equivalent.

Example:

```typescript
export async function getUsers(): Promise<User[]> {
  const response = await api.get<User[]>('/users');
  return response.data;
}
```

Avoid scattering raw Axios or `fetch` requests throughout many components.

Centralization makes:

* authentication
* error handling
* typing
* base URLs
* interceptors

more predictable.

---

# HTTP Client

Use the project's existing HTTP client.

If Axios is already configured, reuse its shared instance.

Example:

```typescript
export const api = axios.create({
  baseURL: '/api',
});
```

Do not create independent Axios instances throughout the application without reason.

If the project uses `fetch`, follow that convention.

---

# Authentication

Follow the existing authentication architecture.

Be especially careful when modifying:

* access tokens
* refresh tokens
* OAuth2
* OpenID Connect
* login callbacks
* logout
* protected routes
* authorization guards
* cookies
* token refresh interceptors

Do not invent a second authentication flow.

Do not weaken authentication behavior simply to make a page work.

---

# Frontend Security

Anything shipped to the browser must be considered public.

Never put server secrets into frontend code.

Do not place secrets in:

```text
TypeScript files
React components
public assets
localStorage
sessionStorage
frontend environment variables
```

Frontend environment variables included during builds are not secret.

Do not rely on frontend authorization checks as actual security.

The backend must enforce authorization.

Frontend guards exist primarily for user experience and navigation.

---

# XSS

Avoid rendering untrusted HTML.

Be extremely cautious with:

```tsx
dangerouslySetInnerHTML
```

Do not use it unless necessary and the content is properly sanitized.

Prefer normal React text rendering when possible because React escapes text by default.

---

# API Authorization Errors

Handle security-related HTTP responses appropriately.

Common examples:

```text
401 Unauthorized
403 Forbidden
```

Do not treat every API error as a generic server failure.

Do not expose internal backend details directly to end users.

---

# Forms

Follow the project's existing form approach.

If React Hook Form is already used, continue using it.

Example:

```tsx
const {
  register,
  handleSubmit,
  formState: { errors },
} = useForm<CreateUserForm>();
```

Avoid introducing a second form library.

Keep validation aligned with backend requirements where practical.

Frontend validation improves UX.

Backend validation remains authoritative.

---

# Form State

Avoid duplicating form state unnecessarily.

If a form library manages a field, avoid also maintaining the same field independently with `useState` unless needed.

Keep controlled and uncontrolled input strategies consistent with the chosen form solution.

---

# Error Handling

Handle errors explicitly.

Distinguish where possible between:

```text
validation error
authentication failure
authorization failure
not found
conflict
server error
network error
timeout
```

Avoid displaying raw backend exception messages directly to users unless the API is intentionally designed to return user-facing messages.

Provide meaningful UI feedback.

---

# Loading States

Every asynchronous view should account for appropriate states.

Typical states include:

```text
loading
success
empty
error
```

Do not leave the screen blank during network operations.

Example:

```tsx
if (isLoading) {
  return <LoadingSpinner />;
}

if (error) {
  return <ErrorMessage />;
}

if (!users?.length) {
  return <EmptyState />;
}
```

Follow existing UI components when available.

---

# Mutations

When creating, updating, or deleting data:

* indicate pending state
* prevent accidental duplicate submission where appropriate
* handle errors
* update or invalidate cached server data
* show success feedback when existing UX calls for it

If using TanStack Query, follow its existing mutation conventions.

---

# Routing

Follow the router already used by the repository.

Do not introduce another router.

Keep route definitions consistent.

When adding protected routes, use the established authentication mechanism.

Do not duplicate route strings unnecessarily if the project centralizes them.

---

# URL State

For filters, pagination, sorting, or search that users may want to bookmark or share, consider whether state belongs in URL query parameters.

Follow existing project conventions.

Do not move state into URLs unnecessarily for ephemeral UI concerns such as modal visibility unless the application deliberately models them through routing.

---

# Styling

Follow the styling system already used by the project.

Possible systems include:

```text
plain CSS
SCSS
CSS Modules
Tailwind CSS
Material UI
Ant Design
Styled Components
Emotion
```

Do not introduce a second styling framework without a strong reason.

Do not rewrite existing styling simply to match personal preferences.

Use existing design tokens and components where available.

---

# UI Components

Reuse existing components before creating new ones.

Before adding:

```text
Button
Modal
Input
Select
Table
Pagination
Tooltip
Spinner
```

search for an existing project component.

Do not create multiple components that perform the same role with slightly different implementations.

---

# Accessibility

Maintain accessibility.

Prefer semantic HTML.

Use:

```html
<button>
```

for actions rather than clickable:

```html
<div>
```

unless there is a strong reason otherwise.

Inputs should have labels.

Interactive elements should support keyboard navigation.

Use appropriate:

```text
aria-label
aria-describedby
role
```

only when semantic HTML is insufficient.

Images should have appropriate `alt` text.

Do not remove accessibility attributes from existing components without reason.

---

# React Performance

Do not add optimization hooks without evidence.

Avoid excessive:

```tsx
useMemo
useCallback
React.memo
```

Use them when they solve actual rendering, computation, or referential stability problems.

Do not make simple code harder to understand for theoretical micro-optimizations.

Be alert for:

* rendering huge lists
* duplicate API calls
* unnecessary rerenders
* expensive calculations
* oversized response payloads

For very large lists, consider virtualization if existing requirements justify it.

---

# Lists and Keys

Use stable identifiers as React keys.

Good:

```tsx
users.map((user) => (
  <UserRow key={user.id} user={user} />
));
```

Avoid array indexes when list order may change:

```tsx
users.map((user, index) => (
  <UserRow key={index} user={user} />
));
```

---

# Immutability

Do not mutate React state directly.

Avoid:

```tsx
users.push(newUser);
setUsers(users);
```

Prefer:

```tsx
setUsers((currentUsers) => [
  ...currentUsers,
  newUser,
]);
```

Follow immutable update patterns for objects and arrays.

---

# Null and Undefined

Handle missing values explicitly.

Do not use non-null assertions merely to silence TypeScript:

```typescript
user!.name
```

unless the value is genuinely guaranteed by program logic.

Prefer safe narrowing.

Example:

```tsx
if (!user) {
  return null;
}

return <span>{user.name}</span>;
```

---

# Dates and Times

Understand the backend timestamp format before changing date handling.

Be careful with:

```text
UTC
local time
ISO 8601
date-only values
timezone offsets
```

Do not accidentally convert a date-only business value through timezone logic.

Avoid manual date parsing when established project utilities exist.

---

# Environment Configuration

Respect existing environment handling.

Examples may include:

```text
.env
.env.local
.env.development
.env.production
```

Do not hardcode API URLs or environment-specific configuration inside components.

Never assume frontend environment variables are secrets.

---

# Dependencies

Before adding a dependency:

1. Check whether the functionality already exists in the project.
2. Check the browser or JavaScript standard APIs.
3. Check existing dependencies.
4. Add a dependency only when justified.

Do not install a package for trivial logic.

Do not upgrade unrelated packages during feature work.

Use the package manager already used by the repository.

If the repository contains:

```text
package-lock.json
```

use npm.

If it contains:

```text
pnpm-lock.yaml
```

use pnpm.

If it contains:

```text
yarn.lock
```

use Yarn.

Do not casually replace the lockfile or package manager.

---

# Testing

Every meaningful change should be tested where practical.

Follow the project's existing test stack.

Possible tools include:

```text
Vitest
Jest
React Testing Library
Playwright
Cypress
```

Prefer testing visible behavior.

Example test style:

```text
render component
perform user interaction
assert visible result
```

Avoid tightly coupling tests to internal component implementation.

---

# Testing Components

Prefer user-oriented queries with React Testing Library.

Prefer:

```text
getByRole
getByLabelText
getByText
```

over brittle implementation-specific selectors when practical.

Do not test private component state directly.

Test what users can observe.

---

# API Testing

Mock HTTP calls using the project's existing strategy.

Possible approaches include:

* MSW
* mocked API modules
* integration test environment

Do not introduce a second mocking framework without reason.

---

# Bug Fix Workflow

When fixing a bug:

1. Reproduce or understand the behavior.
2. Inspect the relevant component or hook.
3. Trace state and data flow.
4. Inspect API calls if relevant.
5. Identify the root cause.
6. Add a regression test when practical.
7. Apply the smallest correct fix.
8. Run relevant checks.
9. Review the final diff.

Do not merely hide the visible symptom.

---

# package.json

Inspect `package.json` before running commands.

Do not assume these scripts exist:

```text
test
lint
build
typecheck
format
```

Use actual scripts defined by the repository.

---

# Verification

Run relevant project checks after changes.

Typical commands may include:

```bash
npm test
```

```bash
npm run lint
```

```bash
npm run typecheck
```

```bash
npm run build
```

But only use scripts that actually exist.

With pnpm:

```bash
pnpm test
pnpm lint
pnpm build
```

With Yarn:

```bash
yarn test
yarn lint
yarn build
```

Do not claim a check passed unless it was actually executed successfully.

---

# Linting

Follow existing ESLint configuration.

Do not disable lint rules globally just to avoid fixing an issue.

Avoid:

```typescript
// eslint-disable
```

unless there is a specific justified reason.

Prefer fixing the underlying problem.

---

# Formatting

Use the repository's existing formatter configuration.

If Prettier is already present, follow it.

Do not reformat unrelated files.

Avoid giant diffs caused entirely by formatting changes.

---

# Git Safety

Inspect Git state before broad modifications.

Useful commands:

```bash
git status
```

```bash
git diff
```

```bash
git diff --staged
```

Never discard existing uncommitted changes.

Do not use destructive commands such as:

```bash
git reset --hard
```

```bash
git clean -fd
```

unless explicitly requested.

Do not overwrite unrelated user work.

---

# Commits

Do not create commits unless explicitly requested.

When commits are requested:

* keep them focused
* include only relevant changes
* use descriptive messages

Examples:

```text
feat: add user search filters
fix: prevent duplicate form submission
refactor: extract order query hook
test: add user form validation tests
```

---

# Refactoring

Refactor only when there is a concrete benefit.

Good reasons include:

* duplicated logic
* difficult testing
* tightly coupled components
* clearly unreadable implementation
* repeated API handling
* necessary architectural improvement

Avoid abstractions merely because they might theoretically be reused later.

Prefer readable, obvious code.

---

# Naming

Use descriptive names.

Prefer:

```typescript
fetchActiveUsers()
handleOrderSubmit()
isDialogOpen
selectedCustomerId
```

Avoid:

```typescript
doStuff()
handleThing()
data2
temp
valueX
```

unless very small local scope makes the meaning obvious.

Boolean names should read naturally:

```text
isLoading
hasPermission
canEdit
shouldRefresh
```

---

# Comments

Do not add comments that simply repeat the code.

Bad:

```typescript
// Set loading to true
setIsLoading(true);
```

Good comments explain non-obvious constraints:

```typescript
// Keep the previous result visible while pagination loads
// to prevent the table from flashing between requests.
```

Explain why, not obvious syntax.

---

# Documentation

Update documentation when behavior materially changes.

Examples:

* new frontend environment variable
* new setup requirement
* changed authentication flow
* new build command
* new external integration
* changed routing convention

Do not rewrite unrelated documentation.

---

# Implementation Workflow

For feature work:

```text
1. Inspect
2. Understand
3. Plan
4. Implement
5. Test
6. Review git diff
7. Summarize
```

Before implementation, identify affected:

* components
* hooks
* API functions
* types
* routes
* tests

After implementation, inspect the final diff.

---

# Final Review

Before declaring frontend work complete, check:

* Does TypeScript compile?
* Does linting pass?
* Does the application build?
* Do relevant tests pass?
* Are API types correct?
* Are nullable fields handled?
* Are loading states handled?
* Are error states handled?
* Are forms validated?
* Are hooks used correctly?
* Is state stored at the appropriate level?
* Are API calls centralized according to project convention?
* Is authentication behavior preserved?
* Are accessibility basics preserved?
* Were unrelated files modified?

---

# Backend API Awareness

This repository may communicate with a separate backend repository.

When API behavior changes, ensure frontend code remains synchronized with the backend contract.

Pay particular attention to:

```text
endpoint paths
HTTP methods
request DTOs
response DTOs
enum values
pagination
nullable fields
authentication requirements
date/time formats
error structures
```

Do not invent backend behavior based only on assumptions.

When an API contract is uncertain, inspect available API documentation, generated OpenAPI definitions, existing client code, or backend source when available.

---

# Reporting Changes

After completing a task, summarize:

1. What changed
2. Why it changed
3. Important implementation decisions
4. Files affected
5. Tests or verification executed
6. Remaining risks or limitations

Never claim a command was executed if it was not.

Never claim tests passed if they were not run.

---

# Core Principles

Prefer:

```text
Correctness over cleverness
Readability over abstraction
Small changes over broad rewrites
Existing conventions over personal preference
Strong typing over any
Server state tools over duplicated state
Semantic HTML over clickable divs
Root-cause fixes over symptom suppression
Tests over assumptions
```

The goal is not to produce more code.

The goal is to make the smallest reliable change that fits the existing application.
