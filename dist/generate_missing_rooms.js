const fs = require('fs');
const path = require('path');

// 1. Array of the 8 new rooms to be generated
const newRooms = [
    {
        id: '23', 
        cardId: '03', 
        title: 'Signature Symbols & Philosophy', 
        imgSrc: 'assets/Blueprint/signature_and_philosophy.jpg',
        quote: '"Symbols are the language of the soul."',
        desc1: 'This space anchors the core philosophy and the visual language that guides the Domiinique lifestyle.',
        desc2: 'A catalog of aesthetic choices meant to evoke resonance and deep connection.',
        li1: '<strong>Aesthetic Alignment</strong> — Finding truth in form.',
        li2: '<strong>Brand Ethos</strong> — Living the signature.',
        li3: '<strong>Visual Voice</strong> — Communicating without words.',
    },
    {
        id: '24', 
        cardId: '07', 
        title: 'Fundamental Pillars', 
        imgSrc: 'assets/fundamental_pillars.jpg',
        quote: '"Strong foundations allow for boundless ascension."',
        desc1: 'The integrated framework that holds the entire lifestyle architecture together.',
        desc2: 'Here, the non-negotiables of conscious living are established and fortified.',
        li1: '<strong>Core Integrity</strong> — Defining boundaries and values.',
        li2: '<strong>Structural Alignment</strong> — Building the framework of the self.',
        li3: '<strong>Systemic Health</strong> — Ensuring holistic resilience.',
    },
    {
        id: '25', 
        cardId: '11', 
        title: 'Lifestyle & Hobbies', 
        imgSrc: 'assets/Blueprint/lifestyle_and_hobbies.jpg',
        quote: '"Joy is the compass for the soul\'s trajectory."',
        desc1: 'A dedicated space for passions, leisure, and the pursuit of creative expression.',
        desc2: 'Life is more than function; it is the art of experiencing resonance.',
        li1: '<strong>Creative Leisure</strong> — Pursuits that replenish energy.',
        li2: '<strong>Play & Curiosity</strong> — Engaging with the world lightly.',
        li3: '<strong>Cultivated Interests</strong> — Deepening engagement with craft.',
    },
    {
        id: '26', 
        cardId: '14', 
        title: 'Vision Board', 
        imgSrc: 'assets/Blueprint/vision_board.jpg',
        quote: '"What the mind can perceive, the reality can manifest."',
        desc1: 'The canvas of the future. The energetic template for what is becoming.',
        desc2: 'A kinetic mapping of goals, desires, and the emotional resonance of the future self.',
        li1: '<strong>Energetic Mapping</strong> — Clarifying desires.',
        li2: '<strong>Visual Anchoring</strong> — Keeping the compass true.',
        li3: '<strong>Manifestation Protocol</strong> — Bridging the energetic and the material.',
    },
    {
        id: '27', 
        cardId: '15', 
        title: 'Schedule & Time Mapping', 
        imgSrc: 'assets/Blueprint/time_mapping.jpg',
        quote: '"Time is not managed; it is crafted."',
        desc1: 'The architecture of the day. How intention meets the clock.',
        desc2: 'Shifting from reactive routines to deliberate, rhythmic living.',
        li1: '<strong>Temporal Mastery</strong> — Owning the hours.',
        li2: '<strong>Rhythmic Flow</strong> — Aligning output with natural energy.',
        li3: '<strong>Protected Margins</strong> — Building space for spontaneity.',
    },
    {
        id: '28', 
        cardId: '16', 
        title: 'Community & Contribution', 
        imgSrc: 'assets/Blueprint/community_and_contribution.jpg',
        quote: '"The highest expression of the self is in service to the whole."',
        desc1: 'The ecosystem of co-creation. Where individual frequency affects the collective grid.',
        desc2: 'Engagement, leadership, and the exchange of profound value.',
        li1: '<strong>Collective Resonance</strong> — Finding the right tribe.',
        li2: '<strong>Impact Architecture</strong> — Scaling contribution.',
        li3: '<strong>Shared Vision</strong> — Co-creating the new earth.',
    },
    {
        id: '29', 
        cardId: '18', 
        title: 'Legacy of Vision', 
        imgSrc: 'assets/Blueprint/legacy_of_vision.jpg',
        quote: '"A true legacy is not what you leave behind, but who you become."',
        desc1: 'The compounding effect of a life lived deliberately across decades.',
        desc2: 'A vault mapping the long-term impact and enduring themes of the Domiinique ethos.',
        li1: '<strong>Generational Impact</strong> — Thinking in centuries.',
        li2: '<strong>Energetic Imprint</strong> — The feeling left in the room.',
        li3: '<strong>Timeless Contribution</strong> — Building beyond the self.',
    },
    {
        id: '30', 
        cardId: '20', 
        title: 'Soul Imprints', 
        imgSrc: 'assets/Blueprint/soul_imprints.jpg',
        quote: '"Every interaction leaves an eternal trace."',
        desc1: 'The portrait gallery of influence. Encounters, mentors, and paradigm-shifting moments.',
        desc2: 'A reflection on the relationships and energies that have permanently altered the trajectory.',
        li1: '<strong>Energetic Exchange</strong> — The art of the encounter.',
        li2: '<strong>Mentorship & Lineage</strong> — Honoring the teachers.',
        li3: '<strong>Soul Recognition</strong> — Seeing beyond the persona.',
    }
];

