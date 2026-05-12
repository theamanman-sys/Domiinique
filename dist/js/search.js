/* ============================================================
   DOMIINIQUE — search.js
   Site-wide search overlay with book + product suggestions.
   Includes Real-time Internet Import (Google Books).
   ============================================================ */
import { db } from './firebase-config.js';
import { 
    collection, 
    query, 
    where, 
    getDocs, 
    setDoc, 
    doc, 
    limit as firestoreLimit 
} from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

(function() {
    var SEARCH_PRODUCTS = [
        {title:'Sacred Aroma Oils',      type:'product', url:'shop.html',    price:'2,400 Birr'},
        {title:'Black Mahakala Incense', type:'product', url:'shop.html',    price:'980 Birr'},
        {title:'Ceremonial Candle Set',  type:'product', url:'shop.html',    price:'1,650 Birr'},
        {title:'Corinthian Wind Chimes', type:'product', url:'shop.html',    price:'3,200 Birr'},
        {title:'Artisan Mist Diffuser',  type:'product', url:'shop.html',    price:'4,500 Birr'},
        {title:'Conscious Living Journal',type:'product',url:'shop.html',    price:'1,200 Birr'},
        {title:'Sacred Tea Ceremony Set',type:'product', url:'shop.html',    price:'5,800 Birr'},
        {title:'Presence Practice Mat',  type:'product', url:'shop.html',    price:'3,800 Birr'}
    ];
    var SEARCH_PAGES = [
        {title:'Blueprint',   type:'page', url:'blueprint.html'},
        {title:'Books Archive',type:'page',url:'books.html'},
        {title:'Shop',        type:'page', url:'shop.html'},
        {title:'Packages',    type:'page', url:'packages.html'},
        {title:'About Me',    type:'page', url:'about.html'},
        {title:'Time',        type:'page', url:'time.html'},
        {title:'Inspiration', type:'page', url:'inspiration.html'},
        {title:'Journal',     type:'page', url:'journal.html'},
        {title:'Canvas',      type:'page', url:'canvas.html'},
        {title:'Portraits',   type:'page', url:'portraits.html'},
        {title:'YOU',         type:'page', url:'you.html'},
        {title:'Co-Creation', type:'page', url:'cocreation.html'}
    ];

    var books = [];
    var overlayEl = null;
    var inputEl   = null;
    var resultsEl = null;

    function init() {
        injectHTML();
        overlayEl = document.getElementById('dom-search-overlay');
        inputEl   = document.getElementById('dom-search-input');
        resultsEl = document.getElementById('dom-search-results');

        // Initialize
        closeSearch(); 

        inputEl.addEventListener('input', debounce(() => performSiteSearch(inputEl.value), 200));
        inputEl.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') closeSearch();
        });
        overlayEl.addEventListener('click', function(e) {
            if (e.target === overlayEl) closeSearch();
        });

        // Wire search buttons (any .dom-search-btn in the DOM)
        document.querySelectorAll('.dom-search-btn').forEach(function(btn) {
            btn.addEventListener('click', openSearch);
        });
    }

    function injectHTML() {
        var div = document.createElement('div');
        div.innerHTML = '<div id="dom-search-overlay">'
            + '<div id="dom-search-box">'
            + '<div id="dom-search-header">'
            + '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>'
            + '<input id="dom-search-input" type="text" placeholder="Search books, products, pages…" autocomplete="off">'
            + '<button id="dom-search-close" onclick="window.closeSearch()">✕</button>'
            + '</div>'
            + '<div id="dom-search-results"></div>'
            + '</div>'
            + '</div>';
        document.body.appendChild(div.firstChild);

        // Inject styles
        var style = document.createElement('style');
        style.textContent = [
            '#dom-search-overlay{position:fixed;inset:0;z-index:99000;background:rgba(0,0,0,.75);backdrop-filter:blur(20px);display:flex;align-items:flex-start;justify-content:center;padding-top:10vh;opacity:0;pointer-events:none;transition:opacity .3s}',
            '#dom-search-overlay.active{opacity:1;pointer-events:all}',
            '#dom-search-box{width:100%;max-width:640px;background:var(--bg2,#1a1510);border:1px solid var(--border,rgba(255,255,255,.1));border-radius:14px;overflow:hidden;box-shadow:0 40px 120px rgba(0,0,0,.8)}',
            '#dom-search-header{display:flex;align-items:center;gap:1rem;padding:1rem 1.2rem;border-bottom:1px solid var(--border,rgba(255,255,255,.1));color:var(--fg-sub,rgba(240,235,227,.5))}',
            '#dom-search-input{flex:1;background:transparent;border:none;outline:none;color:var(--fg,#f0ebe3);font-size:1rem;font-family:inherit}',
            '#dom-search-close{background:transparent;border:none;color:var(--fg-sub,rgba(240,235,227,.5));cursor:pointer;font-size:1.2rem;padding:0}',
            '#dom-search-results{max-height:60vh;overflow-y:auto;padding:.5rem 0}',
            '.dom-sr-label{font-size:.55rem;letter-spacing:.3em;text-transform:uppercase;color:var(--accent,#800020);padding:.8rem 1.2rem .4rem;display:block}',
            '.dom-sr-item{display:flex;align-items:center;gap:1rem;padding:.7rem 1.2rem;cursor:pointer;transition:background .2s;text-decoration:none;color:var(--fg,#f0ebe3)}',
            '.dom-sr-item:hover{background:rgba(255,255,255,.04)}',
            '.dom-sr-thumb{width:36px;height:48px;object-fit:cover;border-radius:3px;background:var(--bg,#0f0d0b);flex-shrink:0}',
            '.dom-sr-thumb-icon{width:36px;height:36px;border-radius:50%;background:var(--accent-soft,rgba(128,0,32,.28));display:flex;align-items:center;justify-content:center;font-size:1rem;flex-shrink:0}',
            '.dom-sr-info{flex:1;min-width:0}',
            '.dom-sr-title{font-size:.88rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
            '.dom-sr-sub{font-size:.68rem;color:var(--fg-sub,rgba(240,235,227,.5));margin-top:.1rem}',
            '.dom-sr-btn-atc{background:var(--accent,#800020);color:#fff;border:none;padding:.3rem .6rem;border-radius:4px;font-size:.6rem;text-transform:uppercase;letter-spacing:.1em;cursor:pointer;opacity:0;transition:opacity .2s}',
            '.dom-sr-item:hover .dom-sr-btn-atc{opacity:1}',
            '.dom-sr-empty{text-align:center;color:var(--fg-sub,rgba(240,235,227,.5));padding:2.5rem;font-size:.85rem}'
        ].join('');
        document.head.appendChild(style);
    }

    function openSearch() {
        if (!overlayEl) return;
        overlayEl.classList.add('active');
        setTimeout(function() { inputEl.focus(); }, 50);
    }
    window.openSearch = openSearch;

    function closeSearch() {
        if (!overlayEl) return;
        overlayEl.classList.remove('active');
        inputEl.value = '';
        resultsEl.innerHTML = '';
    }
    window.closeSearch = closeSearch;
    window.searchAddToCart = function(e, title, price, img, id) {
        e.preventDefault();
        e.stopPropagation();
        if (window.domCart) {
            window.domCart.addItem({
                id: id || Date.now().toString(),
                title: title,
                price: price,
                image: img
            });
        }
    };
      async function performSiteSearch(queryStr, targetGridId = null) {
        var q = (queryStr || '').trim().toLowerCase();
        if (!q || q.length < 2) { 
            if (targetGridId) {
                const pageGrid = document.getElementById(targetGridId);
                if (pageGrid) pageGrid.innerHTML = '<div class="dom-sr-empty">Enter at least 2 characters to search.</div>';
                const countEl = document.getElementById('results-count');
                if (countEl) countEl.textContent = `Found 0 transmissions in the Archive`;
            } else {
                resultsEl.innerHTML = ''; 
            }
            return; 
        }

        if (!targetGridId) { // Only show "Searching Library..." in overlay, not on search.html grid
            resultsEl.innerHTML = '<div class="dom-sr-empty">Searching Library…</div>';
        } else {
            const pageGrid = document.getElementById(targetGridId);
            if (pageGrid) pageGrid.innerHTML = '<div class="dom-sr-empty">Searching Library…</div>';
            const countEl = document.getElementById('results-count');
            if (countEl) countEl.textContent = `Searching...`;
        }

        // 1. Search local Firestore
        let localBooks = [];
        try {
            const qRef = query(collection(db, 'books'), firestoreLimit(40)); // Increased limit for better coverage
            const snap = await getDocs(qRef);
            snap.forEach(d => {
                const b = d.data();
                if (b.title.toLowerCase().includes(q) || b.author.toLowerCase().includes(q) || (b.category && b.category.toLowerCase().includes(q))) {
                    localBooks.push({ id: d.id, ...b });
                }
            });
        } catch (e) { console.error("Local search error", e); }

        var matchProducts = SEARCH_PRODUCTS.filter(p => p.title.toLowerCase().includes(q)).slice(0, 6);
        var matchPages    = SEARCH_PAGES.filter(p => p.title.toLowerCase().includes(q)).slice(0, 5);

        // Render both to overlay and optionally to a grid
        renderResults(localBooks, matchProducts, matchPages, targetGridId);

        // 2. Search Internet (Google Books) for real-time import
        if (q.length > 3) {
            try {
                const res = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(q)}&maxResults=12&key=AIzaSyArOatx6mi-loTY5YkUHZONEzR5CYUIZ4A`);
                const data = await res.json();
                if (data.items) {
                    const internetBooks = data.items.map(item => {
                        const info = item.volumeInfo;
                        return {
                            id: item.id,
                            title: info.title,
                            author: info.authors ? info.authors.join(', ') : 'Unknown Author',
                            image: info.imageLinks ? info.imageLinks.thumbnail : 'assets/books/book-placeholder.png',
                            price: 1800 + Math.floor(Math.random() * 2000),
                            category: info.categories ? info.categories[0] : 'General',
                            status: 'active',
                            description: info.description || ''
                        };
                    });

                    // Filter out existing local books
                    const newBooks = internetBooks.filter(ib => !localBooks.some(lb => lb.title === ib.title));
                    
                    if (newBooks.length > 0) {
                        // Automatically import top 3 to library
                        for (let nb of newBooks.slice(0, 3)) {
                            await setDoc(doc(db, 'books', nb.id), nb);
                        }
                        // Re-render with new findings
                        renderResults([...localBooks, ...newBooks], matchProducts, matchPages, targetGridId);
                    }
                }
            } catch (e) { console.error("Internet search error", e); }
        }
    }
    window.performSiteSearch = performSiteSearch;

    function escAttr(s) {
        return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/'/g, '&#39;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function renderResults(matchBooks, matchProducts, matchPages, targetGridId) {
        var html = '';
        var gridHtml = '';

        if (matchBooks.length) {
            html += '<span class="dom-sr-label">Books Archive</span>';
            matchBooks.forEach(function(book) {
                const bTitle = book.title || 'Untitled';
                const bPrice = book.price || 1500;
                const bImg = book.image || book.img || 'assets/books/book-placeholder.png';
                const bookId = book.id || '';
                
                html += '<div class="dom-sr-item dom-sr-book" data-book-id="' + escAttr(bookId) + '" data-book-title="' + escAttr(bTitle) + '" data-book-price="' + escAttr(bPrice) + '" data-book-img="' + escAttr(bImg) + '" data-book-author="' + escAttr(book.author || '') + '" data-book-desc="' + escAttr(book.description || '') + '">'
                    + '<img class="dom-sr-thumb" src="' + escAttr(bImg) + '" onerror="this.src=\'assets/books/book-placeholder.png\'" alt="' + escAttr(bTitle) + '">'
                    + '<div class="dom-sr-info"><div class="dom-sr-title">' + escAttr(bTitle) + '</div>'
                    + '<div class="dom-sr-sub">' + escAttr(book.author || '') + ' · ' + bPrice + ' Birr</div></div>'
                    + '<button class="dom-sr-btn-atc" data-action="add-to-cart">Add +</button>'
                    + '</div>';
                
                gridHtml += `
                    <article class="shop-card reveal" style="opacity:1; transform:none;"
                        data-book-id="${escAttr(bookId)}"
                        data-book-title="${escAttr(bTitle)}"
                        data-book-author="${escAttr(book.author || '')}"
                        data-book-price="${bPrice}"
                        data-book-img="${escAttr(bImg)}"
                        data-book-desc="${escAttr((book.description || '').replace(/\n/g, ' '))}">
                        <div class="shop-card__img-wrap">
                            <img src="${escAttr(bImg)}" alt="${escAttr(bTitle)}" onerror="this.src='assets/books/book-placeholder.png'">
                            <div class="shop-card__overlay">
                                <button class="shop-card__quick" data-action="open-modal">Details</button>
                            </div>
                        </div>
                        <div class="shop-card__body">
                            <h4 class="shop-card__title">${escAttr(bTitle)}</h4>
                            <p class="shop-card__author">${escAttr(book.author || '')}</p>
                            <div class="shop-card__footer">
                                <span class="shop-card__price">${bPrice} Birr</span>
                                <button class="shop-card__cart" data-action="add-to-cart-grid">Add to Cart</button>
                            </div>
                        </div>
                    </article>
                `;
            });
        }
        
        // Products and Pages for overlay only
        if (matchProducts.length) {
            html += '<span class="dom-sr-label">Products</span>';
            matchProducts.forEach(function(p) {
                html += '<div class="dom-sr-item" onclick="location.href=\'' + p.url + '\'">'
                    + '<div class="dom-sr-thumb-icon">🛍️</div>'
                    + '<div class="dom-sr-info"><div class="dom-sr-title">' + p.title + '</div>'
                    + '<div class="dom-sr-sub">' + p.price + '</div></div>'
                    + '</div>';
            });
        }
        if (matchPages.length) {
            html += '<span class="dom-sr-label">Pages</span>';
            matchPages.forEach(function(p) {
                html += '<a class="dom-sr-item" href="' + p.url + '" onclick="window.closeSearch()">'
                    + '<div class="dom-sr-thumb-icon">📄</div>'
                    + '<div class="dom-sr-info"><div class="dom-sr-title">' + p.title + '</div></div>'
                    + '</a>';
            });
        }

        if (!html) html = '<div class="dom-sr-empty">No findings for "' + inputEl.value + '"</div>';
        resultsEl.innerHTML = html;

        // Event delegation for overlay items
        resultsEl.querySelectorAll('.dom-sr-book').forEach(function(el) {
            el.addEventListener('click', function(e) {
                if (e.target.dataset.action === 'add-to-cart') {
                    window.searchAddToCart(e, el.dataset.bookTitle, el.dataset.bookPrice, el.dataset.bookImg, el.dataset.bookId);
                } else {
                    location.href = 'books.html';
                }
            });
        });

        // Event delegation for search grid
        const pageGrid = document.getElementById('search-results-grid');
        if (targetGridId && pageGrid) {
            pageGrid.innerHTML = gridHtml || '<div class="dom-sr-empty">No books found matching your query.</div>';

            pageGrid.querySelectorAll('.shop-card').forEach(function(card) {
                card.querySelector('[data-action="open-modal"]').addEventListener('click', function() {
                    window.openBookModalFromSearch(
                        card.dataset.bookId,
                        card.dataset.bookTitle,
                        card.dataset.bookAuthor,
                        card.dataset.bookPrice,
                        card.dataset.bookImg,
                        card.dataset.bookDesc
                    );
                });
                card.querySelector('[data-action="add-to-cart-grid"]').addEventListener('click', function() {
                    if (window.domCart) {
                        window.domCart.addItem({
                            id: card.dataset.bookId,
                            title: card.dataset.bookTitle,
                            price: parseFloat(card.dataset.bookPrice),
                            image: card.dataset.bookImg
                        });
                    }
                });
            });

            const countEl = document.getElementById('results-count');
            if (countEl) countEl.textContent = `Found ${matchBooks.length} transmissions in the Archive`;
        }
    }

    window.openBookModalFromSearch = function(id, title, author, price, img, desc) {
        window.openBookModal({
            dataset: {
                id: id,
                name: title,
                cat: author,
                price: price,
                img: img,
                desc: desc
            }
        });
    };

    function debounce(fn, ms) {
        var t;
        return function() { clearTimeout(t); t = setTimeout(fn, ms); };
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
})();
