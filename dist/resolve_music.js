const https = require('https');
const fs = require('fs');
const path = require('path');

const libraryPath = path.join(__dirname, 'data', 'music_library.json');
const resolvedPath = path.join(__dirname, 'data', 'music_resolved.json');

// Ensure data directory exists
if (!fs.existsSync(path.join(__dirname, 'data'))) {
    fs.mkdirSync(path.join(__dirname, 'data'));
}

let library = {};
let resolved = {};

if (fs.existsSync(libraryPath)) {
    library = JSON.parse(fs.readFileSync(libraryPath, 'utf8'));
} else {
    console.error('Error: music_library.json not found.');
    process.exit(1);
}

if (fs.existsSync(resolvedPath)) {
    resolved = JSON.parse(fs.readFileSync(resolvedPath, 'utf8'));
}

async function getVideoId(query) {
    return new Promise((resolve) => {
        // Add "YouTube" to query to improve accuracy
        const url = 'https://www.youtube.com/results?search_query=' + encodeURIComponent(query + ' (Official Audio)');
        https.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
            }
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                const match = data.match(/"videoId":"([^"]{11})"/);
                if (match && match[1]) {
                    resolve(match[1]);
                } else {
                    resolve(null);
                }
            });
        }).on('error', () => resolve(null));
    });
}

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
    let count = 0;
    const totalCategories = Object.keys(library).length;
    let catIndex = 0;

    for (const category in library) {
        catIndex++;
        console.log(`\n--- Processing Category [${catIndex}/${totalCategories}]: ${category} ---`);
        
        if (!resolved[category]) resolved[category] = [];

        // Pre-populate missing tracks in this category so the library is never empty/truncated
        library[category].forEach(trackName => {
            const existing = resolved[category].find(t => t.name === trackName);
            if (!existing) {
                resolved[category].push({ name: trackName, videoId: null });
            }
        });

        for (const track of resolved[category]) {
            if (track.videoId) continue; // Skip already resolved

            process.stdout.write(`Fetching [${++count}] ${track.name} ... `);
            const vid = await getVideoId(track.name);
            
            if (vid) {
                process.stdout.write(`${vid}\n`);
                track.videoId = vid;
            } else {
                process.stdout.write('FAILED (Rate Limit or Missing)\n');
            }

            // Save every 5 tracks
            if (count % 5 === 0) {
                fs.writeFileSync(resolvedPath, JSON.stringify(resolved, null, 2));
            }

            // Throttling
            if (count % 20 === 0) {
                console.log(`\n--- Cooling down for 35 seconds ---`);
                await sleep(35000);
            } else {
                await sleep(1500); 
            }
        }
        fs.writeFileSync(resolvedPath, JSON.stringify(resolved, null, 2));
    }

    console.log('\nAll tracks processed! Data saved to data/music_resolved.json');
}

run();
