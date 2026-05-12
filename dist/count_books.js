const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getCountFromServer } = require('firebase/firestore');

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

async function countBooks() {
    const coll = collection(db, 'books');
    const snapshot = await getCountFromServer(coll);
    console.log('Total books in collection:', snapshot.data().count);
    process.exit(0);
}

countBooks().catch(err => {
    console.error(err);
    process.exit(1);
});
