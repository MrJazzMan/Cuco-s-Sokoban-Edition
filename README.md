# 🏖️ Cuco's Sokoban Edition

A modern, themed take on the classic Sokoban crate-pushing puzzle — built with plain
HTML, CSS and JavaScript. **No build step, no dependencies.** Just open `index.html`.

Push every crate onto a glowing target. You can only push (never pull) and only one
crate at a time. Progress unlocks as you go — a first-time player only ever sees the
level in front of them; everything ahead stays a surprise. 🔒

## ▶️ Play

The old public URL, `https://beiradagua.info/gukoban/`, is an expired Bravenet
site. The game is published at **https://gukoban.miguelg.dev** once the DNS
steps below are in place. `miguelg.dev` and `www.miguelg.dev` stay the personal
site on Vercel; only the `gukoban` subdomain serves this game.

Open `index.html` in any modern browser, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## 🎮 Controls

| Input | Action |
|-------|--------|
| Arrow keys / **WASD** | Move |
| Swipe on the board | Move (touch) |
| On-screen ❓ pad | Move (mouse/touch) |
| **U** / **Z** | Undo (unlimited) |
| **R** | Restart level |
| **N** / **P** | Next / previous (unlocked only) |
| 🔊 button | Toggle music |

## ✨ Features

- **Three themed stages**, progressively unlocked so the journey stays a surprise.
- **Smooth animated tiles**, a player avatar that faces where it walks, and crate "settle" feedback.
- **Living backgrounds** — creatures drift across the scenery, unique to each theme.
- **Procedural music** generated live with the Web Audio API (no audio files), with a different mood per stage.
- **Progress saved** locally: best move counts, cleared levels, last level, and mute preference.
- **Undo, restart, level select**, and a help panel with the control pad.
- Fully responsive; works on desktop and mobile.

## 🗂️ Project layout

| File | Purpose |
|------|---------|
| `index.html` | Markup & scene scaffolding |
| `style.css` | Theming, layout and animations |
| `game.js` | Engine: movement, undo, unlock logic, rendering, level select |
| `levels.js` | Stage + level data and per-stage theme/decor/music config |
| `music.js` | Procedural Web Audio music engine |
| `verify.js` | BFS solver — checks every level is well-formed and solvable |
| `gen.js` | Reverse-move level generator (creates guaranteed-solvable puzzles) |

## ✅ Level integrity

Every level is verified solvable by an independent breadth-first solver:

```bash
node verify.js
```

New levels can be produced with the reverse-move generator (solvable by construction):

```bash
node gen.js
```

## 🚀 Hosting

Pushes to `main` publish the static files with GitHub Pages
(`.github/workflows/deploy-pages.yml`). Before the first deploy:

1. Repository **Settings → Pages → Source: GitHub Actions**.
2. Make the repository **public** if it is still private. Private Pages on the
   free plan are not visible on the internet.
3. In the Cloudflare DNS for `miguelg.dev`, add a **CNAME** `gukoban` →
   `mrjazzman.github.io`, with the proxy turned off (DNS only).
4. In **Settings → Pages → Custom domain**, add `gukoban.miguelg.dev`.

## 🛠️ Tech

Vanilla HTML / CSS / JavaScript. No frameworks, no bundler, no network calls.

---

© 2026 Cuco Enterprise
