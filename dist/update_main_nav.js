const fs = require('fs');
const path = require('path');

const standardNav = `    <nav id="nav" role="navigation" aria-label="Main Navigation">
        <a class="nav__logo" href="index.html">
            <span class="nav__logo-text">Domiinique</span>
            <span class="nav__logo-motto">Living Signature</span>
        </a>
        <ul class="nav__links">
            <li><a href="index.html">Home</a></li>
            <li><a href="about.html">About Me</a></li>
            <li><a href="blueprint.html">Blueprint</a></li>
            <li><a href="integrated.html">Integrated</a></li>
            <li><a href="time.html">Time</a></li>
            <li><a href="inspiration.html">Inspiration</a></li>
            <li><a href="creative.html">Creative</a></li>
            <li><a href="canvas.html">Canvas</a></li>
            <li><a href="portraits.html">Portraits</a></li>
            <li><a href="journal.html">Journal</a></li>
            <li><a href="you.html">YOU</a></li>
            <li><a href="cocreation.html">Co-Creation</a></li>
        </ul>
        <div class="nav__utilities">
            <a href="books.html" class="nav__utils-btn">Books</a>
            <a href="checkout.html" class="nav__utils-btn">Checkout <span class="cart-count">0</span></a>
            <div class="nav__hamburger" id="hamburger" aria-label="Open menu" role="button" tabindex="0">
                <span></span><span></span><span></span>
            </div>
        </div>
    </nav>`;

const rootDir = 'c:\\Users\\Cordo\\Documents\\Websites\\Domiinique';
const files = fs.readdirSync(rootDir);

files.forEach(file => {
    if (file.endsWith('.html') && !file.startsWith('room-') && file !== 'inside-the-home.html') {
        let content = fs.readFileSync(path.join(rootDir, file), 'utf8');
        
        // Update nav
        content = content.replace(/<nav[\s\S]*?<\/nav>/, standardNav);
        
        // Add active class back to the current page
        content = content.replace(new RegExp(`href="${file}"`), `href="${file}" class="active"`);
        
        fs.writeFileSync(path.join(rootDir, file), content);
    }
});

console.log('Main nav updated with About Me.');
