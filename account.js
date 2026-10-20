/*
 * Google sign-in + cloud sync (Firebase Auth + Firestore), loaded on demand
 * from the Firebase CDN. Each player owns one document: users/{uid}.
 * Without a Firebase config (config.js) the game simply stays local-only.
 */
const Account = (() => {
  "use strict";

  const SDK = "https://www.gstatic.com/firebasejs/10.14.1/";
  const SAVE_DELAY = 1200;
  const cfg = (window.SUCOBAN && window.SUCOBAN.firebase) || null;
  const available = !!(cfg && cfg.apiKey && cfg.projectId);

  let fb = null;
  let user = null;
  let ready = false;
  let busy = false;
  let error = null;
  let saveTimer = null;
  let pending = null;
  const listeners = [];
  const notify = () => listeners.forEach((fn) => fn());

  const userDoc = () => fb.fs.doc(fb.db, "users", user.uid);

  async function load() {
    const [app, auth, fs] = await Promise.all([
      import(SDK + "firebase-app.js"),
      import(SDK + "firebase-auth.js"),
      import(SDK + "firebase-firestore.js"),
    ]);
    const a = app.initializeApp(cfg);
    fb = { auth: auth.getAuth(a), db: fs.getFirestore(a), authMod: auth, fs };
    auth.onAuthStateChanged(fb.auth, onAuth);
  }

  async function fetchRemote() {
    const snap = await fb.fs.getDoc(userDoc());
    return snap.exists() ? snap.data().progress : null;
  }

  function flush() {
    if (!pending || !user) return;
    const progress = pending;
    pending = null;
    clearTimeout(saveTimer);
    fb.fs.setDoc(userDoc(), { progress, updatedAt: fb.fs.serverTimestamp() })
      .catch((e) => console.warn("[Sucoban] cloud save failed", e));
  }

  function scheduleSave(data) {
    pending = JSON.parse(JSON.stringify(data));
    clearTimeout(saveTimer);
    saveTimer = setTimeout(flush, SAVE_DELAY);
  }

  async function onAuth(u) {
    flush();
    user = u;
    if (u) {
      try {
        const merged = Progress.attachUser(u.uid, await fetchRemote());
        Progress.setRemoteSaver(scheduleSave);
        scheduleSave(merged);
        error = null;
      } catch (e) {
        console.warn("[Sucoban] cloud load failed", e);
        error = "syncError";
      }
    } else {
      Progress.detachUser();
    }
    ready = true;
    notify();
  }

  // Pick up progress made on other devices when the player returns to this tab.
  async function refresh() {
    if (!user) return;
    try {
      const remote = await fetchRemote();
      if (remote) Progress.mergeRemote(remote);
    } catch (e) { /* offline: keep local copy */ }
  }

  async function signIn() {
    if (!fb || busy) return;
    busy = true; error = null; notify();
    const { GoogleAuthProvider, signInWithPopup, signInWithRedirect } = fb.authMod;
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ prompt: "select_account" });
    try {
      await signInWithPopup(fb.auth, provider);
    } catch (e) {
      if (e && e.code === "auth/popup-blocked") {
        await signInWithRedirect(fb.auth, provider);
      } else if (!(e && /popup-closed|cancelled-popup/.test(e.code))) {
        console.warn("[Sucoban] sign-in failed", e);
        error = "signInError";
      }
    } finally {
      busy = false; notify();
    }
  }

  async function signOut() {
    if (!fb || !user) return;
    flush();
    await fb.authMod.signOut(fb.auth);
  }

  function init() {
    if (!available) {
      if (Progress.uid) Progress.detachUser({ keepLocal: true });
      return;
    }
    load().catch((e) => {
      console.warn("[Sucoban] Firebase failed to load", e);
      error = "syncError"; ready = true; notify();
    });
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) flush(); else refresh();
    });
    window.addEventListener("pagehide", flush);
  }

  return {
    init, signIn, signOut,
    get available() { return available; },
    get ready() { return ready; },
    get busy() { return busy; },
    get user() { return user; },
    get error() { return error; },
    onChange(fn) { listeners.push(fn); },
  };
})();
