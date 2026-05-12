const { initializeApp } = require('firebase/app');
const { getFirestore, setDoc, doc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

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

async function seedLocal() {
    console.log("Reading book_data.json...");
    const raw = fs.readFileSync(path.join(__dirname, 'book_data.json'), 'utf8');
    const localBooks = JSON.parse(raw);
    
    console.log(`Found ${localBooks.length} local books. Seeding to reach 200...`);
    
    let totalCount = 0;
    const target = 200;
    
    // First pass: local books
    for (let b of localBooks) {
        if (totalCount >= target) break;
        const id = b.id || `local-${totalCount}`;
        const book = {
            id: id,
            title: b.title,
            author: b.author,
            category: b.category || 'Curated',
            description: b.description || 'A timeless piece of wisdom.',
            price: parseInt(b.price.toString().replace(/,/g, '')) || 1500,
            image: b.image || 'assets/Blueprint/vision_board.jpg',
            status: 'active',
            rare: Math.random() > 0.8,
            timestamp: new Date().toISOString()
        };
        await setDoc(doc(db, 'books', id), book);
        totalCount++;
    }
    
    // Second pass: variations to reach 200
    const themes = ["Vibrational", "Quantum", "Ancient", "Sacred", "Divine", "Hermetic", "Alchemical"];
    while (totalCount < target) {
        const template = localBooks[totalCount % localBooks.length];
        const theme = themes[Math.floor(Math.random() * themes.length)];
        const id = `vari-${totalCount}`;
        const book = {
            id: id,
            title: `${theme} ${template.title}`,
            author: template.author,
            category: template.category,
            description: `A deeper exploration into the ${theme.toLowerCase()} aspects of ${template.title}.`,
            price: (parseInt(template.price.toString().replace(/,/g, '')) || 1500) + 500,
            image: template.image,
            status: 'active',
            rare: true,
            timestamp: new Date().toISOString()
        };
        await setDoc(doc(db, 'books', id), book);
        totalCount++;
    }
    
    console.log(`Successfully seeded ${totalCount} books.`);
    process.exit(0);
}

seedLocal().catch(console.error);
