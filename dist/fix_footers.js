const fs = require('fs');
const path = require('path');

const standardFooter = `    <footer>
        <div class="footer__inner">
            <a class="nav__logo" href="index.html">
                <span class="nav__logo-text">Domiinique</span>
                <span class="nav__logo-motto">Living Signature</span>
            </a>
            <p class="footer__copy">© 2026 Domiinique. All rights reserved. Conscious Holographic Reality.</p>
        </div>
    </footer>`;

const standardNavLogo = `        <a class="nav__logo" href="index.html">
            <span class="nav__logo-text">Domiinique</span>
            <span class="nav__logo-motto">Living Signature</span>
        </a>`;

function fixFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');

    // Replace footer
    content = content.replace(/<footer>[\s\S]*?<\/footer>/g, standardFooter);
    
    // Replace first nav logo occurence (usually in nav)
    content = content.replace(/<a class="nav__logo"[\s\S]*?<\/a>/, standardNavLogo);

    fs.writeFileSync(filePath, content);
}

const rootDir = 'c:\\Users\\Cordo\\Documents\\Websites\\Domiinique';
const files = fs.readdirSync(rootDir);

files.forEach(file => {
    if (file.endsWith('.html')) {
        console.log(`Fixing ${file}...`);
        fixFile(path.join(rootDir, file));
    }
});

console.log('Done.');
