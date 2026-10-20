/*
 * Sucoban — release + cloud configuration.
 *
 * These values are public by design: access is enforced by the Firestore rules
 * in firestore.rules, not by keeping this object secret. Set `firebase` to null
 * to run the game local-only (the sign-in button stays hidden).
 *
 * Analytics (measurementId) is intentionally not wired up.
 */
window.SUCOBAN = {
  version: "2.0.0",

  firebase: {
    apiKey: "AIzaSyAJHZeEsPXrHPN3E9zzCrpPLmQj53FqTkU",
    authDomain: "sucoban.firebaseapp.com",
    projectId: "sucoban",
    appId: "1:580049214888:web:e045bf71fbe0c3274c919d",
  },
};
