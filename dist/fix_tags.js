const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// The issue is that <a href="room-XX.html" ...> is closed with </div> instead of </a> for rooms 1-13.
// We can use a regex that matches the card start and its content until the next card or the end of the grid.
// But a simpler way is to target the </div> that follows the → arrow for rooms 1-13.

// Rooms 1-13 typically end with: <div class="pillar-card__arrow">→</div>\s+</div>
// We want to replace that trailing </div> with </a>

// First, fix the 13 rooms.
for (let i = 1; i <= 13; i++) {
    const padded = i.toString().padStart(2, '0');
    // Search for the room card and its closing div
    const regex = new RegExp(`(<a href="room-${padded}.html"[\\s\\S]*?<div class="pillar-card__arrow">→<\\/div>\\s+)<\\/div>`, 'g');
    html = html.replace(regex, '$1</a>');
}

// Ensure the grid has the correct 4-column setup in CSS (handled in the other tool call)
// But let's also make sure the grid-rooms div is clean.

fs.writeFileSync('index.html', html);
console.log('Fixed closing tags for rooms 1-13 in index.html');
