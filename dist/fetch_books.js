const TOPICS = [
    "Philosophy", "Psychology", "Spirituality", "Mysticism", "Sacred Rituals", 
    "Consciousness", "Ancient Wisdom", "Metaphysics", "Stoicism", "Buddhism", 
    "Yoga Anatomy", "Alchemy", "Self-Transform", "Mindfulness", "Zen Practice", 
    "Theology", "Comparative Mythology", "Jungian Archetypes", "Esoteric Wisdom", 
    "Transcendentalism"
];

async function fetchBooks() {
    console.log("Fetching 200 books...");
    let allBooks = [];
    for (let topic of TOPICS) {
        console.log(`Topic: ${topic}...`);
        try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(topic)}&maxResults=10`);
            const data = await res.json();
            if (data.items) {
                for (let item of data.items) {
                    const info = item.volumeInfo;
                    allBooks.push({
                        id: item.id,
                        title: info.title || "Untitled",
                        author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                        img: info.imageLinks ? info.imageLinks.thumbnail : '',
                        price: 1800 + Math.floor(Math.random() * 2000),
                        category: topic,
                        description: info.description || ''
                    });
                }
            }
            await new Promise(r => setTimeout(r, 100));
        } catch (e) {
            console.error(`Error ${topic}:`, e.message);
        }
    }
    const fs = require('fs');
    fs.writeFileSync('books_temp.json', JSON.stringify(allBooks, null, 2));
    console.log(`Saved ${allBooks.length} books to books_temp.json`);
    process.exit(0);
}

fetchBooks();