// 2. Read template from room-22 (a standard outer Blueprint room)
const template = fs.readFileSync('room-22.html', 'utf8');

// Helper to make the new HTML
function generateRoomHtml(room) {
    let html = template;
    
    // Replace title tag
    html = html.replace(/<title>.*?<\/title>/, \`<title>\${room.title} | Domiinique</title>\`);
    
    // Replace background image
    html = html.replace(/<img src="assets\/travel_and_explore\.jpg".*?class="pillar-bg">/, 
                        \`<img src="\${room.imgSrc}" alt="\${room.title}" class="pillar-bg">\`);
                        
    // Replace badge and title
    html = html.replace(/<div class="pillar-badge">.*?<\/div>/, 
                        \`<div class="pillar-badge">Room \${room.id} · \${room.title}</div>\`);
    html = html.replace(/<h1 class="pillar-title">.*?<\/h1>/, 
                        \`<h1 class="pillar-title">\${room.title}</h1>\`);
                        
    // Replace content body (the paragraph, quote, h4s, ul)
    const contentPattern = /<div class="pillar-body">[\s\S]*?<\/div>\s*<div class="pillar-nav-bottom">/;
    const newContent = \`<div class="pillar-body">
                <p>\${room.desc1}</p>
                <div class="modal__quote">\${room.quote}</div>
                <h4>Atmosphere & Resonance</h4>
                <p>\${room.desc2}</p>
                <h4>Core Elements</h4>
                <ul>
                    <li>\${room.li1}</li>
                    <li>\${room.li2}</li>
                    <li>\${room.li3}</li>
                </ul>
            </div>
            <div class="pillar-nav-bottom">\`;
    
    html = html.replace(contentPattern, newContent);
    return html;
}

// 3. Generate the rooms
newRooms.forEach(room => {
    const filename = \`room-\${room.id}.html\`;
    const html = generateRoomHtml(room);
    fs.writeFileSync(filename, html, 'utf8');
    console.log(\`Created \${filename} for \${room.title}\`);
});

// 4. Update blueprint.html to point to the newly created rooms
let blueprint = fs.readFileSync('blueprint.html', 'utf8');

const replacements = [
    { card: '03', orig: 'inspiration.html', new: 'room-23.html' },
    { card: '07', orig: 'integrated.html', new: 'room-24.html' },
    { card: '11', orig: 'creative.html', new: 'room-25.html' },
    { card: '14', orig: 'canvas.html', new: 'room-26.html' },
    { card: '15', orig: 'time.html', new: 'room-27.html' },
    { card: '16', orig: 'cocreation.html', new: 'room-28.html' },
    { card: '18', orig: 'journal.html', new: 'room-29.html' },
    { card: '20', orig: 'portraits.html', new: 'room-30.html' }
];

replacements.forEach(r => {
    // Look for the specific card block using regex
    const blockPattern = new RegExp(\`(<!-- \${r.card} .*?-->\\s*)<a href="\${r.orig}" class="room-card reveal">\`);
    if (blockPattern.test(blueprint)) {
        blueprint = blueprint.replace(blockPattern, \`$1<a href="\${r.new}" class="room-card reveal">\`);
        console.log(\`Updated blueprint.html: Card \${r.card} now points to \${r.new}\`);
    } else {
        console.log(\`Warning: Could not find Card \${r.card} with href \${r.orig} in blueprint.html\`);
    }
});

fs.writeFileSync('blueprint.html', blueprint, 'utf8');
console.log("Blueprint links successfully updated.");
