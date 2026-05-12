const fs = require('fs');
const path = require('path');

const standardNav = `    <nav id="nav" role="navigation" aria-label="Main Navigation">
        <a class="nav__logo" href="index.html">
            <span class="nav__logo-text">Domiinique</span>
            <span class="nav__logo-motto">Living Signature</span>
        </a>
        <ul class="nav__links">
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
            <a href="index.html" id="nav-home-btn" class="nav__profile-btn">
                <img src="assets/Blueprint/Home.jpg" alt="Home" class="nav__profile-img">
                <span>Home</span>
            </a>
            <a href="about.html" id="nav-about-btn" class="nav__profile-btn">
                <img src="assets/Blueprint/about_me.jpg" alt="About Dominique" class="nav__profile-img">
                <span>About Me</span>
            </a>
            <a href="books.html" class="nav__utils-btn">Books</a>
            <a href="checkout.html" class="nav__utils-btn">Checkout <span class="cart-count">0</span></a>
            <div class="nav__hamburger" id="hamburger" aria-label="Open menu" role="button" tabindex="0">
                <span></span><span></span><span></span>
            </div>
        </div>
    </nav>`;

const audioSource = 'https://www.chosic.com/wp-content/uploads/2021/07/Johann-Sebastian-Bach-Cello-Suite-No.-1-in-G-Major-BWV-1007-I.-Prelude.mp3';

const audioHtml = `    <!-- --- Frequency Audio --- -->
    <div id="audio-toggle" class="audio-toggle" role="button" aria-label="Toggle Frequency">
        <div class="audio-visual">
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
            <div class="audio-bar"></div>
        </div>
        <span class="audio-label">Frequency</span>
    </div>
    <audio id="bg-audio" loop preload="auto">
        <source src="${audioSource}" type="audio/mpeg">
    </audio>`;

const bpMapping = [
    { id: '01', title: 'Home', img: 'assets/Blueprint/Home.jpg', href: 'index.html' },
    { id: '02', title: 'About Me', img: 'assets/Blueprint/about_me.jpg', href: 'about.html' },
    { id: '03', title: 'Signature Symbols & Philosophy', img: 'assets/Blueprint/signature_and_philosophy.jpg', href: 'inspiration.html' },
    { id: '04', title: 'My Home', img: 'assets/Blueprint/my_home.jpg', href: 'room-15.html' },
    { id: '05', title: 'Inside the Home', img: 'assets/Blueprint/inside_the_home.jpg', href: 'inside-the-home.html' },
    { id: '06', title: 'Rituals and Systems', img: 'assets/Blueprint/rituals.jpg', href: 'room-16.html' },
    { id: '07', title: 'Fundamental Pillars', img: 'assets/fundamental_pillars.jpg', href: 'integrated.html' },
    { id: '08', title: 'Living Signatures', img: 'assets/Blueprint/living_signature.jpg', href: 'integrated.html' },
    { id: '09', title: 'Personal Development', img: 'assets/Blueprint/personal development.jpg', href: 'you.html' },
    { id: '10', title: 'Health & Wellness', img: 'assets/Blueprint/health and wellness.jpg', href: 'integrated.html' },
    { id: '11', title: 'Lifestyle & Hobbies', img: 'assets/Blueprint/lifestyle_and_hobbies.jpg', href: 'creative.html' },
    { id: '12', title: 'Experience Life', img: 'assets/Blueprint/experiences_life.jpg', href: 'creative.html' },
    { id: '13', title: 'Sensory Engineering', img: 'assets/Blueprint/sensory_home.jpg', href: 'creative.html' },
    { id: '14', title: 'Vision Board', img: 'assets/Blueprint/vision_board.jpg', href: 'canvas.html' },
    { id: '15', title: 'Schedule & Time Mapping', img: 'assets/Blueprint/time_mapping.jpg', href: 'time.html' },
    { id: '16', title: 'Community & Contribution', img: 'assets/Blueprint/community_and_contribution.jpg', href: 'cocreation.html' },
    { id: '17', title: 'Travel & Exploration', img: 'assets/Blueprint/travel_and_exploration.jpg', href: 'creative.html' },
    { id: '18', title: 'Legacy of Vision', img: 'assets/Blueprint/legacy_of_vision.jpg', href: 'journal.html' },
    { id: '19', title: 'Future Versions', img: 'assets/Blueprint/future_vision.jpg', href: 'journal.html' },
    { id: '20', title: 'Soul Imprints', img: 'assets/Blueprint/soul_imprints.jpg', href: 'portraits.html' }
];

const rootDir = 'c:\\Users\\Cordo\\Documents\\Websites\\Domiinique';
const files = fs.readdirSync(rootDir);

files.forEach(file => {
    if (file.endsWith('.html')) {
        let content = fs.readFileSync(path.join(rootDir, file), 'utf8');
        
        // 1. Ensure main CSS
        if (!content.includes('css/main.css')) {
            content = content.replace('</head>', '    <link rel="stylesheet" href="css/main.css">\n</head>');
        }

        // 2. Standardize Nav
        content = content.replace(/<nav[\s\S]*?<\/nav>/, standardNav);
        
        // 3. Add 'active' class to current page
        if (file === 'index.html') {
            content = content.replace('id="nav-home-btn" class="nav__profile-btn"', 'id="nav-home-btn" class="nav__profile-btn active"');
        } else if (file === 'about.html') {
            content = content.replace('id="nav-about-btn" class="nav__profile-btn"', 'id="nav-about-btn" class="nav__profile-btn active"');
        } else {
            const navLinkRegex = new RegExp(`<li><a href="${file}"`);
            content = content.replace(navLinkRegex, `<li><a href="${file}" class="active"`);
        }
        
        // 4. Ensure Audio Toggle and Element
        if (content.includes('id="audio-toggle"')) {
            content = content.replace(/<!-- --- Frequency Audio --- -->[\s\S]*?<\/audio>/, audioHtml);
        } else if (content.includes('</body>')) {
             content = content.replace('</body>', `${audioHtml}\n</body>`);
        }

        // 5. Ensure main.js
        if (!content.includes('js/main.js')) {
            content = content.replace('</body>', '    <script src="js/main.js" defer></script>\n</body>');
        }

        // 6. Blueprint mappings (Rebuilding specifically for blueprint.html to avoid regex collisions)
        if (file === 'blueprint.html' || content.includes('class="rooms-grid"')) {
            let blueprintSection = '';
            bpMapping.forEach(m => {
                blueprintSection += `                <!-- ${m.id} ${m.title} -->
                <a href="${m.href}" class="room-card reveal">
                    <img src="${m.img}" alt="${m.title}" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">${m.id}</span>
                        <h3 class="room-card__title">${m.title}</h3>
                    </div>
                </a>\n`;
            });
            
            // Re-overwrite specifically from start of grid to end of section to solve duplication
            const gridStart = '<div class="rooms-grid">';
            const sectionEnd = '</section>';
            const startIndex = content.indexOf(gridStart);
            const endIndex = content.indexOf(sectionEnd, startIndex);
            
            if (startIndex !== -1 && endIndex !== -1) {
                content = content.substring(0, startIndex + gridStart.length) + 
                          '\n' + blueprintSection + '            </div>\n        </div>\n    ' + 
                          content.substring(endIndex);
            }
        }

        fs.writeFileSync(path.join(rootDir, file), content);
    }
});

console.log('Site-wide consistency FINAL (Improved): Nav, Audio, and EXACT Blueprint Mappings synchronized.');
