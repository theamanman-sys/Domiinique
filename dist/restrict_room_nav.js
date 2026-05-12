const fs = require('fs');
const path = require('path');

const roomNav = `    <nav id="nav" role="navigation" aria-label="Room Navigation" class="scrolled">
        <a class="nav__logo" href="index.html">
            <span class="nav__logo-text">Domiinique</span>
            <span class="nav__logo-motto">Living Signature</span>
        </a>
        <div class="nav__utilities">
            <a href="blueprint.html" class="nav__utils-btn">← Blueprint Index</a>
        </div>
    </nav>`;

const rootDir = 'c:\\Users\\Cordo\\Documents\\Websites\\Domiinique';
const files = fs.readdirSync(rootDir);

files.forEach(file => {
    if (file.startsWith('room-') || file === 'inside-the-home.html') {
        let content = fs.readFileSync(path.join(rootDir, file), 'utf8');
        content = content.replace(/<nav[\s\S]*?<\/nav>/, roomNav);
        fs.writeFileSync(path.join(rootDir, file), content);
    }
});

console.log('Room navigation restricted to Blueprint.');
