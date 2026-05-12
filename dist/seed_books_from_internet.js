const { initializeApp } = require('firebase/app');
const { getFirestore, setDoc, doc } = require('firebase/firestore');
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
    "Philosophy", "Psychology", "Spirituality", "Esoteric", "Mystery", 
    "Consciousness", "Ancient wisdom", "Metaphysics", "Mindfulness", "Alchemy"
];

function fetchFromOL(topic) {
    return new Promise((resolve, reject) => {
        const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(topic)}&limit=30`;
        https.get(url, { headers: { 'User-Agent': 'DomiiniqueArchiveBot/1.0' } }, (res) => {
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

async function startSeeding() {
    console.log("🚀 Starting Internet Seeding (Open Library)...");
    let count = 0;
    const target = 200;

    for (let topic of TOPICS) {
        if (count >= target) break;
        console.log(`\nFetching ${topic}...`);
        
        try {
            const result = await fetchFromOL(topic);
            if (result.docs && result.docs.length > 0) {
                for (let b of result.docs) {
                    if (count >= target) break;
                    
                    const id = b.key.split('/').pop(); // Extract unique part of key
                    const coverId = b.cover_i;
                    const imageUrl = coverId ? `https://covers.openlibrary.org/b/id/${coverId}-L.jpg` : 'assets/Blueprint/vision_board.jpg';
                    
                    const book = {
                        id: id,
                        title: b.title || "Untitled Wisdom",
                        author: b.author_name ? b.author_name.join(', ') : 'Unknown Author',
                        category: topic,
                        description: `A profound work exploration into ${topic.toLowerCase()}.`,
                        price: 1200 + Math.floor(Math.random() * 3300),
                        image: imageUrl,
                        status: 'active',
                        rare: Math.random() > 0.85,
                        timestamp: new Date().toISOString()
                    };
                    
                    await setDoc(doc(db, 'books', id), book);
                    count++;
                    process.stdout.write('.');
                }
            }
        } catch (e) {
            console.error(`\nError fetching ${topic}:`, e.message);
        }
        await new Promise(r => setTimeout(r, 1000)); // Respectful delay
    }

    console.log(`\n\n✅ Successfully seeded ${count} books from the internet.`);
    process.exit(0);
}

startSeeding().catch(console.error);
