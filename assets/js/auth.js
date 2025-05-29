// assets/js/auth.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.22.1/firebase-app.js";
import {
    getAuth,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    updateProfile
} from "https://www.gstatic.com/firebasejs/9.22.1/firebase-auth.js";

// Ensure firebaseConfig is loaded (it should be a global variable from firebase-config.js)
if (typeof firebaseConfig === 'undefined') {
    console.error('Firebase config object not found. Ensure firebase-config.js is loaded before auth.js');
    // Display a more user-friendly error or stop execution
    document.body.insertAdjacentHTML('afterbegin', '<p style="color:red;text-align:center;padding:20px;background:white;border-bottom:2px solid red;position:fixed;width:100%;top:0;left:0;z-index:9999;">Critical Error: Firebase configuration is missing. Application cannot initialize authentication.</p>');
    throw new Error("Firebase configuration is missing."); // Stop further execution of this script
}

let app;
let auth;

try {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    console.log("Firebase App initialized in auth.js using v9 modular SDK.");
} catch (e) {
    console.error("Error initializing Firebase in auth.js: ", e);
    document.body.insertAdjacentHTML('afterbegin', '<p style="color:red;text-align:center;padding:20px;background:white;border-bottom:2px solid red;position:fixed;width:100%;top:0;left:0;z-index:9999;">Error initializing Firebase. Application cannot start. Please check console.</p>');
    throw e; // Re-throw to stop execution if Firebase init fails
}

class AuthManager {
    constructor() {
        this.auth = auth;
        this.currentUser = null;
        this.unsubscribeAuthStateObserver = null; 

        if (this.auth) {
            this.initAuthStateObserver();
        } else {
            console.error("Firebase Auth instance not available after initialization attempt.");
        }
    }

    initAuthStateObserver() {
        this.unsubscribeAuthStateObserver = onAuthStateChanged(this.auth, user => {
            if (user) {
                this.currentUser = {
                    uid: user.uid,
                    email: user.email,
                    emailVerified: user.emailVerified,
                    displayName: user.displayName,
                };
                console.log("User is signed in:", this.currentUser);
                this.handleUserSignedIn(user);
            } else {
                this.currentUser = null;
                console.log("User is signed out.");
                this.handleUserSignedOut();
            }
        });
    }
    
