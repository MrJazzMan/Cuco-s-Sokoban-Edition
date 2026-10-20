/*
 * Sucoban — release + cloud configuration.
 *
 * `firebase` enables "Sign in with Google" and cloud sync. Leave it as null to
 * run the game local-only (the sign-in button stays hidden). These values are
 * public by design: access is enforced by the Firestore rules in
 * firestore.rules, not by keeping this object secret.
 */
window.SUCOBAN = {
  version: "2.0.0",

  firebase: null,
  // firebase: {
  //   apiKey: "…",
  //   authDomain: "your-project.firebaseapp.com",
  //   projectId: "your-project",
  //   appId: "…",
  // },
};
