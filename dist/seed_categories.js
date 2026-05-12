const fs = require('fs');
const https = require('https');
const crypto = require('crypto');

// 1. Initialize Firebase Admin
const admin = require('firebase-admin');
let serviceAccount;
try {
  serviceAccount = require('./serviceAccountKey.json');
} catch (e) {
  console.error('CRITICAL: serviceAccountKey.json not found in root directory.');
  process.exit(1);
}

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
}
const db = admin.firestore();

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
  console.log("Fetching existing books to avoid duplicates...");
  const existingBooks = new Set();
  
  try {
    const snapshot = await db.collection('books').get();
    snapshot.forEach(doc => {
      const data = doc.data();
      if (data.title) {
        existingBooks.add(data.title.toLowerCase().trim());
      }
    });
    console.log(`Found ${existingBooks.size} existing books.`);
  } catch (err) {
    console.error("Error reading existing books:", err);
  }

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
      
      // Truncate safely, avoiding cutting emojis in half
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

      try {
        await db.collection('books').doc(docId).set({
          id: docId,
          title: title,
          author: author,
          // Node.js inherently handles string storage in the DB as UTF-8, 
          // resolving the previous ??? encoding issues seen in other environments
          description: desc,
          category: cat,
          price: price,
          image: img,
          addedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
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
