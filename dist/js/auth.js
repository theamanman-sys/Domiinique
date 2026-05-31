// js/auth.js
import { auth, db } from './firebase-config.js';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut,
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-auth.js";
import { 
  doc, 
  setDoc, 
  getDoc,
  serverTimestamp,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

(function() {
    var SESSION_KEY = 'domiinique-session';

    var _isReady = false;
    var _isRegistering = false; // Flag to prevent premature sign-out during registration
    
    // ── Public API ────────────────────────────────────────────
    window.domAuth = {
        
        /**
         * Returns true if Firebase Auth has checked for an initial session.
         */
        isReady: function() { return _isReady; },

        /**
         * Register a new user with Firebase Auth and Firestore.
         * @returns {Promise<object>} {success: bool, message: string}
         */
        register: async function(username, email, password, name, phone) {
            username = (username || '').trim().toLowerCase();
            email    = (email || '').trim().toLowerCase();
            name     = (name || username).trim();
            phone    = (phone || '').trim();

            if (!username || !email || !password) {
                return {success: false, message: 'All fields are required.'};
            }
            if (!/^[a-z0-9_]{3,20}$/.test(username)) {
                return {success: false, message: 'Username must be 3-20 characters, letters/numbers/underscores only.'};
            }
            if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                return {success: false, message: 'Please enter a valid email address.'};
            }
            if (password.length < 6) {
                return {success: false, message: 'Password must be at least 6 characters.'};
            }

            try {
                _isRegistering = true;
                // Check if username already exists
                const usernameDocRef = doc(db, 'usernames', username);
                const usernameSnap = await getDoc(usernameDocRef);
                if (usernameSnap.exists()) {
                     return {success: false, message: 'This username is already taken.'};
                }

                // Create user in Firebase Auth
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;

                // Save extended profile in Firestore
                await setDoc(doc(db, 'users', user.uid), {
                    uid: user.uid,
                    username: username,
                    name: name,
                    email: email,
                    phone: phone,
                    role: 'member',
                    status: 'pending', // Reverted to pending for admin approval as requested
                    joinedAt: serverTimestamp()
                });

                // Also save a username mapping for easy lookup
                await setDoc(doc(db, 'usernames', username), { uid: user.uid, email: email });

                return {success: true, message: 'Registration successful! Your account is now pending administrator approval.'};
            } catch (error) {
                console.error("Registration error:", error);
                let msg = 'Registration failed: ' + error.message;
                if (error.code === 'auth/email-already-in-use') msg = 'This email is already registered.';
                if (error.code === 'auth/operation-not-allowed') msg = 'Email/Password accounts are not enabled in Firebase Console.';
                return {success: false, message: msg, error: error.message};
            } finally {
                _isRegistering = false;
            }
        },

        /**
         * Log in an existing approved user with Firebase Auth.
         * @returns {Promise<object>} {success: bool, message: string, user?: object}
         */
        login: async function(username, password) {
            username = (username || '').trim().toLowerCase();
            
            try {
                // Ensure auth domain is cleared first from lingering sessions
                sessionStorage.removeItem(SESSION_KEY);

                // Firebase Auth expects an email. If the user provided a username,
                // we need to look up their email from the 'usernames' collection first.
                // Alternatively, we can assume them trying both email or username.
                let emailToLogin = username;
                
                if (!emailToLogin.includes('@')) {
                    // It's a username, lookup the email directly from the 'usernames' mapping
                    // This avoids reading the protected 'users' collection before authentication
                    const usernameDocRef = doc(db, 'usernames', username);
                    const usernameSnap = await getDoc(usernameDocRef);
                    if (!usernameSnap.exists()) {
                        return {success: false, message: 'No account found with that username.'};
                    }
                    emailToLogin = usernameSnap.data().email;
                }

                const userCredential = await signInWithEmailAndPassword(auth, emailToLogin, password);
                const user = userCredential.user;

                // Check profile status in Firestore - FORCE server fetch to avoid stale cache
                const userDocRef = doc(db, 'users', user.uid);
                // getDocFromServer bypasses the local cache explicitly
                const userDocSnap = await getDoc(userDocRef); 
                
                if (!userDocSnap.exists()) {
                    await signOut(auth);
                    return {success: false, message: 'User profile not found in database.'};
                }

                const profile = userDocSnap.data();

                if (profile.status === 'rejected') {
                    await signOut(auth);
                    return {success: false, message: 'Your account has been declined. Please contact support.'};
                }
                
                // If status is 'pending', we allow them to stay authenticated in Firebase 
                // so we can watch for their approval in real-time, but we return a 
                // specialized response so the login page knows to show the pending message.
                if (profile.status === 'pending') {
                    return {
                        success: true, 
                        isPending: true,
                        message: 'Your account is pending approval. Please wait for admin confirmation.'
                    };
                }

                // If explicitly approved or role is admin, or field is missing (defaulting to member)
                // We allow access.

                // Create session (sessionStorage for fast local checks without async waiting)
                var session = {
                    uid: user.uid, 
                    username: profile.username, 
                    name: profile.name, 
                    email: profile.email,
                    role: profile.role
                };
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));

                return {success: true, message: 'Welcome, ' + profile.name + '!', user: session};

            } catch (error) {
                console.error("Login error:", error);
                let msg = 'Login failed.';
                if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password' || error.code === 'auth/invalid-credential') {
                    msg = 'Incorrect username or password.';
                } else if (error.code === 'auth/too-many-requests') {
                    msg = 'Too many failed login attempts. Please try again later.';
                } else if (error.code === 'auth/operation-not-allowed') {
                    msg = 'Email/Password login is not enabled in your Firebase Console.';
                } else {
                    msg = 'Error: ' + error.message;
                }
                return {success: false, message: msg, error: error.message};
            }
        },

        /**
         * Get currently logged-in user or null.
         * Fast sync check against sessionStorage.
         */
        getUser: function() {
            try {
                var s = sessionStorage.getItem(SESSION_KEY);
                return s ? JSON.parse(s) : null;
            } catch(e) { return null; }
        },

        /**
         * Log out current user from Firebase and local storage.
         */
        logout: async function() {
            sessionStorage.removeItem(SESSION_KEY);
            try {
                await signOut(auth);
                // Also clear cart just in case
                localStorage.removeItem('domiinique-cart');
                // Notify any listeners immediately
                window.dispatchEvent(new CustomEvent('domAuthReady', { detail: { user: null } }));
            } catch (error) {
                console.error("Logout error", error);
            }
        },

        /**
         * Check if user is logged in and optionally redirect if not.
         */
        requireLogin: function(redirectUrl) {
            if (!this.getUser()) {
                window.location.href = redirectUrl || 'login.html';
                return false;
            }
            return true;
        }
    };

    var _activeStatusListener = null;

    // ── Global Auth State Listener ────────────────────────────
    onAuthStateChanged(auth, async (user) => {
        // Clear previous listener if any
        if (_activeStatusListener) {
            _activeStatusListener();
            _activeStatusListener = null;
        }

        if (user) {
            // Check if session storage matches
            if (!sessionStorage.getItem(SESSION_KEY)) {
                try {
                    const userDocRef = doc(db, 'users', user.uid);
                    
                    // Initial check
                    const userDocSnap = await getDoc(userDocRef);
                    if (userDocSnap.exists()) {
                        const profile = userDocSnap.data();
                        
                        if (profile.status === 'approved' || profile.role === 'admin' || !profile.status) {
                            hydrateSession(user.uid, profile);
                        } else if (profile.status === 'pending') {
                            // START REAL-TIME OBSERVER for pending users
                            // This allows the user to be auto-logged-in as soon as the admin approves them
                            console.log("User pending approval... watching for status changes.");
                            _activeStatusListener = onSnapshot(userDocRef, (snap) => {
                                if (snap.exists() && snap.data().status === 'approved') {
                                    console.log("User approved in real-time! Hydrating session...");
                                    hydrateSession(user.uid, snap.data());
                                }
                            }, (err) => {
                                console.error("Status listener error:", err);
                            });
                        } else if (profile.status === 'rejected') {
                            if (!_isRegistering) await signOut(auth);
                        }
                    }
                } catch (error) {
                    console.error("Failed to sync auth state", error);
                }
            }
        } else {
            sessionStorage.removeItem(SESSION_KEY);
        }
        _isReady = true; 
        window.dispatchEvent(new CustomEvent('domAuthReady', { detail: { user: user } }));
    });

    function hydrateSession(uid, profile) {
        var session = {
            uid: uid, 
            username: profile.username || 'user', 
            name: profile.name || profile.username || 'User', 
            email: profile.email,
            profileImage: profile.photoURL || profile.profileImage || '',
            role: profile.role || 'member'
        };
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
        // Force a re-dispatch to ensure UI catches the hydrated session
        window.dispatchEvent(new CustomEvent('domAuthReady', { detail: { user: auth.currentUser } }));
    }

    // ── Global Auth UI Injection ─────────────────────────────
    // ── Global Auth UI Injection ─────────────────────────────
    function initGlobalAuthUI() {
        const user = window.domAuth.getUser();
        
        // 1. Navbar specific icons
        const navUtils = document.querySelector('.nav__utilities');
        if (navUtils) {
            let authBtn = document.getElementById('nav-auth-btn');
            if (!authBtn) {
                authBtn = document.createElement('a');
                authBtn.id = 'nav-auth-btn';
                authBtn.className = 'nav-icon-btn';
                authBtn.style.marginLeft = '10px';
                navUtils.appendChild(authBtn);
            }

            const loginIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>`;
            const logoutIcon = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;

            if (user) {
                authBtn.innerHTML = logoutIcon;
                authBtn.title = `Logout (${user.name})`;
                authBtn.ariaLabel = "Logout";
                authBtn.href = "#";
                authBtn.onclick = async (e) => {
                    e.preventDefault();
                    if(confirm("Sign out of the Archive?")) {
                        await window.domAuth.logout();
                        window.location.reload();
                    }
                };
            } else {
                authBtn.innerHTML = loginIcon;
                authBtn.title = "Login / Access Archive";
                authBtn.ariaLabel = "Login";
                authBtn.href = "login.html";
                authBtn.onclick = null;
            }
        }

        // 2. Profile Icon Sync
        document.querySelectorAll('.nav__profile-btn img').forEach(img => {
            if (user && user.profileImage) {
                img.src = user.profileImage;
            } else if (!user) {
                img.src = "assets/Blueprint/about_me.jpg";
            }
        });

        // 3. Floating Trigger (Optional/Secondary)
        const floatingWrapper = document.getElementById('dom-auth-trigger');
        if (floatingWrapper) {
            floatingWrapper.style.display = 'none'; // Fade out floating trigger as requested navbar-first
        }

    }

    // ── Update cart badges on load ────────────────────────────
    document.addEventListener('DOMContentLoaded', function() {
        if (window.updateAllBadges) window.updateAllBadges();
        
        // Minor delay to ensure Firebase state is handled by the onAuthStateChanged first
        setTimeout(initGlobalAuthUI, 500); 
    });

    // Listen for state changes to update UI instantly
    window.addEventListener('domAuthReady', initGlobalAuthUI);

})();
