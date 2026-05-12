const { initializeApp } = require('firebase/app');
const { getFirestore, collection, setDoc, doc } = require('firebase/firestore');
const https = require('https');

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

const TOPICS = [
    "High Consciousness", "Sacred Art", "Metaphysical Architecture", 
    "Sacred Geometry books", "Divine Feminine books", "Ancient wisdom texts",
    "Psychology of presence", "Esoteric philosophy", "Mindful living books",
    "Spiritual awakening", "Soul and Ego", "Universal intelligence"
];

function fetchBooks(topic) {
    return new Promise((resolve, reject) => {
        const url = `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(topic)}&maxResults=40`;
        https.get(url, (res) => {
            if (res.statusCode === 429) {
                console.log("Rate limited (429). Waiting longer...");
                resolve({ error: 429 });
                return;
            }
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    reject(e);
                }
            });
        }).on('error', (e) => reject(e));
    });
}

async function seedBooks() {
    console.log("Seeding with patient delays...");
    let count = 0;
    const targetCount = 200;
    
    for (let topic of TOPICS) {
        if (count >= targetCount) break;
        console.log(`\nTopic: ${topic}`);
        
        let data = await fetchBooks(topic);
        if (data.error === 429) {
            await new Promise(r => setTimeout(r, 5000)); // Wait 5s on 429
            data = await fetchBooks(topic);
        }

        if (data.items) {
            console.log(`Found ${data.items.length} items.`);
            for (let item of data.items) {
                if (count >= targetCount) break;
                const info = item.volumeInfo;
                const bookId = item.id;
                const book = {
                    id: bookId,
                    title: info.title || "Untitled Frequency",
                    author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                    image: info.imageLinks ? info.imageLinks.thumbnail : 'assets/Blueprint/vision_board.jpg',
                    price: 1200 + Math.floor(Math.random() * 3000),
                    category: topic.replace(' books', '').replace(' texts', ''),
                    status: 'active',
                    rare: Math.random() > 0.85,
                    description: info.description ? info.description.substring(0, 500) : 'A curated frequency.',
                    timestamp: new Date().toISOString()
                };
                await setDoc(doc(db, 'books', bookId), book);
                count++;
                if (count % 5 === 0) process.stdout.write('.');
            }
        } else {
            console.log("No items found.");
        }
        await new Promise(r => setTimeout(r, 2000)); // 2s between topics
    }
    console.log(`\nFinal tally: ${count} books seeded.`);
    process.exit(0);
}

seedBooks();
