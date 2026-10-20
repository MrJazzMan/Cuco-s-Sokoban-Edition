/* Verifies every level is well-formed and solvable via BFS over push-states. */
const STAGES = require("./levels.js");

function parse(map) {
  const walls = new Set();
  const targets = new Set();
  let boxes = [];
  let player = null;
  let players = 0;
  map.forEach((row, r) => {
    for (let c = 0; c < row.length; c++) {
      const ch = row[c];
      const key = r + "," + c;
      if (ch === "#") walls.add(key);
      else if (ch === ".") targets.add(key);
      else if (ch === "$") boxes.push(key);
      else if (ch === "*") { boxes.push(key); targets.add(key); }
      else if (ch === "@") { player = key; players++; }
      else if (ch === "+") { player = key; targets.add(key); players++; }
    }
  });
  return { walls, targets, boxes, player, players };
}

const DIRS = [[-1, 0], [1, 0], [0, -1], [0, 1]];

function solve(level) {
  const { walls, targets, boxes, player } = parse(level.map);
  const boxKey = (arr) => [...arr].sort().join("|");
  const start = { p: player, b: boxKey(boxes) };
  const isWin = (bSet) => [...targets].every((t) => bSet.has(t));

  const seen = new Set([start.p + "#" + start.b]);
  let frontier = [start];
  const cap = 4_000_000;
  let visited = 0;

  while (frontier.length) {
    const next = [];
    for (const state of frontier) {
      if (++visited > cap) return false;
      const boxSet = new Set(state.b.split("|"));
      if (isWin(boxSet)) return true;
      const [pr, pc] = state.p.split(",").map(Number);
      for (const [dr, dc] of DIRS) {
        const nr = pr + dr, nc = pc + dc;
        const nKey = nr + "," + nc;
        if (walls.has(nKey)) continue;
        let newBoxes = boxSet;
        if (boxSet.has(nKey)) {
          const bKey = (nr + dr) + "," + (nc + dc);
          if (walls.has(bKey) || boxSet.has(bKey)) continue;
          newBoxes = new Set(boxSet);
          newBoxes.delete(nKey);
          newBoxes.add(bKey);
        }
        const nb = [...newBoxes].sort().join("|");
        const sig = nKey + "#" + nb;
        if (seen.has(sig)) continue;
        seen.add(sig);
        next.push({ p: nKey, b: nb });
      }
    }
    frontier = next;
  }
  return false;
}

let allOk = true;

const seenIds = new Map();
STAGES.forEach((stage) => stage.levels.forEach((lvl) => {
  if (seenIds.has(lvl.id)) {
    console.log(`FAIL duplicate level id "${lvl.id}" (${seenIds.get(lvl.id)} / ${lvl.name})`);
    allOk = false;
  }
  seenIds.set(lvl.id, lvl.name);
}));
STAGES.forEach((stage, si) => {
  console.log(`\n=== Stage ${si + 1}: ${stage.name} (${stage.levels.length} levels) ===`);
  stage.levels.forEach((lvl, i) => {
    const { boxes, targets, player, players } = parse(lvl.map);
    const problems = [];
    if (players !== 1) problems.push(`players=${players}`);
    if (boxes.length !== targets.size) problems.push(`boxes=${boxes.length} targets=${targets.size}`);
    let ok = problems.length === 0;
    if (ok) ok = solve(lvl);
    if (!ok) allOk = false;
    const tag = ok ? "OK  " : "FAIL";
    console.log(`  ${tag} #${i + 1} ${lvl.name}` + (problems.length ? "  [" + problems.join(", ") + "]" : ""));
  });
});
process.exit(allOk ? 0 : 1);
