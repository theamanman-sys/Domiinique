const fs = require('fs');
const path = require('path');

const rootDir = 'c:\\Users\\Cordo\\Documents\\Websites\\Domiinique';
const files = fs.readdirSync(rootDir);

files.forEach(file => {
    if (file.endsWith('.html')) {
        const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
        const links = content.match(/href="([^"|#]*?\.html)"/g);
        
        if (links) {
            links.forEach(link => {
                const target = link.match(/href="([^"]*)"/)[1];
                const targetPath = path.join(rootDir, target);
                if (!fs.existsSync(targetPath)) {
                    console.error(`Broken link in ${file}: ${target}`);
                }
            });
        }
    }
});

console.log('Link audit complete.');
