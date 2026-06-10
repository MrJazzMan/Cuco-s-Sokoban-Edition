/* Sokoban — multi-stage game engine & UI wiring. */
(() => {
  "use strict";

  const STORE_KEY = "beach-sokoban-v1";
  const TILE = 64; // logical px; board is scaled to fit via CSS transform

  // ---- Flatten stages into a single addressable list ----
  // FLAT[i] = { name, map, stage, stageIdx, levelInStage }
  const FLAT = [];
  STAGES.forEach((stage, si) => {
    stage.levels.forEach((lv, li) => {
      FLAT.push({ ...lv, stage, stageIdx: si, levelInStage: li });
    });
  });

  // ---- DOM ----
  const $ = (id) => document.getElementById(id);
  const board = $("board");
  const elMoves = $("moveCount");
  const elPushes = $("pushCount");
  const elCrates = $("crateCount");
  const elBest = $("bestScore");
  const elPill = $("levelPill");
  const elLogo = $("logo");
  const winOverlay = $("winOverlay");
  const winStats = $("winStats");
  const confetti = $("confetti");
  const levelModal = $("levelModal");
  const levelGrid = $("levelGrid");
  const helpModal = $("helpModal");
  const decorEl = $("decor");
  const elSound = $("btnSound");
  const entryScreen = $("entryScreen");
  const entryPlay = $("entryPlay");

  // ---- Persistent progress ----
  const save = JSON.parse(localStorage.getItem(STORE_KEY) || "{}");
  const persist = () => localStorage.setItem(STORE_KEY, JSON.stringify(save));
  save.best = save.best || {};     // { flatIndex: moves }
  save.cleared = save.cleared || {}; // { flatIndex: true }

  // ---- Runtime state ----
  let idx = 0;
  let state = null;

  const key = (r, c) => r + "," + c;
  const parseKey = (k) => k.split(",").map(Number);

  // ---------- Level loading ----------
  function loadLevel(i) {
    idx = (i + FLAT.length) % FLAT.length;
    const def = FLAT[idx];
    const theme = def.stage;
    const map = def.map;
    const cols = Math.max(...map.map((r) => r.length));
    const rows = map.length;

    const walls = new Set();
    const targets = new Set();
    const boxes = [];
    let player = null;

    for (let r = 0; r < rows; r++) {
      const row = map[r];
      for (let c = 0; c < cols; c++) {
        const ch = row[c] || " ";
        const k = key(r, c);
        if (ch === "#") walls.add(k);
        else if (ch === ".") targets.add(k);
        else if (ch === "$") boxes.push({ r, c });
        else if (ch === "*") { boxes.push({ r, c }); targets.add(k); }
        else if (ch === "@") player = { r, c };
        else if (ch === "+") { player = { r, c }; targets.add(k); }
      }
    }

    state = {
      rows, cols, walls, targets, player, theme,
      moves: 0, pushes: 0, history: [], boxEls: new Map(), won: false,
    };
    state.interior = floodInterior(rows, cols, walls, player);

    applyTheme(theme);
    render(boxes);
    save.lastLevel = idx;
    persist();
    refreshStats();
    updatePill();
    winOverlay.hidden = true;
    updateNav();
    board.focus({ preventScroll: true });
  }

  function updateNav() {
    $("btnPrev").disabled = idx === 0;
    $("btnNext").disabled = !(idx + 1 < FLAT.length && unlocked(idx + 1));
  }

  function updatePill() {
    const def = FLAT[idx];
    const name = I18n.levelName(def.stage.theme, def.levelInStage, def.name);
    elPill.textContent =
      `${I18n.t("stage")} ${def.stageIdx + 1} · ${I18n.t("lvl")} ${def.levelInStage + 1} · ${name}`;
  }

  // ---------- Theming ----------
  function applyTheme(theme) {
    document.body.className = "theme-" + theme.theme;
    elLogo.textContent = `${theme.emoji} ${I18n.stageTitle(theme.theme)}`;
    const sky = document.querySelectorAll(".cloud");
    (theme.skyItems || []).forEach((emo, i) => { if (sky[i]) sky[i].textContent = emo; });
    buildDecor(theme);
    if (theme.song) Music.setSong(theme.song);
  }

  // Background critters: swimmers cross the screen, ground props sit on the floor.
  function buildDecor(theme) {
    decorEl.innerHTML = "";
    const d = theme.decor || {};
    (d.swimmers || []).forEach((s) => {
      const el = document.createElement("span");
      el.className = "swimmer " + (s.dir > 0 ? "swim-r" : "swim-l");
      el.textContent = s.e;
      el.style.top = s.y + "%";
      el.style.fontSize = s.size + "px";
      el.style.animationDuration = s.dur + "s";
      el.style.animationDelay = (s.delay || 0) + "s";
      decorEl.appendChild(el);
    });
    (d.ground || []).forEach((g, i) => {
      const el = document.createElement("span");
      el.className = "crustacean";
      el.textContent = g.e;
      el.style.left = g.x + "%";
      el.style.bottom = g.b + "%";
      el.style.fontSize = g.size + "px";
      el.style.animationDuration = 2.6 + (i % 4) * 0.6 + "s";
      el.style.animationDelay = -(i * 0.7) + "s";
      decorEl.appendChild(el);
    });
  }

  // ---------- Rendering ----------
  function render(boxes) {
    board.innerHTML = "";
    const { rows, cols, walls, targets, theme } = state;

    board.style.width = cols * TILE + 12 + "px";
    board.style.height = rows * TILE + 12 + "px";

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const k = key(r, c);
        const isWall = walls.has(k);
        if (!isWall && !state.interior.has(k)) continue;
        const cell = document.createElement("div");
        cell.className = "cell " + (isWall ? "wall" : "floor");
        if (targets.has(k)) cell.classList.add("target");
        cell.style.transform = `translate(${c * TILE + 6}px, ${r * TILE + 6}px)`;
        if (isWall) cell.textContent = theme.wall;
        board.appendChild(cell);
      }
    }

    state.boxEls.clear();
    for (const b of boxes) {
      const el = document.createElement("div");
      el.className = "actor crate";
      el.innerHTML = '<span class="ball"></span>';
      placeActor(el, b.r, b.c);
      board.appendChild(el);
      state.boxEls.set(key(b.r, b.c), el);
    }
    updateCrateStates();

    const p = document.createElement("div");
    p.className = "actor player";
    p.innerHTML = `<span class="avatar">${theme.player}</span>`;
    placeActor(p, state.player.r, state.player.c);
    state.face = theme.invertFacing ? -1 : 1;
    p.style.setProperty("--face", state.face);
    board.appendChild(p);
    state.playerEl = p;

    fitBoard();
  }

  // Interior = all non-wall cells reachable from the player.
  function floodInterior(rows, cols, walls, player) {
    const seen = new Set();
    const stack = [key(player.r, player.c)];
    while (stack.length) {
      const k = stack.pop();
      if (seen.has(k)) continue;
      seen.add(k);
      const [r, c] = parseKey(k);
      for (const [dr, dc] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const nr = r + dr, nc = c + dc;
        if (nr < 0 || nc < 0 || nr >= rows || nc >= cols) continue;
        const nk = key(nr, nc);
        if (walls.has(nk) || seen.has(nk)) continue;
        stack.push(nk);
      }
    }
    return seen;
  }

  function placeActor(el, r, c) {
    el.style.transform = `translate(${c * TILE + 6}px, ${r * TILE + 6}px)`;
    el.dataset.r = r; el.dataset.c = c;
  }

  function fitBoard() {
    const wrap = board.parentElement;
    const availW = Math.min(window.innerWidth - 28, 700);
    const reserved = 360; // header + stats + controls + footer breathing room
    const availH = window.innerHeight - reserved;
    const bw = state.cols * TILE + 12;
    const bh = state.rows * TILE + 12;
    const scale = Math.min(availW / bw, availH / bh, 1.08);
    board.style.transform = `scale(${scale})`;
    board.style.transformOrigin = "top center";
    wrap.style.width = bw * scale + "px";
    wrap.style.height = bh * scale + "px";
  }

  // ---------- Movement ----------
  const DIRS = { up: [-1, 0], down: [1, 0], left: [0, -1], right: [0, 1] };

  function move(dir) {
    if (!state || state.won) return;
    const [dr, dc] = DIRS[dir];
    const { player, walls } = state;
    const nr = player.r + dr, nc = player.c + dc;
    const nk = key(nr, nc);
    if (walls.has(nk)) { faceAndBump(dir); return; }

    let pushed = false;
    if (state.boxEls.has(nk)) {
      const br = nr + dr, bc = nc + dc, bk = key(br, bc);
      if (walls.has(bk) || state.boxEls.has(bk)) { faceAndBump(dir); return; }
      pushHistory();
      const boxEl = state.boxEls.get(nk);
      state.boxEls.delete(nk);
      state.boxEls.set(bk, boxEl);
      placeActor(boxEl, br, bc);
      boxEl.classList.remove("bump"); void boxEl.offsetWidth; boxEl.classList.add("bump");
      state.pushes++;
      pushed = true;
    } else {
      pushHistory();
    }

    player.r = nr; player.c = nc;
    placeActor(state.playerEl, nr, nc);
    state.moves++;
    faceAndBump(dir);

    if (pushed) updateCrateStates();
    refreshStats();
    checkWin();
  }

  function faceAndBump(dir) {
    const p = state.playerEl;
    if (dir === "left" || dir === "right") {
      let f = dir === "right" ? 1 : -1;
      if (state.theme.invertFacing) f = -f;
      state.face = f;
      p.style.setProperty("--face", f);
    }
    p.classList.remove("walk"); void p.offsetWidth; p.classList.add("walk");
  }

  function pushHistory() {
    state.history.push({
      player: { ...state.player },
      boxes: [...state.boxEls.keys()],
      moves: state.moves,
      pushes: state.pushes,
    });
    if (state.history.length > 500) state.history.shift();
  }

  function undo() {
    if (!state || !state.history.length) return;
    state.won = false;
    winOverlay.hidden = true;
    const snap = state.history.pop();
    state.player = { ...snap.player };
    placeActor(state.playerEl, state.player.r, state.player.c);

    const oldEls = [...state.boxEls.values()];
    state.boxEls.clear();
    snap.boxes.forEach((k, i) => {
      const [r, c] = parseKey(k);
      const el = oldEls[i];
      placeActor(el, r, c);
      state.boxEls.set(k, el);
    });
    state.moves = snap.moves;
    state.pushes = snap.pushes;
    updateCrateStates();
    refreshStats();
  }

  function updateCrateStates() {
    let done = 0;
    for (const [k, el] of state.boxEls) {
      const on = state.targets.has(k);
      el.classList.toggle("done", on);
      if (on) done++;
    }
    state._done = done;
  }

  // ---------- Win ----------
  function checkWin() {
    if (state._done === state.targets.size && state.targets.size > 0) {
      state.won = true;
      const prev = save.best[idx];
      if (prev == null || state.moves < prev) save.best[idx] = state.moves;
      save.cleared[idx] = true;
      persist();
      refreshStats();
      setTimeout(showWin, 220);
    }
  }

  function showWin() {
    const isLast = idx === FLAT.length - 1;
    winStats.textContent =
      `${state.moves} ${I18n.t("movesUnit")} · ${state.pushes} ${I18n.t("pushesUnit")}` +
      (save.best[idx] === state.moves ? "  " + I18n.t("newBest") : "");
    $("winNext").textContent = isLast ? I18n.t("finish") : I18n.t("nextLevel");
    winOverlay.hidden = false;
    launchConfetti();
  }

  // ---------- Stats ----------
  function refreshStats() {
    elMoves.textContent = state.moves;
    elPushes.textContent = state.pushes;
    elCrates.textContent = `${state._done || 0} / ${state.targets.size}`;
    const b = save.best[idx];
    elBest.textContent = b == null ? "—" : b;
  }

  // ---------- Confetti ----------
  function launchConfetti() {
    const pool = state.theme.confetti;
    confetti.innerHTML = "";
    for (let i = 0; i < 38; i++) {
      const s = document.createElement("span");
      s.textContent = pool[(Math.random() * pool.length) | 0];
      s.style.left = Math.random() * 100 + "vw";
      s.style.fontSize = 16 + Math.random() * 22 + "px";
      s.style.animationDuration = 1.8 + Math.random() * 1.8 + "s";
      s.style.animationDelay = Math.random() * 0.5 + "s";
      confetti.appendChild(s);
    }
    setTimeout(() => (confetti.innerHTML = ""), 4200);
  }

  // A level is playable only once the previous one is cleared, so a first-time
  // player can't see the stages/levels that lie ahead.
  const unlocked = (i) => i === 0 || !!save.cleared[i - 1];

  // ---------- Level select (grouped by stage, progressively revealed) ----------
  function openLevels() {
    levelGrid.innerHTML = "";
    let flat = 0;
    for (let si = 0; si < STAGES.length; si++) {
      const stage = STAGES[si];
      const stageStart = flat;

      // A stage stays hidden until its first level unlocks. Show a single
      // mystery teaser for the very next one, then reveal nothing further.
      if (!unlocked(stageStart)) {
        const lock = document.createElement("div");
        lock.className = "stage-locked";
        lock.innerHTML = `<span class="lk">🔒</span><span>${I18n.t("uncharted")}</span>` +
          `<small>${I18n.t("unchartedSub")}</small>`;
        levelGrid.appendChild(lock);
        break;
      }

      const head = document.createElement("div");
      head.className = "stage-head";
      const cleared = stage.levels.filter((_, li) => save.cleared[stageStart + li]).length;
      head.innerHTML =
        `<span>${stage.emoji} ${I18n.t("stage")} ${si + 1} · ${I18n.stageName(stage.theme)}</span>` +
        `<span class="stage-prog">${cleared}/${stage.levels.length} ⭐</span>`;
      levelGrid.appendChild(head);

      const grid = document.createElement("div");
      grid.className = "stage-grid";
      stage.levels.forEach((lvl, li) => {
        const fi = stageStart + li;
        const card = document.createElement("button");
        card.className = "level-card";
        const lvlLabel = `${I18n.t("lvl").toUpperCase()} ${li + 1}`;
        if (unlocked(fi)) {
          if (save.cleared[fi]) card.classList.add("done");
          if (fi === idx) card.classList.add("current");
          const best = save.best[fi];
          const bestTxt = best != null
            ? `${I18n.t("bestPrefix")} ${best} ${I18n.t("movesUnit")}`
            : I18n.t("notCleared");
          card.innerHTML =
            `<div class="num">${lvlLabel}</div>` +
            `<div class="nm">${I18n.levelName(stage.theme, li, lvl.name)}</div>` +
            `<div class="lv-best">${bestTxt}</div>`;
          card.addEventListener("click", () => { levelModal.hidden = true; loadLevel(fi); });
        } else {
          card.classList.add("locked");
          card.disabled = true;
          card.innerHTML =
            `<div class="num">${lvlLabel}</div>` +
            `<div class="nm lk">🔒</div>` +
            `<div class="lv-best">${I18n.t("locked")}</div>`;
        }
        grid.appendChild(card);
      });
      levelGrid.appendChild(grid);
      flat += stage.levels.length;
    }
    levelModal.hidden = false;
  }

  // ---------- Input ----------
  const KEYMAP = {
    ArrowUp: "up", ArrowDown: "down", ArrowLeft: "left", ArrowRight: "right",
    w: "up", s: "down", a: "left", d: "right",
    W: "up", S: "down", A: "left", D: "right",
  };
  const anyModalOpen = () => !levelModal.hidden || !helpModal.hidden;
  function closeModals() { levelModal.hidden = true; helpModal.hidden = true; }

  document.addEventListener("keydown", (e) => {
    if (entryScreen && !entryScreen.hidden) return; // title screen up — ignore game keys
    if (anyModalOpen()) { if (e.key === "Escape") closeModals(); return; }
    if (KEYMAP[e.key]) { e.preventDefault(); move(KEYMAP[e.key]); return; }
    if (e.key === "u" || e.key === "U" || e.key === "z" || e.key === "Z") undo();
    else if (e.key === "r" || e.key === "R") loadLevel(idx);
    else if (e.key === "n" || e.key === "N") goNext();
    else if (e.key === "p" || e.key === "P") goPrev();
    else if (e.key === "Escape") winOverlay.hidden = true;
  });

  document.querySelectorAll(".dbtn").forEach((b) =>
    b.addEventListener("click", () => move(b.dataset.dir))
  );
  // Navigation respects the lock: you can revisit past levels but not peek ahead.
  function goPrev() { if (idx > 0) loadLevel(idx - 1); }
  function goNext() { if (idx + 1 < FLAT.length && unlocked(idx + 1)) loadLevel(idx + 1); }

  $("btnUndo").addEventListener("click", undo);
  $("btnRestart").addEventListener("click", () => loadLevel(idx));
  $("btnPrev").addEventListener("click", goPrev);
  $("btnNext").addEventListener("click", goNext);
  $("btnLevels").addEventListener("click", openLevels);
  $("btnHelp").addEventListener("click", () => (helpModal.hidden = false));
  $("closeModal").addEventListener("click", () => (levelModal.hidden = true));
  $("closeHelp").addEventListener("click", () => (helpModal.hidden = true));
  levelModal.addEventListener("click", (e) => { if (e.target === levelModal) levelModal.hidden = true; });
  helpModal.addEventListener("click", (e) => { if (e.target === helpModal) helpModal.hidden = true; });
  $("winReplay").addEventListener("click", () => loadLevel(idx));
  $("winNext").addEventListener("click", () => {
    if (idx + 1 < FLAT.length) loadLevel(idx + 1); // current level just cleared → next is unlocked
    else { winOverlay.hidden = true; openLevels(); } // finished the whole game
  });

  // swipe on the board
  let touchStart = null;
  board.addEventListener("touchstart", (e) => {
    const t = e.changedTouches[0];
    touchStart = { x: t.clientX, y: t.clientY };
  }, { passive: true });
  board.addEventListener("touchend", (e) => {
    if (!touchStart) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.x, dy = t.clientY - touchStart.y;
    const ax = Math.abs(dx), ay = Math.abs(dy);
    if (Math.max(ax, ay) < 24) { touchStart = null; return; }
    if (ax > ay) move(dx > 0 ? "right" : "left");
    else move(dy > 0 ? "down" : "up");
    touchStart = null;
  }, { passive: true });

  window.addEventListener("resize", () => state && fitBoard());

  // ---------- Music ----------
  let muted = !!save.muted;
  const reflectSound = () => { elSound.textContent = muted ? "🔇" : "🔊"; };
  reflectSound();

  function kickMusic() {
    if (state && state.theme.song) Music.setSong(state.theme.song);
    Music.start();
    Music.setMuted(muted);
  }
  // Browsers require a user gesture before audio — start on the first one.
  function firstGesture() {
    if (!muted) kickMusic();
    window.removeEventListener("pointerdown", firstGesture);
    window.removeEventListener("keydown", firstGesture);
  }
  window.addEventListener("pointerdown", firstGesture);
  window.addEventListener("keydown", firstGesture);

  elSound.addEventListener("click", () => {
    muted = !muted;
    save.muted = muted; persist();
    reflectSound();
    if (!Music.isStarted() && !muted) kickMusic();
    else Music.setMuted(muted);
  });

  // ---------- Localization ----------
  // Re-render every dynamic, language-dependent string after a language change.
  function relocalize() {
    I18n.apply();
    reflectLangButtons();
    if (state) {
      elLogo.textContent = `${state.theme.emoji} ${I18n.stageTitle(state.theme.theme)}`;
      updatePill();
    }
    updateEntryPlayLabel();
    if (!levelModal.hidden) openLevels();
    if (state && state.won && !winOverlay.hidden) showWin();
  }

  const langButtons = () => document.querySelectorAll(".lang-btn");
  function reflectLangButtons() {
    const cur = I18n.getLang();
    langButtons().forEach((b) => b.classList.toggle("active", b.dataset.lang === cur));
  }
  langButtons().forEach((b) =>
    b.addEventListener("click", () => I18n.setLang(b.dataset.lang))
  );
  I18n.onChange(relocalize);

  // ---------- Entry screen ----------
  const hasProgress = () =>
    Object.keys(save.cleared).length > 0 ||
    (typeof save.lastLevel === "number" && save.lastLevel > 0);
  function updateEntryPlayLabel() {
    entryPlay.textContent = hasProgress() ? I18n.t("continueGame") : I18n.t("play");
  }
  function startGame() {
    if (entryScreen.hidden) return;
    entryScreen.hidden = true;
    if (!muted) kickMusic();
    board.focus({ preventScroll: true });
  }
  entryPlay.addEventListener("click", startGame);

  // ---------- Boot ----------
  I18n.apply();
  reflectLangButtons();
  updateEntryPlayLabel();
  const startAt = typeof save.lastLevel === "number" ? save.lastLevel : 0;
  loadLevel(startAt);
})();
