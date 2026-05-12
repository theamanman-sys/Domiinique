const { initializeApp } = require('firebase/app');
const { getFirestore, setDoc, doc, collection, getDocs } = require('firebase/firestore');
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
    'Philosophy', 'Psychology', 'Spirituality', 'Esoteric', 'Mystery', 
    'Consciousness', 'Ancient wisdom', 'Metaphysics', 'Mindfulness',
    'Quantum physics', 'Holographic universe', 'String theory', 
    'Higher dimensions', 'Sacred geometry', 'Hermeticism', 'Occult philosophy',
    'Cognitive science', 'Existentialism', 'Alchemy', 'Theosophy',
    'Transpersonal psychology', 'Neuroplasticity', 'Integrative medicine', 
    'Astrobiology', 'Complexity science', 'Symbolism', 'Phenomenology', 
    'Post-humanism', 'Deep ecology', 'Vedic science',
    'Holographic', 'Systems', 'Conscious living', 'Modern living signatures',
    'Galactic history', 'Cybernetics', 'Epigenetics', 'Noosphere',
    'Sacred geography', 'Chronobiology'
];

function fetchFromOL(topic, offset = 0) {
    return new Promise((resolve, reject) => {
        const url = `https://openlibrary.org/subjects/${encodeURIComponent(topic.toLowerCase())}.json?limit=50&offset=${offset}`;
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
        }).on('error', reject);
    });
}

function fetchWorkDetails(workKey) {
    return new Promise((resolve, reject) => {
        const url = `https://openlibrary.org${workKey}.json`;
        https.get(url, { headers: { 'User-Agent': 'DomiiniqueArchiveBot/1.0' } }, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve(JSON.parse(data));
                } catch (e) {
                    resolve(null); // Return null on error so we don't break the loop
                }
            });
        }).on('error', (e) => resolve(null));
    });
}

async function startSeeding() {
    console.log("🚀 Starting Smart Seeding (Targeting 50-100 Books/Category, NO DUPLICATES, YES COVERS)...");
    
    // 1. Index Existing Database
    console.log("Indexing current archive...");
    const snapshot = await getDocs(collection(db, 'books'));
    let existingIds = new Set();
    let categoryCounts = {};
    
    snapshot.forEach(d => {
        const b = d.data();
        existingIds.add(d.id);
        const cat = b.category || 'General';
        categoryCounts[cat] = (categoryCounts[cat] || 0) + 1;
    });
    
    console.log(`Current Archive Size: ${existingIds.size} books.`);
    console.log("Category Distribution:", categoryCounts);

    let totalNew = 0;
    const target = 3000;

    for (let topic of TOPICS) {
        let currentCount = categoryCounts[topic] || 0;
        if (currentCount >= 100) {
            console.log(`\n✅ Category ${topic} already has ${currentCount} books. Skipping.`);
            continue;
        }

        console.log(`\nFetching ${topic} (Current: ${currentCount}, Target Min: 50, Target Max: 100)...`);
        
        for (let page = 0; page < 4; page++) {
            if (currentCount >= 100) break;
            
            try {
                const result = await fetchFromOL(topic, page * 50);
                const works = result.works || result.docs || [];
                if (works.length === 0) break;

                for (let b of works) {
                    if (currentCount >= 100) break;
                    if (!b.title) continue;

                    const id = b.key.split('/').pop();
                    
                    // Skip if already exists
                    if (existingIds.has(id)) continue;

                    // Skip if no cover
                    const coverId = b.cover_id || b.cover_i;
                    if (!coverId) continue;

                    const imageUrl = `https://covers.openlibrary.org/b/id/${coverId}-L.jpg`;
                    
                    // Author extraction
                    let author = 'Unknown Author';
                    if (b.authors && b.authors.length > 0) {
                        author = b.authors.map(a => a.name || a).join(', ');
                    } else if (b.author_name) {
                        author = b.author_name.join(', ');
                    }

                    // Fetch real description
                    let description = `A sophisticated study on the frequency of ${topic.toLowerCase()}.`;
                    const details = await fetchWorkDetails(b.key);
                    if (details && details.description) {
                        if (typeof details.description === 'string') {
                            description = details.description;
                        } else if (details.description.value) {
                            description = details.description.value;
                        }
                    } else if (b.first_sentence && b.first_sentence[0]) {
                        description = b.first_sentence[0];
                    }

                    if (description.length > 1000) description = description.substring(0, 997) + '...';

                    const book = {
                        id: id,
                        title: b.title,
                        author: author,
                        category: topic,
                        description: description,
                        price: 1500 + Math.floor(Math.random() * 4500),
                        image: imageUrl,
                        status: 'active',
                        rating: 4.5 + (Math.random() * 0.5), 
                        rare: Math.random() > 0.7,
                        timestamp: new Date().toISOString()
                    };
                    
                    await setDoc(doc(db, 'books', id), book);
                    existingIds.add(id);
                    currentCount++;
                    totalNew++;
                    
                    process.stdout.write(currentCount.toString().slice(-1));
                    await new Promise(r => setTimeout(r, 400)); // Rate limit protection
                }
            } catch (e) {
                console.error(`\nError in ${topic}:`, e.message);
                break;
            }
        }
    }
    
    console.log(`\n\n✅ Smart Seeding Complete! Added ${totalNew} new unique books with covers.`);
    process.exit(0);
}

startSeeding().catch(console.error);
