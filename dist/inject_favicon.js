const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(__dirname).filter(f => f.endsWith('.html'));
const faviconTag = '\n    <link rel="icon" href="assets/domiinique_logo.png" type="image/png">';

let c = 0;
files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    if (!content.includes('rel="icon"')) {
        content = content.replace('</head>', `${faviconTag}\n</head>`);
        fs.writeFileSync(file, content);
        c++;
    }
});

console.log(`Injected favicon into ${c} HTML files.`);
