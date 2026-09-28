// =====================================================
// SVOS - FIREBASE CONFIGURATION
// =====================================================

// Firebase App
import {
    initializeApp
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";

// Firebase Authentication
import {
    getAuth
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js";

// Firebase Firestore
import {
    getFirestore
} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js";


// =====================================================
// FIREBASE CONFIG
// =====================================================

const firebaseConfig = {

    apiKey: "AIzaSyB3RZoitwgOKeuYWBo4mYiJFR2MH5nd5Y0",

    authDomain: "svos-ff647.firebaseapp.com",

    projectId: "svos-ff647",

    storageBucket: "svos-ff647.firebasestorage.app",

    messagingSenderId: "842564207304",

    appId: "1:842564207304:web:a50f17133edd6d8b509bfd"

};


// =====================================================
// INITIALIZE FIREBASE
// =====================================================

const app =
    initializeApp(firebaseConfig);


// =====================================================
// FIREBASE AUTHENTICATION
// =====================================================

const auth =
    getAuth(app);


// =====================================================
// FIRESTORE DATABASE
// =====================================================

const db =
    getFirestore(app);


// =====================================================
// EXPORT
// =====================================================

export {
    app,
    auth,
    db
};