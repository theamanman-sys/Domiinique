const fs = require('fs');
const path = require('path');

const directory = 'c:/Users/Cordo/Documents/Websites/Domiinique';

fs.readdir(directory, (err, files) => {
    if (err) throw err;
    files.forEach(file => {
        if (file.endsWith('.html')) {
            const filepath = path.join(directory, file);
            let content = fs.readFileSync(filepath, 'utf8');
            let newContent = content.replace(/href="css\/main\.css"/g, 'href="css/main.css?v=2"');
            newContent = newContent.replace(/href='css\/main\.css'/g, "href='css/main.css?v=2'");
            if (content !== newContent) {
                fs.writeFileSync(filepath, newContent, 'utf8');
                console.log(`Updated ${file}`);
            }
        }
    });
});
