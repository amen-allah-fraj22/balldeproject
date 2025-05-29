// firebase-config.js
// Firebase project configuration

const firebaseConfig = {
  apiKey: "AIzaSyDTpljoWkfD47n_T93Lx2WuuUrBVvtzCWc",
  authDomain: "tunivest-dashboard.firebaseapp.com",
  projectId: "tunivest-dashboard",
  // Note: storageBucket format is typically 'PROJECT_ID.appspot.com'.
  // The provided 'tunivest-dashboard.firebasestorage.app' is unusual.
  // If Firebase Storage issues arise, this might need correction to 'tunivest-dashboard.appspot.com'.
  storageBucket: "tunivest-dashboard.firebasestorage.app",
  messagingSenderId: "372090121157",
  appId: "1:372090121157:web:2ddf5581d2ba887492f9ac"
};

// This file primarily exports the firebaseConfig object.
// Initialization of Firebase app will be handled in other scripts like auth.js or main.js
// e.g., by importing this config.

console.log("firebase-config.js loaded. Contains user-provided Firebase project configuration.");

// To make firebaseConfig available to other scripts, you might typically use ES6 modules:
// export default firebaseConfig;
// However, since the project setup doesn't explicitly state module usage yet,
// for now, it will just define a global `firebaseConfig` when included via <script> tag.
// Or, scripts can fetch it if this script is loaded first.
// For simplicity with current structure, ensure this is loaded before scripts that need it,
// or they should explicitly load it.
// We will load this in HTML files before other JS files that depend on it.
