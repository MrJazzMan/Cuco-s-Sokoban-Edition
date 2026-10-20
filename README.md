# 🏖️ Sucoban

A themed take on the classic Sokoban crate-pushing puzzle, built with plain
HTML, CSS and JavaScript. **No build step, no dependencies.** Open `index.html`
and play.

Push every crate onto a glowing target. You can only push (never pull), and only
one crate at a time. Levels unlock one by one, so a new player only sees the level
in front of them. Everything further ahead stays a surprise. 🔒

**Current version: 2.0.0.** See [Version history](#-version-history).

## ▶️ Play

- **Live:** https://mrjazzman.github.io/Cuco-s-Sokoban-Edition/
- **Locally:** open `index.html`, or serve the folder:

```bash
python3 -m http.server 8000   # then visit http://localhost:8000
```

## 🎮 Controls

| Input | Action |
|-------|--------|
| Arrow keys / **WASD** | Move |
| Swipe on the board | Move (touch) |
| On-screen pad (in ❓ Help) | Move (mouse/touch) |
| **U** / **Z** / ↩️ | Undo, as many steps as you like, back to the start of the level |
| **R** / 🔄 | Restart the level |
| **N** / **P** / ⏭️ ⏮️ | Next / previous level (unlocked levels only) |
| **Enter** | Start from the title screen; go to the next level from the "Level cleared" card |
| **Esc** | Close a dialog |
| 🗺️ | Level select |
| 🔊 | Music on/off |

## ✨ Features

- **4 themed stages, 38 levels.** Each stage has its own player, walls, colours,
  background creatures, confetti and music.

  | # | Stage | Player | Levels |
  |---|-------|--------|--------|
  | 1 | 🏖️ Beach | 🦀 | 8 |
  | 2 | 🌴 Jungle | 🐒 | 10 |
  | 3 | 🏜️ Desert | 🐫 | 10 |
  | 4 | 🏙️ City | 🚶 | 10 |

- **Progressive unlock.** A level opens once the previous one is cleared. The
  level select only hints at the next locked stage and shows nothing beyond it.
- **Title screen.** It opens on a full-screen splash (portrait art on phones,
  landscape on tablets and desktop) with "Press ENTER to start" ("Tap to start"
  on touch screens). Next comes a **What's new** card, shown once per release,
  and then the Play / Continue screen.
- **Sign in with Google (optional).** Progress, best scores and settings sync
  across every device signed in with the same account. See
  [Accounts & saved progress](#-accounts--saved-progress).
- **English and Portuguese (pt-PT).** The language is detected from the browser
  and can be switched on the title screen or in Help.
- **Procedural music** made live with the Web Audio API, with no audio files and
  a different mood per stage. It stops completely when muted or when the tab is
  in the background.
- **Animated tiles.** The player faces the way it walks, crates "settle" when
  they land on a target, and confetti falls when you win.
- **Responsive.** The board is always scaled to fit the screen, on phones,
  tablets and desktop.

## 💾 Accounts & saved progress

Progress is stored by a **stable level id** such as `beach:first-steps`, not by
the level's position. Levels can therefore be reordered or inserted without
messing up players' progress.

| | Guest (not signed in) | Signed in with Google |
|---|---|---|
| Where it's saved | This browser on this device (`localStorage`) | Firestore (`users/{uid}`), cached in `localStorage` |
| Survives a page refresh | ✅ | ✅ |
| Same progress on other devices | ❌ | ✅ |
| Lost when | Browser data is cleared | Never (it's in the cloud) |

When a guest signs in, their guest progress is **merged** into the account:
cleared levels are combined, and the lowest move count wins for each level's best
score. The guest copy is then emptied, so another person signing in later on the
same device doesn't inherit it. Signing out goes back to an empty guest slot. The
account's progress stays in the cloud.

Progress saved by 1.x versions (`beach-sokoban-v1`) is migrated automatically on
the first visit.

### Enabling Google sign-in (one-time Firebase setup)

Until `config.js` has a Firebase config, the game runs local-only and the sign-in
button stays hidden.

1. Go to [Firebase console](https://console.firebase.google.com/) → **Add project**.
2. **Build → Authentication → Get started → Sign-in method → Google → Enable.**
3. **Authentication → Settings → Authorized domains**: add `mrjazzman.github.io`,
   plus any custom domain you use.
4. **Build → Firestore Database → Create database** (production mode). Under
   **Rules**, paste the contents of [`firestore.rules`](firestore.rules) and
   click **Publish**. These rules let each player read and write only their own
   document.
5. **Project settings → General → Your apps → Web (`</>`)** → register the app and
   copy the `firebaseConfig` values (`apiKey`, `authDomain`, `projectId`, `appId`)
   into `firebase` in [`config.js`](config.js). These values are meant to be
   public. Access is controlled by the rules, not by hiding the keys.
6. Commit and push to `main`.

Google blocks sign-in inside some in-app browsers, such as links opened inside
Instagram or Facebook on Android. Players in that situation should open the
game in Safari or Chrome.

## 🗂️ Project layout

| File | Purpose |
|------|---------|
| `index.html` | Markup: game UI, dialogs, splash, What's new, title screen |
| `style.css` | Theming, layout and animations (one block per stage theme) |
| `config.js` | Release version and the optional Firebase config |
| `i18n.js` | English / Portuguese strings, including the release notes |
| `levels.js` | Stage + level data, per-stage theme/decor/music, stable level ids |
| `progress.js` | Saved progress & settings: guest/account slots, merging, v1 migration |
| `account.js` | Google sign-in and Firestore sync, loaded only when configured |
| `music.js` | Procedural Web Audio music engine |
| `game.js` | Engine: movement, undo, unlock logic, rendering, input, intro screens |
| `assets/` | Splash images, social preview image, home-screen icon |
| `favicon.svg` | 🏖️ site icon |
| `firestore.rules` | Firestore security rules (paste into the Firebase console) |
| `verify.js` | Solver that checks every level is well-formed and solvable (dev only) |
| `gen.js` | Reverse-move level generator (dev only) |

## 🧩 Adding levels

Levels live in `levels.js` as rows of text:

```
#  wall        .  target     $  crate
*  crate on target           @  player     +  player on target
(space) floor
```

Rows don't need to be the same length. Each level's id is built from the stage
theme and its English name (`"Tide Pool"` → `beach:tide-pool`). **Renaming a
level resets its saved progress.** To rename one safely, give it an explicit
`id: "beach:tide-pool"`. Add the translated name to `levels` in `i18n.js` too.

New, guaranteed-solvable levels can be produced with the reverse-move generator.
It starts from the solved position and pulls crates backwards:

```bash
node gen.js   # prints level objects ready to paste into levels.js
```

## ✅ Level integrity

```bash
node verify.js
```

This checks that every level has exactly one player and as many crates as
targets, that no two levels share an id, and that every level can be solved,
using a breadth-first search over every reachable position. CI runs it on every
push and pull request, and **a failing level blocks the deploy**.

## 🚀 Hosting & deploy

Pushes to `main` run [`.github/workflows/deploy-pages.yml`](.github/workflows/deploy-pages.yml):

1. **verify:** `node verify.js`.
2. **deploy:** only if verify passed. It copies the game files and `assets/`
   and publishes them to **GitHub Pages**.

Pull requests run only the verify job. Hosting is GitHub Pages only. Vercel
isn't involved; it hosts only the separate personal site at `miguelg.dev`.

### Optional: custom domain

To serve the game at e.g. `gukoban.miguelg.dev`:

1. In the Cloudflare DNS for `miguelg.dev`, add a **CNAME** `gukoban` →
   `mrjazzman.github.io`, with the proxy turned off ("DNS only").
2. Repository **Settings → Pages → Custom domain**: `gukoban.miguelg.dev`.
3. Add the domain to Firebase **Authorized domains**, and update the `og:image`
   URL in `index.html`.

## 📝 Version history

- **2.0.0**: The game is now **Sucoban**. New: optional Google sign-in with
  cloud sync, a splash screen, and a What's new card. Progress is now keyed by
  stable level ids, with automatic migration from 1.x. Fixed: the board was cut
  off on phones; undo animated every crate instead of just the one you pushed;
  music kept running while muted or hidden. The "Next" button is focused when a
  level is cleared, so Enter goes straight on. CI now verifies every level
  before deploying. Added a 🏖️ site icon.
- **1.x** (Cuco's Sokoban Edition): Beach, Jungle, Desert and City stages,
  English/Portuguese, progressive unlock, procedural music.
