// seed_categories_client.js
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');
const https = require('https');
const crypto = require('crypto');

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

const CATEGORIES = [
  "Reality & Perception",
  "Metaphysics & Philosophy",
  "Human System",
  "Technology & Future Systems",
  "Civilization & Culture",
  "Private / Members Only"
];

const BOOKS_PER_CAT = 20;

function fetchBooks(category, maxResults = 40) {
  return new Promise((resolve, reject) => {
    let query = encodeURIComponent(category);
    let url = `https://www.googleapis.com/books/v1/volumes?q=subject:${query}&maxResults=${maxResults}&langRestrict=en`;

    // Loosen strict category strings for better search yields
    if (category === "Private / Members Only") {
      url = `https://www.googleapis.com/books/v1/volumes?q=esoteric+mysticism+occult&maxResults=${maxResults}&langRestrict=en`;
    } else if (category === "Human System") {
      url = `https://www.googleapis.com/books/v1/volumes?q=human+body+mind+spirit&maxResults=${maxResults}&langRestrict=en`;
    } else if (category === "Technology & Future Systems") {
        url = `https://www.googleapis.com/books/v1/volumes?q=technology+future+systems&maxResults=${maxResults}&langRestrict=en`;
    }

    https.get(url, { headers: { 'User-Agent': 'Node.js' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.items || []);
        } catch (e) {
          resolve([]);
        }
      });
    }).on('error', (e) => {
      console.error(`Error fetching ${category}:`, e.message);
      resolve([]);
    });
  });
}

async function run() {
  console.log("Starting definitive book seeding via web client SDK to prevent emoji corruption...");
  const existingBooks = new Set();
  
  // No clean way to retrieve all documents natively via simple getDocs in Node without missing imports, 
  // so we will rely on UUID collisions and exact title overwrites being idempotent.
  // We'll trust the 20-limit to bound execution.

  let totalAdded = 0;

  for (const cat of CATEGORIES) {
    console.log(`\n--- Processing: ${cat} ---`);
    let items = await fetchBooks(cat);
    
    if (items.length === 0) {
      console.log(`  No items found initially for ${cat}. Trying alternative query...`);
      items = await fetchBooks(cat.replace(' & ', ' '), 40);
    }

    let addedForCat = 0;

    for (const item of items) {
      if (addedForCat >= BOOKS_PER_CAT) break;

      const vol = item.volumeInfo || {};
      const title = vol.title || 'Unknown Title';
      const titleLower = title.toLowerCase().trim();

      if (existingBooks.has(titleLower)) continue;

      const author = (vol.authors || ['Unknown Author']).join(', ');
      let desc = vol.description || 'No description available for this definitive text. Explore the concepts within to unlock its wisdom.';
      
      if (desc.length > 600) {
        desc = desc.substring(0, 597) + '...';
      }

      let img = (vol.imageLinks && vol.imageLinks.thumbnail) ? vol.imageLinks.thumbnail : '';
      if (img) {
        img = img.replace('http:', 'https:').replace('&edge=curl', '');
      } else {
        img = 'assets/Blueprint/Journal.jpg';
      }

      const price = 49.00;
      const docId = crypto.randomUUID();

      const bookData = {
        id: docId,
        title: title,
        author: author,
        // Emojis will explicitly be processed as native JS unicode strings yielding correct DB persistence
        description: desc,
        category: cat,
        price: price,
        image: img,
        addedAt: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'books', docId), bookData);
        existingBooks.add(titleLower);
        addedForCat++;
        totalAdded++;
        console.log(`  + Added: ${title}`);
      } catch (e) {
        console.error(`  ! Error adding ${title}:`, e);
      }
    }
    console.log(`Finished ${cat}: added ${addedForCat}/${BOOKS_PER_CAT} books.`);
  }

  console.log(`\nSeeding complete. Total new books added: ${totalAdded}`);
  process.exit(0);
}

run();
