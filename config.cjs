const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || "AIzaSyArOatx6mi-loTY5YkUHZONEzR5CYUIZ4A",
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || "domiinique-db.firebaseapp.com",
  projectId: process.env.FIREBASE_PROJECT_ID || "domiinique-db",
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || "domiinique-db.firebasestorage.app",
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || "979202038788",
  appId: process.env.FIREBASE_APP_ID || "1:979202038788:web:61f9055a91f7f2da52a951",
  measurementId: process.env.FIREBASE_MEASUREMENT_ID || "G-BV91XC3N3R"
};

// Remove measurementId if not set
if (!firebaseConfig.measurementId) {
  delete firebaseConfig.measurementId;
}

module.exports = firebaseConfig;
