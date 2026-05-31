/* ============================================================
   DOMIINIQUE — main.js v8 Definitive
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    initNav();
    initMobileMenu();
    initReveal();
    initAudio();
    initCarousel();
    if (window.updateAllBadges) window.updateAllBadges();
    initBrandFont();
});

/* ═══════════════════════════════════════════════════════════
   THEME  —  html[data-theme] → CSS :root overrides
   ═══════════════════════════════════════════════════════════ */
function initTheme() {
    const btn  = document.getElementById('theme-toggle');
    const html = document.documentElement;

    const apply = (theme) => {
        html.setAttribute('data-theme', theme);
        if (btn) btn.textContent = theme === 'light' ? '☀️' : '🌙';
        window.dispatchEvent(new CustomEvent('themechange', { detail: { mode: theme } }));
    };

    apply(localStorage.getItem('domiinique-theme') || 'dark');

    if (btn) {
        btn.addEventListener('click', () => {
            const next = html.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
            localStorage.setItem('domiinique-theme', next);
            apply(next);
        });
    }
}

/* ═══════════════════════════════════════════════════════════
   NAV  —  scrolled class
   ═══════════════════════════════════════════════════════════ */
function initNav() {
    const nav = document.getElementById('nav');
    if (!nav) return;
    const check = () => nav.classList.toggle('scrolled', window.scrollY > 36);
    window.addEventListener('scroll', check, { passive: true });
    check();
}

/* ═══════════════════════════════════════════════════════════
   MOBILE MENU
   Technique: save scrollY, set body { position:fixed; top: -savedY }
   On close:  remove position:fixed, window.scrollTo(0, savedY) instantly.
   This is THE correct cross-browser approach.
   ═══════════════════════════════════════════════════════════ */
function initMobileMenu() {
    const hamburger = document.getElementById('hamburger');
    const nav       = document.getElementById('nav');
    if (!hamburger || !nav) return;

    let savedScroll = 0;

    const isOpen = () => nav.classList.contains('mobile-open');

    function openMenu() {
        savedScroll = window.scrollY;
        document.body.style.top = `-${savedScroll}px`;
        document.body.classList.add('menu-open');
        nav.classList.add('mobile-open');
        hamburger.setAttribute('aria-expanded', 'true');
    }

    function closeMenu() {
        nav.classList.remove('mobile-open');
        document.body.classList.remove('menu-open');
        document.body.style.top = '';
        hamburger.setAttribute('aria-expanded', 'false');
        window.scrollTo(0, savedScroll);
    }

    function toggle() { isOpen() ? closeMenu() : openMenu(); }

    hamburger.addEventListener('click', toggle);
    hamburger.addEventListener('keydown', e => {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); }
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && isOpen()) closeMenu(); });
    document.addEventListener('click', e => {
        if (isOpen() && !nav.contains(e.target)) closeMenu();
    });
    nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
        if (isOpen()) closeMenu();
    }));
}

/* ═══════════════════════════════════════════════════════════
   REVEAL
   ═══════════════════════════════════════════════════════════ */
function initReveal() {
    document.querySelectorAll('.reveal, .reveal-scroll').forEach(el => {
        el.style.opacity = '1'; el.style.transform = 'none';
    });
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined') return;
    gsap.registerPlugin(ScrollTrigger);

    document.querySelectorAll('.reveal').forEach(el => {
        el.style.opacity = '';
        gsap.fromTo(el,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.9, ease: 'expo.out',
              scrollTrigger: { trigger: el, start: 'top 93%', once: true }
            });
    });
}

/* ═══════════════════════════════════════════════════════════
   AUDIO  —  CONTINUOUS CROSS-PAGE PLAYBACK
   sessionStorage preserves time + playing state across navigations.
   ═══════════════════════════════════════════════════════════ */
