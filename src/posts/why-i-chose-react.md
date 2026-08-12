---
title: Why I Chose React to Learn First
date: 2026-06-18
summary: A quick take on why React is a solid first framework, and the few core ideas that unlock most of it.
tags: [react, learning]
---

There are a lot of frontend frameworks. I picked **React** to learn first, and a
week in, I think it was the right call.

## The whole model is small

Most of React comes down to a handful of ideas:

1. **Components** — functions that return UI.
2. **Props** — data passed *down* into components.
3. **State** — data a component owns and can change over time.
4. **Effects** — code that runs to sync with the outside world.

Everything else builds on those four.

## A tiny example

```jsx
function Counter() {
  const [count, setCount] = useState(0)
  return <button onClick={() => setCount(count + 1)}>Clicked {count}</button>
}
```

That's a complete, interactive component. No template language, no special
files — just JavaScript and JSX.

## The ecosystem helps

| Need            | Common choice        |
| --------------- | -------------------- |
| Routing         | React Router         |
| Styling         | Tailwind CSS         |
| Data fetching   | TanStack Query       |

I'll add these to the blog one at a time, so each one earns its place.
