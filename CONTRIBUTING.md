# Contributing

The Bloomberg terminal aesthetic for the day-of-week oracle. Keep it clean, keep it fast.

## Setup

Requirements:
- Node.js 18+

```bash
git clone https://github.com/depatchedmode/whatday.xyz.git
cd whatday.xyz
npm install
npm run dev
```

Visit `http://localhost:5173` (or whatever Vite says).

## Structure

- `index.html` — Main HTML (includes most CSS inline)
- `src/main.js` — Application logic, Solana integration
- `public/` — Static assets (fonts, images)
- `scripts/` — Build utilities

## Code Style

**HTML/CSS:**
- Bloomberg terminal aesthetic = dark, monospace, data-dense
- Font: Atkinson Hyperlegible Mono (accessibility + terminal vibe)
- No frameworks, no bloat
- Responsive but desktop-first

**JavaScript:**
- Vanilla JS + ethers.js for Solana
- ES modules
- No unnecessary dependencies
- Comments for non-obvious wallet/RPC logic

## Testing

Local dev:
```bash
npm run dev      # Development server
npm run build    # Production build
npm run preview  # Preview production build
```

Build must succeed. Test in multiple browsers if you touch layout.

## Deployment

Deployed to GitHub Pages via `npm run deploy`.

Only maintainers deploy. PRs get merged, then deployed.

## Pull Requests

1. Fork the repo
2. Create a branch: `git checkout -b improve-layout`
3. Make your changes
4. Test locally: `npm run build && npm run preview`
5. Push and open a PR

**PR checklist:**
- [ ] Builds successfully
- [ ] Tested in browser
- [ ] No console errors
- [ ] Bloomberg aesthetic maintained

We merge fast or reject fast. No stale PRs.

## Issues

- **Bug?** Include browser, screenshot if visual
- **UI improvement?** Explain why it fits the aesthetic
- **Feature?** Does it serve the core mission (display WhatDay oracle)?

Labels:
- `bug` — Something's broken
- `enhancement` — New feature or improvement
- `design` — Visual/UX changes
- `documentation` — Docs need fixing

## Design Philosophy

- **Immutability as feature** — Simple, resistant to feature creep
- **Data density** — Information over decoration
- **Terminal aesthetic** — Monospace, dark, functional
- **Accessibility** — Atkinson Hyperlegible font for a reason

If it doesn't serve the mission (displaying WhatDay's oracle), it doesn't belong.

## Community Handoff

This project is designed to make itself unnecessary. The goal is community ownership. Contribute like you'll maintain it.

## Contact

Maintainer: [@depatchedmode](https://github.com/depatchedmode) (Ryan Betts)

---

*"What day is it? The market decides."*
