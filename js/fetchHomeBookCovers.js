// DOMIINIQUE — fetchHomeBookCovers.js
// Randomly selects 20 high-rated books from Firestore (if available) or from local data for the home page carousel

// Run on DOM ready (works even if the script runs after DOMContentLoaded)
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadHomeCarousel);
} else {
    loadHomeCarousel();
}

async function loadHomeCarousel() {
    const track = document.getElementById('home-book-grid');
    if (!track) return;

    let allBooks = [];

    // 1. Attempt Firestore Fetch (optional)
    try {
        const { db } = await import('./firebase-config.js');
        const { collection, query, where, limit, getDocs } = await import('https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js');

        // Fetch active books (sorted client-side to avoid composite index requirement)
        const q = query(
            collection(db, 'books'),
            where('status', '==', 'active'),
            limit(200)
        );

        const snapshot = await getDocs(q);
        snapshot.forEach(doc => allBooks.push({ id: doc.id, ...doc.data() }));
        console.log(`Firestore provided ${allBooks.length} books for home grid (latest uploads first).`);
    } catch (err) {
        console.warn('Firestore fetch failed or unavailable - using local fallback:', err && err.message ? err.message : err);
    }

    // 2. Fallback to local book_data.json if Firestore failed or is empty
    if (allBooks.length === 0) {
        // Derive the site root regardless of how deep the current page is.
        // e.g. http://127.0.0.1:3000/index.html  →  http://127.0.0.1:3000/book_data.json
        const root = window.location.origin;
        const pathname = window.location.pathname;
        const depth = (pathname.match(/\//g) || []).length - 1;
        let prefix = '';
        for (let i = 0; i < depth; i++) prefix += '../';

        const fallbackPaths = [
            `${root}/book_data.json`,
            `${prefix}book_data.json`,
            './book_data.json',
        ];

        const tryFetchJson = async (paths) => {
            for (const p of paths) {
                try {
                    const res = await fetch(p);
                    if (!res.ok) {
                        console.warn(`fetchHomeBookCovers: ${res.status} for ${p}`);
                        continue;
                    }
                    return await res.json();
                } catch (err) {
                    console.warn(`fetchHomeBookCovers: fetch failed for ${p}:`, err);
                }
            }
            throw new Error('All fetch attempts failed');
        };

        try {
            const localData = await tryFetchJson(fallbackPaths);
            allBooks = localData.map(b => ({
                ...b,
                status: 'active'
            }));
            console.log(`Fallback: Loaded ${allBooks.length} books from book_data.json`);
        } catch (fallbackErr) {
            console.error('Critical: Local fallback failed:', fallbackErr);
        }
    }

    if (allBooks.length === 0) {
        track.innerHTML = '<div class="error-msg">Archive currently quiet. Check back soon.</div>';
        return;
    }

    // Shuffle so each refresh shows a different selection
    const shuffle = (arr) => {
        for (let i = arr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        return arr;
    };

    // Determine a sortable timestamp for each book (supports strings and Firestore Timestamp objects)
    const getBookTime = (book) => {
        const ts = book.timestamp || book.createdAt || book.addedAt;
        if (!ts) return 0;
        if (typeof ts === 'string') return Date.parse(ts) || 0;
        if (typeof ts.toMillis === 'function') return ts.toMillis();
        if (ts instanceof Date) return ts.getTime();
        if (typeof ts === 'number') return ts;
        return 0;
    };

    // Show newest book from each category first (based on timestamp), then fill to 20 with newest remaining.
    const booksByCategory = allBooks.reduce((acc, book) => {
        const cat = (book.category || 'Uncategorized').trim();
        acc[cat] = acc[cat] || [];
        acc[cat].push(book);
        return acc;
    }, {});

    const selected = [];

    Object.values(booksByCategory).forEach(list => {
        list.sort((a, b) => getBookTime(b) - getBookTime(a));
        if (list.length) selected.push(list[0]);
    });

    // Fill remaining slots up to 8 with the newest remaining books across all categories
    const remaining = allBooks
        .filter(b => !selected.includes(b))
        .sort((a, b) => getBookTime(b) - getBookTime(a));

    for (const book of remaining) {
        if (selected.length >= 8) break;
        selected.push(book);
    }

    // Trim in case we somehow exceed 8
    const finalSelection = selected.slice(0, 8);
    
    track.innerHTML = '';
    finalSelection.forEach(book => {
        const article = document.createElement('article');
        article.className = 'shop-card reveal';
        
        const price = book.price || 1500;
        const img = book.image || 'assets/books/book-placeholder.png';
        const title = book.title || 'Untitled Wisdom';
        const author = book.author || 'Anonymous';
        const desc = book.description || 'A profound transmission from the Archive.';

        article.dataset.id = book.id;
        article.dataset.title = title;
        article.dataset.author = author;
        article.dataset.price = price;
        article.dataset.img = img;
        article.dataset.desc = desc;
        article.dataset.category = book.category || 'Knowledge';

        article.innerHTML = `
            <div class="shop-card__img-wrap">
                <img src="${img}" alt="${title}" loading="lazy" onerror="this.src='assets/books/book-placeholder.png'">
                <div class="shop-card__overlay">
                    <button class="shop-card__quick" onclick="window.openBookModal(this.closest('.shop-card'))">Details</button>
                </div>
            </div>
            <div class="shop-card__body">
                <h4 class="shop-card__title">${title}</h4>
                <p class="shop-card__author">${author}</p>
                <div class="shop-card__footer">
                    <span class="shop-card__price">${price} Birr</span>
                    <button class="shop-card__cart" onclick="if(window.domCart) window.domCart.addItem(this.closest('.shop-card'))">Add to Cart</button>
                </div>
            </div>
        `;
        track.appendChild(article);
    });

    // Ensure the newly-inserted cards are visible (reveal class is handled at init time)
    if (typeof window.initReveal === 'function') {
        window.initReveal();
    } else {
        // Fallback for setups where main.js hasn't run yet
        track.querySelectorAll('.shop-card.reveal').forEach(el => {
            el.style.opacity = '1';
            el.style.transform = 'none';
        });
    }

    // Re-initialize reveal animations if GSAP is present
    if (window.ScrollTrigger) ScrollTrigger.refresh();
}

// Modals are now handled globally by main.js
