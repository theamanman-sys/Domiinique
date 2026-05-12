const fs = require('fs');
const path = require('path');

// Baroque classical music source (Bach)
const audioSource = 'https://orangefreesounds.com/wp-content/uploads/2014/10/Bach-cello-suite-no-1-prelude.mp3';

const rootDir = 'c:\\Users\\Cordo\\Documents\\Websites\\Domiinique';
const files = fs.readdirSync(rootDir);

files.forEach(file => {
    if (file.endsWith('.html')) {
        let content = fs.readFileSync(path.join(rootDir, file), 'utf8');
        
        // Ensure consistent audio source
        if (content.includes('id="bg-audio"')) {
            content = content.replace(/<audio id="bg-audio"[\s\S]*?<\/audio>/, 
                `<audio id="bg-audio" loop>\n        <source src="${audioSource}" type="audio/mpeg">\n    </audio>`);
        } else {
            // Some rooms might be missing the audio toggle/element
            // We only add it if it doesn't exist, as per user's "audio properly in every page"
            if (!content.includes('id="audio-toggle"')) {
                const audioHtml = `    <!-- --- Frequency Audio --- -->
    <div id="audio-toggle" class="audio-toggle" role="button" aria-label="Toggle Frequency">
        <div class="audio-visual">
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
        </div>
        <span class="audio-label">Frequency</span>
    </div>
    <audio id="bg-audio" loop>
        <source src="${audioSource}" type="audio/mpeg">
    </audio>`;
                content = content.replace('</body>', `${audioHtml}\n</body>`);
            } else {
                 content = content.replace(/<audio id="bg-audio"[\s\S]*?<\/audio>/, 
                `<audio id="bg-audio" loop>\n        <source src="${audioSource}" type="audio/mpeg">\n    </audio>`);
            }
        }
        
        fs.writeFileSync(path.join(rootDir, file), content);
    }
});

console.log('Audio standardized to Baroque classical across all pages.');