function initAudio() {
    const audio = document.getElementById('bg-audio');
    const btn   = document.getElementById('music-btn');
    if (!audio) return;

    const SOURCES = ['assets/bg_music.mp3'];
    let srcIdx = 0;

    function loadSrc(i) {
        if (i >= SOURCES.length) return;
        audio.src = SOURCES[i];
        audio.load();
    }

    // Restore from previous page
    const savedTime  = parseFloat(sessionStorage.getItem('dom-audio-t') || '0');
    const wasPlaying = sessionStorage.getItem('dom-audio-p') === '1';
    const userOn     = localStorage.getItem('domiinique-freq') === '1';

    loadSrc(0);
    audio.volume = 0.42;

    audio.addEventListener('loadedmetadata', () => {
        if (savedTime > 0 && savedTime < audio.duration - 1) {
            audio.currentTime = savedTime;
        }
        if (wasPlaying || userOn) {
            audio.play().catch(() => {});
        }
    });

    audio.addEventListener('error', () => {
        srcIdx++;
        if (srcIdx < SOURCES.length) loadSrc(srcIdx);
    });

    // Save before navigating away
    function saveState() {
        sessionStorage.setItem('dom-audio-t', audio.currentTime.toString());
        sessionStorage.setItem('dom-audio-p', audio.paused ? '0' : '1');
    }
    window.addEventListener('pagehide',     saveState);
    window.addEventListener('beforeunload', saveState);

    // Update button UI
    function syncBtn() {
        if (!btn) return;
        const playing = !audio.paused;
        btn.classList.toggle('playing', playing);
        btn.setAttribute('aria-label', playing ? 'Pause music' : 'Play music');
    }
    audio.addEventListener('play',  syncBtn);
    audio.addEventListener('pause', syncBtn);
    syncBtn();

    // Click handler
    if (btn) {
        const toggle = (e) => {
            e.preventDefault(); e.stopPropagation();
            if (audio.paused) {
                audio.play().then(() => {
                    localStorage.setItem('domiinique-freq', '1');
                }).catch(() => {});
            } else {
                audio.pause();
                localStorage.setItem('domiinique-freq', '0');
            }
        };
        btn.addEventListener('click', toggle);
        btn.addEventListener('keydown', e => {
            if (e.key === 'Enter' || e.key === ' ') toggle(e);
        });
    }

    // Resume after first user gesture (browser autoplay policy)
    const resume = () => {
        if ((wasPlaying || userOn) && audio.paused) audio.play().catch(() => {});
    };
    ['pointerdown','keydown','touchstart'].forEach(ev =>
        document.addEventListener(ev, resume, { once: true })
    );
}

/* ═══════════════════════════════════════════════════════════
   CAROUSEL
   ═══════════════════════════════════════════════════════════ */
function initCarousel() {
    document.querySelectorAll('.carousel-track').forEach(track => {
        const root = track.closest('section') || track.parentElement.parentElement;
        const prev = root.querySelector('.prev-btn');
        const next = root.querySelector('.next-btn');
        const scrollBy = () => {
            const s = track.querySelector('.carousel-slide');
            const g = parseInt(getComputedStyle(track).columnGap) || 24;
            return s ? s.offsetWidth + g : 280;
        };
        if (next) next.addEventListener('click', () => track.scrollBy({ left:  scrollBy(), behavior: 'smooth' }));
        if (prev) prev.addEventListener('click', () => track.scrollBy({ left: -scrollBy(), behavior: 'smooth' }));
    });
}

/* ═══════════════════════════════════════════════════════════
   GLOBAL MODALS
   ═══════════════════════════════════════════════════════════ */
window.currentModalBook = null;

window.openBookModal = function(data) {
    const modal = document.getElementById('book-modal');
    if (!modal || !data) return;

    // Unified book data extraction
    let book = {};
    if (data instanceof HTMLElement) {
        const d = data.dataset;
        const title = d.title || d.name || 'Untitled Archive';
        const id = (d.id && d.id !== 'undefined') ? d.id : title.toLowerCase().replace(/[^a-z0-9]/g, '-');
        
        book = {
            id: id,
            title: title,
            author: d.author || d.cat || 'Archive',
            price: (d.price || '1500').toString().replace(/,/g, ''),
            img: d.img || d.image || (data.querySelector('img') ? data.querySelector('img').src : ''),
            desc: d.desc || d.description || "Refining the frequency of consciousness..."
        };
    } else {
        const d = data.dataset || data;
        const title = d.title || d.name || 'Untitled Archive';
        const id = (d.id && d.id !== 'undefined') ? d.id : title.toLowerCase().replace(/[^a-z0-9]/g, '-');

        book = {
            id: id,
            title: title,
            author: d.author || d.cat || 'Archive',
            price: (d.price || '1500').toString().replace(/,/g, ''),
            img: d.img || d.image || d.image,
            desc: d.desc || d.description || "Refining the frequency of consciousness..."
        };
    }

    window.currentModalBook = book;

    const modalImg = document.getElementById('modal-img');
    const modalTitle = document.getElementById('modal-title') || document.getElementById('modal-name');
    const modalAuthor = document.getElementById('modal-author') || document.getElementById('modal-cat');
    const modalDesc = document.getElementById('modal-desc');
    const modalPrice = document.getElementById('modal-price');
    const modalBenefits = document.getElementById('modal-benefits');

    if (modalImg) {
        modalImg.src = (book.img || 'assets/books/book-placeholder.png').replace('http:', 'https:');
        modalImg.onerror = function() { this.src = 'assets/books/book-placeholder.png'; };
    }
    if (modalTitle) modalTitle.textContent = book.title || 'Untitled';
    if (modalAuthor) modalAuthor.textContent = book.author || 'Archive';
    if (modalDesc) modalDesc.textContent = book.desc || "Refining the frequency of consciousness...";
    if (modalPrice) modalPrice.textContent = (book.price.toString().includes('Birr') ? book.price : book.price + ' Birr');
    if (modalBenefits) modalBenefits.innerHTML = ''; // Clear benefits from previous items

    modal.classList.add('active', 'open', 'visible');
    document.body.style.overflow = 'hidden';

    // Ensure the cart button in the modal works (supporting both ID conventions)
    const cartBtn = document.getElementById('modal-cart-btn') || document.getElementById('modal-add-btn');
    if (cartBtn) {
        cartBtn.onclick = () => {
            window.addToCartFromModal();
        };
    }
};

