/*
 * Reverse-move Sokoban level generator.
 * Starts from the SOLVED state (every crate on a target) and applies random
 * legal reverse moves (player walks + crate "pulls"). The inverse of that
 * trajectory is a valid forward solution, so every level it emits is
 * guaranteed solvable. We then scramble until enough crates are off-target.
 */
function mulberry32(a) {
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DIRS = [[1, 0], [-1, 0], [0, 1], [0, -1]];

function build(opts) {
  const { W, H, boxes, walls = 0, steps, seed } = opts;
  const rng = mulberry32(seed);
  const ri = (n) => Math.floor(rng() * n);
  const rows = H + 2, cols = W + 2;
  const key = (r, c) => r + "," + c;

  const wall = Array.from({ length: rows }, () => Array(cols).fill(false));
  for (let r = 0; r < rows; r++)
    for (let c = 0; c < cols; c++)
      if (r === 0 || c === 0 || r === rows - 1 || c === cols - 1) wall[r][c] = true;

  const floors = () => {
    const f = [];
    for (let r = 1; r <= H; r++) for (let c = 1; c <= W; c++) if (!wall[r][c]) f.push([r, c]);
    return f;
  };

  // interior walls that keep the room connected
  let placed = 0, guard = 0;
  while (placed < walls && guard++ < 400) {
    const r = 1 + ri(H), c = 1 + ri(W);
    if (wall[r][c]) continue;
    wall[r][c] = true;
    const fs = floors();
    const seen = new Set(); const st = [fs[0]];
    while (st.length) {
      const [r2, c2] = st.pop(); const k = key(r2, c2);
      if (seen.has(k)) continue; seen.add(k);
      for (const [dr, dc] of DIRS) {
        const nr = r2 + dr, nc = c2 + dc;
        if (!wall[nr][nc] && !seen.has(key(nr, nc))) st.push([nr, nc]);
      }
    }
    if (seen.size !== fs.length) { wall[r][c] = false; continue; }
    placed++;
  }

  const fs = floors();
  for (let i = fs.length - 1; i > 0; i--) { const j = ri(i + 1);[fs[i], fs[j]] = [fs[j], fs[i]]; }
  const targets = fs.slice(0, boxes).map(([r, c]) => key(r, c));
  const targetSet = new Set(targets);
  const boxSet = new Set(targets);

  let player = null;
  for (const [r, c] of fs) if (!boxSet.has(key(r, c))) { player = [r, c]; break; }
  if (!player) return null;

  for (let s = 0; s < steps; s++) {
    const [pr, pc] = player;
    const pulls = [], walks = [];
    for (const [dr, dc] of DIRS) {
      const br = pr + dr, bc = pc + dc, tr = pr - dr, tc = pc - dc;
      if (boxSet.has(key(br, bc)) && !wall[tr][tc] && !boxSet.has(key(tr, tc))) pulls.push([dr, dc]);
      const nr = pr + dr, nc = pc + dc;
      if (!wall[nr][nc] && !boxSet.has(key(nr, nc))) walks.push([dr, dc]);
    }
    if (pulls.length && (rng() < 0.72 || !walks.length)) {
      const [dr, dc] = pulls[ri(pulls.length)];
      boxSet.delete(key(pr + dr, pc + dc));
      boxSet.add(key(pr, pc));
      player = [pr - dr, pc - dc];
    } else if (walks.length) {
      const [dr, dc] = walks[ri(walks.length)];
      player = [pr + dr, pc + dc];
    }
  }

  const map = [];
  for (let r = 0; r < rows; r++) {
    let line = "";
    for (let c = 0; c < cols; c++) {
      const k = key(r, c);
      if (wall[r][c]) { line += "#"; continue; }
      const isT = targetSet.has(k), isB = boxSet.has(k), isP = player[0] === r && player[1] === c;
      if (isP) line += isT ? "+" : "@";
      else if (isB) line += isT ? "*" : "$";
      else line += isT ? "." : " ";
    }
    map.push(line.replace(/\s+$/, "")); // trim trailing spaces, loader pads
  }
  let off = 0; for (const b of boxSet) if (!targetSet.has(b)) off++;
  return { map, off };
}

function generate(cfg) {
  const need = cfg.boxes <= 3 ? cfg.boxes : cfg.boxes - 1;
  for (let seed = cfg.seed0 || 1; seed < (cfg.seed0 || 1) + 4000; seed++) {
    const res = build({ ...cfg, seed });
    if (res && res.off >= need && res.map.some((r) => r.includes("@") || r.includes("+"))) {
      return { name: cfg.name, map: res.map, seed };
    }
  }
  throw new Error("no seed for " + cfg.name);
}

const CONFIGS = [
  { name: "Oasis", W: 5, H: 3, boxes: 1, walls: 0, steps: 40 },
  { name: "Twin Dunes", W: 6, H: 4, boxes: 2, walls: 0, steps: 80 },
  { name: "Sun-Baked", W: 6, H: 4, boxes: 2, walls: 1, steps: 90 },
  { name: "Caravan", W: 7, H: 4, boxes: 3, walls: 0, steps: 120 },
  { name: "Scarab", W: 7, H: 4, boxes: 3, walls: 1, steps: 140 },
  { name: "Sandstorm", W: 7, H: 5, boxes: 3, walls: 2, steps: 160 },
  { name: "Mirage", W: 8, H: 4, boxes: 3, walls: 1, steps: 160 },
  { name: "Sphinx", W: 7, H: 5, boxes: 4, walls: 1, steps: 190 },
  { name: "Buried Tomb", W: 8, H: 5, boxes: 4, walls: 2, steps: 210 },
  { name: "Pharaoh's Vault", W: 8, H: 5, boxes: 4, walls: 2, steps: 250 },
];

const out = CONFIGS.map(generate);
// emit as pasteable JS
let js = "";
for (const lvl of out) {
  js += `      {\n        name: ${JSON.stringify(lvl.name)},\n        map: [\n`;
  js += lvl.map.map((r) => `          ${JSON.stringify(r)},`).join("\n");
  js += `\n        ],\n      },\n`;
}
console.log(js);
