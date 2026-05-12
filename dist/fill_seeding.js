const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc } = require('firebase/firestore');
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const firebaseConfig = {
    apiKey: 'AIzaSyBYc4qoxM22kPu4Y9Pl-b-YpcNFu9gxdFc',
    authDomain: 'domiiniquedb.firebaseapp.com',
    projectId: 'domiiniquedb'
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TARGET_CATS = [
    'Post-humanism', 'Sacred geometry', 'Ancient wisdom', 'String theory', 
    'Hermeticism', 'Systems', 'Astrobiology', 'Epigenetics', 'Noosphere', 
    'Sacred geography', 'Galactic history', 'Modern living signatures', 'Conscious living'
];

async function seedCategory(cat) {
    console.log(`Filling ${cat}...`);
    try {
        const queryStr = encodeURIComponent(cat);
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${queryStr}&maxResults=40&langRestrict=en&printType=books`);
        const data = await res.json();
        
        if (!data.items) return;

        let added = 0;
        for (const item of data.items) {
            const info = item.volumeInfo;
            if (!info.imageLinks || !info.imageLinks.thumbnail) continue;
            
            const bookId = item.id;
            const bookData = {
                title: info.title,
                author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                description: info.description || '',
                image: info.imageLinks.thumbnail,
                category: cat,
                price: 1500 + Math.floor(Math.random() * 2500),
                status: 'active',
                rating: 4 + Math.random(),
                year: info.publishedDate ? info.publishedDate.substring(0, 4) : '2023'
            };

            await setDoc(doc(db, 'books', bookId), bookData);
            added++;
        }
        console.log(`Added ${added} to ${cat}`);
    } catch (e) {
        console.error(`Error seeding ${cat}:`, e.message);
    }
}

async function run() {
    for (const cat of TARGET_CATS) {
        await seedCategory(cat);
    }
    console.log('Targeted Seeding Complete.');
    process.exit(0);
}

run();