window.addToCartFromModal = function() {
    if (window.currentModalBook && window.domCart) {
        // Path A: opened via openBookModal() — use the stored book object
        window.domCart.addItem(window.currentModalBook);
        window.closeBookModal();
        return;
    }

    // Path B: opened via direct DOM manipulation (books.html card click)
    // Read fields from modal elements, supporting both ID conventions
    if (window.domCart) {
        const titleEl = document.getElementById('modal-title') || document.getElementById('modal-name');
        const authorEl = document.getElementById('modal-author') || document.getElementById('modal-cat');
        const priceEl  = document.getElementById('modal-price');
        const imgEl    = document.getElementById('modal-img');
        const descEl   = document.getElementById('modal-desc');

        const title  = titleEl  ? (titleEl.textContent  || '').trim() : '';
        const author = authorEl ? (authorEl.textContent || '').trim() : '';
        const price  = parseFloat((priceEl ? (priceEl.textContent || '') : '').replace(/[^0-9.]/g, '')) || 0;
        const image  = imgEl    ? imgEl.src : '';
        const desc   = descEl   ? (descEl.textContent   || '').trim() : '';

        if (title) {
            window.domCart.addItem({ title, author, price, image, desc });
            window.closeBookModal();
        }
    }
};

window.closeBookModal = function() {
    const modal = document.getElementById('book-modal');
    if (modal) {
        modal.classList.remove('visible');
        modal.classList.remove('active');
        modal.classList.remove('open');
    }
    document.body.style.overflow = '';
};

// Handle clicks outside modal content
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal-overlay') || e.target.classList.contains('book-modal')) {
        window.closeBookModal();
    }
});

/* ═══════════════════════════════════════════════════════════
   CONTACT FORM
   ═══════════════════════════════════════════════════════════ */
function handleContact(e) {
    e.preventDefault();
    const form = e.target;
    const btn = form.querySelector('[type=submit]');
    if (!btn) return;

    const name = document.getElementById('contact-name').value.trim();
    const email = document.getElementById('contact-email').value.trim();
    const sector = document.getElementById('contact-sector').value;
    const intent = document.getElementById('contact-intent').value.trim();
    const valueAlign = document.getElementById('contact-value').value.trim();

    const errorEl = document.getElementById('form-error');

    // Custom validation
    if (!name || !email || !sector || !intent || !valueAlign) {
        errorEl.textContent = 'Incomplete Signal. Please calibrate.';
        errorEl.classList.add('visible');
        return;
    }
    errorEl.classList.remove('visible');

    const original = btn.textContent;
    btn.textContent = '[ TRANSMITTING... ]';
    btn.disabled = true;

    const text = `Transmission from Domiinique Blueprint%0A%0AIDENTIFIER: ${name}%0AFREQUENCY: ${email}%0ASECTOR: ${sector}%0AINTENT: ${intent}%0AALIGNMENT: ${valueAlign}`;
    
    setTimeout(() => {
        window.open(`https://wa.me/251992013589?text=${text}`, '_blank');
        const success = document.getElementById('form-success');
        if (success) success.classList.add('visible');
        btn.textContent = original;
        btn.disabled = false;
        form.reset();
        setTimeout(() => { if (success) success.classList.remove('visible'); }, 5000);
    }, 600);
}
window.handleContact = handleContact;

/* ═══════════════════════════════════════════════════════════
   BRAND FONT  —  apply Bickham Script to every "Domiinique"
   ═══════════════════════════════════════════════════════════ */
function initBrandFont() {
    const skipParents = new Set();
    document.querySelectorAll('.nav__logo-text, .hero__logo-text, .t-serif, .t-brand, .login-logo, .sensory-hero__title-brand')
        .forEach(el => skipParents.add(el));

    const walk = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    const nodes = [];
    while (walk.nextNode()) nodes.push(walk.currentNode);

    nodes.forEach(node => {
        let parent = node.parentElement;
        let skip = false;
        while (parent) {
            if (skipParents.has(parent)) { skip = true; break; }
            parent = parent.parentElement;
        }
        if (skip) return;

        const text = node.textContent;
        const idx = text.indexOf('Domiinique');
        if (idx === -1) return;

        const frag = document.createDocumentFragment();
        let remaining = text;
        let pos;
        while ((pos = remaining.indexOf('Domiinique')) !== -1) {
            if (pos > 0) frag.appendChild(document.createTextNode(remaining.slice(0, pos)));
            const span = document.createElement('span');
            span.className = 't-brand';
            span.textContent = 'Domiinique';
            frag.appendChild(span);
            remaining = remaining.slice(pos + 10);
        }
        if (remaining) frag.appendChild(document.createTextNode(remaining));
        node.parentNode.replaceChild(frag, node);
    });
}
