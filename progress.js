/*
 * Player progress & settings, keyed by stable level ids ("beach:first-steps").
 *
 * Storage slots in localStorage:
 *   sucoban-v2:guest      progress of a player who is not signed in
 *   sucoban-v2:u:<uid>    local cache of a signed-in player's cloud progress
 *   sucoban-v2:last-uid   uid of the last signed-in player (to boot from cache)
 *
 * Signing in merges the guest slot into the account and empties it, so a shared
 * device never leaks one person's guest progress into another account.
 */
const Progress = (() => {
  "use strict";

  const PREFIX = "sucoban-v2:";
  const GUEST = PREFIX + "guest";
  const LAST_UID = PREFIX + "last-uid";
  const LEGACY_KEY = "beach-sokoban-v1";
  const userKey = (uid) => PREFIX + "u:" + uid;

  const blank = () => ({
    cleared: {}, best: {}, lastLevel: null,
    muted: false, lang: null, seenNotes: null, updatedAt: 0,
  });

  function normalize(d) {
    const b = blank();
    if (!d || typeof d !== "object") return b;
    return {
      cleared: d.cleared && typeof d.cleared === "object" ? { ...d.cleared } : {},
      best: d.best && typeof d.best === "object" ? { ...d.best } : {},
      lastLevel: typeof d.lastLevel === "string" ? d.lastLevel : null,
      muted: !!d.muted,
      lang: typeof d.lang === "string" ? d.lang : null,
      seenNotes: typeof d.seenNotes === "string" ? d.seenNotes : null,
      updatedAt: typeof d.updatedAt === "number" ? d.updatedAt : b.updatedAt,
    };
  }

  function read(key) {
    try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; }
  }
  function write(key, d) {
    try { localStorage.setItem(key, JSON.stringify(d)); } catch { /* storage full / disabled */ }
  }

  const hasProgress = (d) => Object.keys(d.cleared).length > 0 || !!d.lastLevel;

  // Union of cleared levels, lowest best score per level; settings come from
  // whichever copy was touched most recently.
  function merge(a, b) {
    a = normalize(a); b = normalize(b);
    const [newer, older] = a.updatedAt >= b.updatedAt ? [a, b] : [b, a];
    const best = { ...older.best };
    for (const [id, n] of Object.entries(newer.best)) {
      best[id] = best[id] == null ? n : Math.min(best[id], n);
    }
    return {
      cleared: { ...older.cleared, ...newer.cleared },
      best,
      lastLevel: newer.lastLevel || older.lastLevel,
      muted: newer.muted,
      lang: newer.lang || older.lang,
      seenNotes: newer.seenNotes || older.seenNotes,
      updatedAt: Math.max(a.updatedAt, b.updatedAt),
    };
  }

  // v1 stored cleared/best by flat level index; translate with the v1 level order.
  function migrateLegacy(flatIds) {
    const old = read(LEGACY_KEY);
    if (!old) return null;
    const d = blank();
    for (const i of Object.keys(old.cleared || {})) if (flatIds[i]) d.cleared[flatIds[i]] = true;
    for (const [i, n] of Object.entries(old.best || {})) if (flatIds[i]) d.best[flatIds[i]] = n;
    if (typeof old.lastLevel === "number" && flatIds[old.lastLevel]) d.lastLevel = flatIds[old.lastLevel];
    d.muted = !!old.muted;
    d.updatedAt = Date.now();
    localStorage.removeItem(LEGACY_KEY);
    return d;
  }

  let key = GUEST;
  let uid = null;
  let data = blank();
  let remoteSaver = null;
  const listeners = [];

  function init(flatIds) {
    const lastUid = localStorage.getItem(LAST_UID);
    if (lastUid) { uid = lastUid; key = userKey(lastUid); }
    data = normalize(read(key));
    const legacy = migrateLegacy(flatIds);
    if (legacy) {
      const g = merge(read(GUEST), legacy);
      write(GUEST, g);
      if (key === GUEST) data = normalize(g);
    }
  }

  function save() {
    data.updatedAt = Date.now();
    write(key, data);
    if (remoteSaver) remoteSaver(data);
  }

  function replace(d) {
    data = normalize(d);
    write(key, data);
    listeners.forEach((fn) => fn(data));
  }

  // Switch to a signed-in account. Returns the merged progress to push upstream.
  function attachUser(newUid, remote) {
    let merged = merge(read(userKey(newUid)), remote);
    const guest = normalize(read(GUEST));
    if (hasProgress(guest) || guest.seenNotes) merged = merge(merged, guest);
    localStorage.removeItem(GUEST);
    uid = newUid;
    key = userKey(newUid);
    localStorage.setItem(LAST_UID, newUid);
    replace(merged);
    return data;
  }

  // keepLocal folds the account's cached progress into the guest slot; used when
  // cloud sign-in is unavailable, so a configuration change never loses progress.
  function detachUser({ keepLocal = false } = {}) {
    if (!uid) return;
    remoteSaver = null;
    if (keepLocal) write(GUEST, merge(read(GUEST), data));
    localStorage.removeItem(userKey(uid));
    localStorage.removeItem(LAST_UID);
    uid = null;
    key = GUEST;
    replace(read(GUEST));
  }

  // Merge progress that changed on another device into the active slot.
  function mergeRemote(remote) {
    replace(merge(data, remote));
  }

  return {
    init, save, merge, attachUser, detachUser, mergeRemote,
    get data() { return data; },
    get uid() { return uid; },
    hasProgress: () => hasProgress(data),
    setRemoteSaver(fn) { remoteSaver = fn; },
    onChange(fn) { listeners.push(fn); },
  };
})();

if (typeof module !== "undefined" && module.exports) module.exports = Progress;
