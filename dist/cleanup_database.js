const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, deleteDoc, doc } = require('firebase/firestore');

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

async function cleanupBooks() {
    console.log("🧹 Starting Database Purge...");
    
    const snapshot = await getDocs(collection(db, 'books'));
    let books = [];
    snapshot.forEach(d => books.push({ id: d.id, ...d.data() }));
    
    console.log(`Analyzing ${books.length} books...`);
    
    let toDelete = [];
    let seenTitles = new Map();
    const GENERIC_IMAGE = 'assets/Blueprint/vision_board.jpg';

    // Sort books: Newer/Ranked first so we keep those in case of duplicates
    books.sort((a, b) => {
        // Books with 'rating' (newly seeded) are prioritized
        if (a.rating && !b.rating) return -1;
        if (!a.rating && b.rating) return 1;
        // Then by timestamp
        return new Date(b.timestamp || 0) - new Date(a.timestamp || 0);
    });

    for (let book of books) {
        const titleKey = (book.title || '').toLowerCase().trim();
        
        // 1. Remove if generic image
        if (!book.image || book.image === GENERIC_IMAGE) {
            toDelete.push(book.id);
            continue;
        }

        // 2. Remove if duplicate title
        if (seenTitles.has(titleKey)) {
            toDelete.push(book.id);
            continue;
        }
        
        seenTitles.set(titleKey, book.id);
    }

    console.log(`Identified ${toDelete.length} low-quality or duplicate books for removal.`);
    
    let deletedCount = 0;
    for (let id of toDelete) {
        await deleteDoc(doc(db, 'books', id));
        deletedCount++;
        if (deletedCount % 10 === 0) process.stdout.write('.');
    }

    console.log(`\n✅ Successfully cleaned up database. ${deletedCount} entries removed.`);
    process.exit(0);
}

cleanupBooks().catch(console.error);
