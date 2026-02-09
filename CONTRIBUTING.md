# Contributing to whatday.xyz

The frontend for WhatDay — a decentralized day-of-week oracle. Bloomberg terminal aesthetic. No React, no Next.js, no nonsense.

## Run Locally

```bash
git clone https://github.com/depatchedmode/whatday.xyz.git
cd whatday.xyz
npm install
npm run dev
```

Opens at `http://localhost:5173`. Source is on `main`. Deploys to GitHub Pages via `npm run deploy`.

## Submit a PR

1. Check [whatday-trader issues](https://github.com/depatchedmode/whatday-trader/issues) for open work
2. Branch from `main` — name it `feat/thing` or `fix/thing`
3. Keep commits small and descriptive
4. Open a PR against `main`, reference the issue
5. One approval required to merge

## Code Style

- Vite + vanilla JS. Keep it that way.
- Bloomberg terminal aesthetic — dark, dense, data-forward. No rounded corners. No gradients.
- CSS goes in stylesheets, not inline.
- If you add a dependency, justify it.
- Comments explain *why*, not *what*.

## What Not To Do

- Don't add frameworks. Vanilla JS is the point.
- Don't break the terminal aesthetic. This isn't a SaaS landing page.
- Don't commit build artifacts or `dist/`.
- Don't add admin panels, governance UIs, or anything that implies central control.
- Don't submit AI-generated slop without reading it first.

## Issues

Issues are tracked on the main repo: [depatchedmode/whatday-trader/issues](https://github.com/depatchedmode/whatday-trader/issues)
