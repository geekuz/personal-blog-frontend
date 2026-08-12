---
title: Styling This Blog with Tailwind
date: 2026-06-10
summary: How utility classes and design tokens keep the blog's styling consistent without a pile of CSS files.
tags: [tailwind, css, design]
---

I styled this whole blog with **Tailwind CSS**, and I'm not going back to writing
big hand-rolled stylesheets for a project this size.

## Utilities, not stylesheets

Instead of inventing class names and writing CSS for them, you compose small
utility classes right in the markup:

```jsx
<button className="rounded-lg bg-accent px-4 py-2 text-white">
  Subscribe
</button>
```

It feels strange for about a day, then it feels fast.

## Design tokens keep it consistent

The trick that makes it *not* chaos is defining tokens once and reusing them:

- `--color-accent` → the one brand color, used everywhere
- spacing and font scales come from Tailwind's defaults

Because the colors are tokens, **dark mode is almost free** — I just swap the
token values and every component updates.

## What I like

- No naming things
- No dead CSS piling up
- The styles live right next to the markup they affect
