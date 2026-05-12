const { initializeApp } = require('firebase/app');
const { getFirestore, collection, setDoc, doc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBYc4qoxM22kPu4Y9Pl-b-YpcNFu9gxdFc",
  authDomain: "domiiniquedb.firebaseapp.com",
  projectId: "domiiniquedb",
  storageBucket: "domiiniquedb.firebasestorage.app",
  messagingSenderId: "651039104149",
  appId: "1:651039104149:web:658b8235f5134a8fda4f9c",
  measurementId: "G-F34V0JR3GE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TOPICS = [
    "Philosophy", "Psychology" // Test with just 2 topics first
];

async function seedBooks() {
    console.log("Seeding 200 books from internet...");
    let count = 0;
    for (let topic of TOPICS) {
        console.log(`Fetching books for: ${topic}...`);
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(topic)}&maxResults=10`);
            const data = await res.json();
            if (data.items) {
                for (let item of data.items) {
                    const info = item.volumeInfo;
                    const book = {
                        id: item.id,
                        title: info.title || "Untitled",
                        author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                        img: info.imageLinks ? info.imageLinks.thumbnail : '',
                        price: 1800 + Math.floor(Math.random() * 2000),
                        category: topic,
                        status: 'active',
                        rare: Math.random() > 0.8,
                        description: info.description || '',
                        joinedAt: new Date().toISOString()
                    };
                    await setDoc(doc(db, 'books', book.id), book);
                    count++;
                }
            }
            // Small delay to respect API limits
            await new Promise(r => setTimeout(r, 200));
        } catch (e) {
            console.error(`Error for ${topic}:`, e.message);
        }
    }
    console.log(`Successfully seeded ${count} books!`);
    process.exit(0);
}

seedBooks();
