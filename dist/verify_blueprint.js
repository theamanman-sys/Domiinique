const fs = require('fs');

// Verify blueprint.html
const content = fs.readFileSync('blueprint.html', 'utf8');
const cards = (content.match(/class="room-card reveal"/g) || []).length;
const sections = (content.match(/id="blueprint-system"/g) || []).length;
console.log(`Cards: ${cards} (expected 20)`);
console.log(`Sections: ${sections} (expected 1)`);

// Extract all hrefs to verify mappings
const hrefPattern = /href="([^"]+)" class="room-card/g;
let m;
let i = 1;
while ((m = hrefPattern.exec(content)) !== null) {
    console.log(`  Card ${String(i).padStart(2,'0')} -> ${m[1]}`);
    i++;
}
