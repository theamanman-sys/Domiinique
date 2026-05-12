// Automatically fetch and apply book cover images from the internet
// Assumes book_data.json contains image URLs for each book

document.addEventListener('DOMContentLoaded', () => {
    const depth = (window.location.pathname.match(/\//g) || []).length - 1;
    let prefix = '';
    for (let i = 0; i < depth; i++) prefix += '../';

    const paths = [`${window.location.origin}/book_data.json`, `${prefix}book_data.json`];

    function tryFetch(index) {
        if (index >= paths.length) {
            console.warn('fetchBookCovers: All book_data.json paths failed');
            return;
        }
        fetch(paths[index])
            .then(res => {
                if (!res.ok) throw new Error(`${res.status}`);
                return res.json();
            })
            .then(books => {
                const grid = document.getElementById('books-grid');
                if (!grid) return;
                grid.innerHTML = '';
                books.forEach(book => {
                    const card = document.createElement('div');
                    card.className = 'book-card';
                    card.style = 'display:flex;flex-direction:column;align-items:center;margin:1.2rem;max-width:180px;';
                    
                    const imgContainer = document.createElement('div');
                    imgContainer.className = 'book-card__img-container';
                    imgContainer.style = 'width:140px;height:210px;object-fit:cover;border-radius:8px;box-shadow:0 4px 18px rgba(0,0,0,0.18);margin-bottom:1rem;overflow:hidden;cursor:pointer;position:relative;';

                    const img = document.createElement('img');
                    img.src = book.image || '';
                    img.alt = (book.title || 'Book') + ' cover';
                    img.style = 'width:100%;height:100%;object-fit:cover;';
                    img.onerror = function() {
                        this.src = 'assets/books/book-placeholder.png';
                    };
                    
                    imgContainer.appendChild(img);

                    const title = document.createElement('div');
                    title.textContent = book.title || 'Untitled';
                    title.style = 'font-weight:bold;text-align:center;margin-bottom:0.5rem;';
                    
                    const author = document.createElement('div');
                    author.textContent = book.author || '';
                    author.style = 'font-size:0.9rem;color:#c9a84c;text-align:center;margin-bottom:0.5rem;';
                    
                    card.appendChild(imgContainer);
                    card.appendChild(title);
                    card.appendChild(author);
                    grid.appendChild(card);
                });
            })
            .catch(() => tryFetch(index + 1));
    }

    tryFetch(0);
});