    handleUserSignedIn(user) {
        const currentPath = window.location.pathname;
        const onAuthPage = currentPath.includes('login.html') || currentPath.includes('register.html');

        if (onAuthPage && user.emailVerified) {
            console.log("User signed in and verified on auth page, redirecting to /index.html");
            window.location.href = '/index.html';
        } else if (currentPath.includes('profile.html') && !user.emailVerified) {
            // If on profile page but email is not verified, consider redirecting or disabling features.
            // For now, profile page script will handle UI based on verification status.
            // console.log("User on profile page but email not verified.");
            // alert("Please verify your email to fully use your profile."); // Optional alert
        }
        // Further UI updates can be triggered by custom events or direct calls from other modules
        document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { loggedIn: true, user: this.currentUser } }));
    }

    handleUserSignedOut() {
        const currentPath = window.location.pathname;
        // Define pages that require authentication
        const protectedPages = ['/profile.html', '/admin/']; // Ensure leading slash if pathname has it
        
        // Check if the current path starts with any of the protected page bases
        const onProtectedPage = protectedPages.some(pageBase => currentPath.startsWith(pageBase) || currentPath.endsWith(pageBase));

        if (onProtectedPage) {
            console.log(`User signed out on a protected page (${currentPath}), redirecting to /login.html`);
            window.location.href = `/login.html?redirect=${encodeURIComponent(currentPath)}`;
        }
        document.dispatchEvent(new CustomEvent('authStateChanged', { detail: { loggedIn: false, user: null } }));
    }

    async updateProfile(profileData) { // e.g., { displayName: "New Name" }
        if (!this.auth.currentUser) {
            const errorMsg = "No user logged in to update profile.";
            this.handleAuthError(errorMsg); // Already alerts
            throw new Error(errorMsg); // Re-throw for the caller
        }
        try {
            await updateProfile(this.auth.currentUser, profileData);
            // Update local currentUser object
            if (profileData.displayName !== undefined) { // Check specifically for displayName
                 this.currentUser.displayName = profileData.displayName;
            }
            // Add other fields if they are updated (e.g., photoURL)
            console.log("Profile updated successfully in AuthManager.", this.currentUser);
            document.dispatchEvent(new CustomEvent('userProfileUpdated', { detail: { ...this.currentUser } })); // Dispatch event with updated user
        } catch (error) {
            this.handleAuthError(`Profile update failed: ${error.message}`, error); // Already alerts
            throw error; // Re-throw for the caller to handle UI
        }
    }

    async sendCurrentUserEmailVerification() {
        if (!this.auth.currentUser) {
            const errorMsg = "No user logged in to send verification email.";
            this.handleAuthError(errorMsg);
            throw new Error(errorMsg);
        }
        if (this.auth.currentUser.emailVerified) {
            alert("Your email is already verified.");
            return; // Not an error, just informational
        }
        try {
            await sendEmailVerification(this.auth.currentUser);
            alert('Verification email sent! Please check your inbox.');
            console.log('Verification email sent to:', this.auth.currentUser.email);
        } catch (error) {
            this.handleAuthError(`Failed to send verification email: ${error.message}`, error);
            throw error; 
        }
    }

    async register(email, password, displayName) {
        if (!this.auth) return this.handleAuthError("Registration service is unavailable.");
        try {
            const userCredential = await createUserWithEmailAndPassword(this.auth, email, password);
            await updateProfile(userCredential.user, { displayName: displayName });
            await sendEmailVerification(userCredential.user);
            alert('Registration successful! Please check your email to verify your account.');
            console.log('User registered:', userCredential.user);
            window.location.href = '/login.html?message=verify-email';
            return userCredential.user;
        } catch (error) {
            this.handleAuthError(`Registration failed: ${error.message}`, error);
        }
    }

    async login(email, password) {
        if (!this.auth) return this.handleAuthError("Login service is unavailable.");
        try {
            const userCredential = await signInWithEmailAndPassword(this.auth, email, password);
            if (!userCredential.user.emailVerified) {
                alert('Please verify your email before logging in. A new verification email can be sent if needed from the login page after attempting to log in again.');
                // Consider re-sending: await sendEmailVerification(userCredential.user);
                await signOut(this.auth); 
                return null; 
            }
            console.log('User logged in:', userCredential.user);
            alert('Login successful!');
            window.location.href = '/index.html';
            return userCredential.user;
        } catch (error) {
            this.handleAuthError(`Login failed: ${error.message}`, error);
        }
    }

    async logout() {
        if (!this.auth) return this.handleAuthError("Logout service is unavailable.");
        try {
            await signOut(this.auth);
            console.log('User logged out');
            // alert('You have been logged out.'); // This can be intrusive.
            window.location.href = '/login.html';
        } catch (error) {
            this.handleAuthError(`Logout failed: ${error.message}`, error);
        }
    }

    async resetPassword(email) {
        if (!this.auth) return this.handleAuthError("Password reset service is unavailable.");
        try {
            await sendPasswordResetEmail(this.auth, email);
            alert('Password reset email sent! Please check your inbox.');
            console.log('Password reset email sent to:', email);
        } catch (error) {
            this.handleAuthError(`Password reset failed: ${error.message}`, error);
        }
    }
    
    handleAuthError(message, error = null) {
        console.error(message, error || '');
        alert(message); // Simple alert, can be replaced by a more sophisticated notification system
        if (error) throw error; 
    }

    getCurrentUser() {
        // Return the locally stored currentUser object
        return this.currentUser;
    }

    isUserLoggedIn() {
        // More robust check directly from Firebase auth state if available
        return !!(this.auth && this.auth.currentUser);
    }
    
    isUserEmailVerified() {
        return this.isUserLoggedIn() && this.auth.currentUser.emailVerified;
    }

    cleanup() {
        if (this.unsubscribeAuthStateObserver) {
            this.unsubscribeAuthStateObserver();
            console.log("Auth state observer unsubscribed.");
        }
    }
}

// Instantiate AuthManager and make it globally available
// This assumes `auth.js` is loaded as a module.
// If not, `window.authManager = new AuthManager();` would be more direct for global access.
// For ES modules, other modules should import AuthManager or its instance if needed.
// For now, making it global for easy access from HTML event handlers or non-module scripts.
window.authManager = new AuthManager();
console.log("AuthManager instance (v9 SDK) created and available globally as window.authManager.");

// Example of listening to the custom event
// document.addEventListener('authStateChanged', (event) => {
//   console.log('Auth State Changed Event:', event.detail);
//   if (event.detail.loggedIn) {
//     // Update UI for logged-in user
//   } else {
//     // Update UI for logged-out user
//   }
// });
