const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, limit, getDocs } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBYc4qoxM22kPu4Y9Pl-b-YpcNFu9gxdFc",
  authDomain: "domiiniquedb.firebaseapp.com",
  projectId: "domiiniquedb",
  storageBucket: "domiiniquedb.firebasestorage.app",
  messagingSenderId: "651039104149",
  appId: "1:651039104149:web:658b8235f5134a8fda4f9c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function testRead() {
    try {
        const q = query(collection(db, 'books'), limit(1));
        const snapshot = await getDocs(q);
        console.log('Read success, found:', snapshot.size);
    } catch (e) {
        console.error('Read failed:', e.message);
    }
    process.exit(0);
}

testRead();
