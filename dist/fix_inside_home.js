const fs = require('fs');

let content = fs.readFileSync('inside-the-home.html', 'utf8');

// The correct Inside-the-Home grid has room-01 through room-13 sub-room cards.
// We need to REPLACE the entire section contents with just the proper sub-rooms grid.
const newSectionContent = `    <section class="section" id="inside-the-home">
        <div class="container container--wide">
            <div class="rooms-grid">
                <!-- Room 01 Verenda Chronicles -->
                <a href="room-01.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/verandah.jpg" alt="Verenda Chronicles" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">01</span>
                        <h3 class="room-card__title">Verenda Chronicles</h3>
                    </div>
                </a>
                <!-- Room 02 Alchemy -->
                <a href="room-02.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/alchemy.jpg" alt="Alchemy" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">02</span>
                        <h3 class="room-card__title">Alchemy</h3>
                    </div>
                </a>
                <!-- Room 03 Creator -->
                <a href="room-03.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/creator.jpg" alt="Creator" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">03</span>
                        <h3 class="room-card__title">Creator</h3>
                    </div>
                </a>
                <!-- Room 04 Observer Lounge -->
                <a href="room-04.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/observer_lounge.jpg" alt="Observer Lounge" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">04</span>
                        <h3 class="room-card__title">Observer Lounge</h3>
                    </div>
                </a>
                <!-- Room 05 Life Force -->
                <a href="room-05.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/lifeforce.jpg" alt="Life Force" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">05</span>
                        <h3 class="room-card__title">Life Force</h3>
                    </div>
                </a>
                <!-- Room 06 Discipline Lab -->
                <a href="room-06.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/disciplinelab.jpg" alt="Discipline Lab" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">06</span>
                        <h3 class="room-card__title">Discipline Lab</h3>
                    </div>
                </a>
                <!-- Room 07 Source Space -->
                <a href="room-07.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/sourcespace.jpg" alt="Source Space" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">07</span>
                        <h3 class="room-card__title">Source Space</h3>
                    </div>
                </a>
                <!-- Room 08 Renewal -->
                <a href="room-08.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/renewal.jpg" alt="Renewal" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">08</span>
                        <h3 class="room-card__title">Renewal</h3>
                    </div>
                </a>
                <!-- Room 09 The Atelier -->
                <a href="room-09.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/atelier.jpg" alt="The Atelier" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">09</span>
                        <h3 class="room-card__title">The Atelier</h3>
                    </div>
                </a>
                <!-- Room 10 Nourish -->
                <a href="room-10.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/nourish.jpg" alt="Nourish" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">10</span>
                        <h3 class="room-card__title">Nourish</h3>
                    </div>
                </a>
                <!-- Room 11 Solace -->
                <a href="room-11.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/solace.jpg" alt="Solace" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">11</span>
                        <h3 class="room-card__title">Solace</h3>
                    </div>
                </a>
                <!-- Room 12 Meanifest -->
                <a href="room-12.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/meanifest.jpg" alt="Meanifest" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">12</span>
                        <h3 class="room-card__title">Meanifest</h3>
                    </div>
                </a>
                <!-- Room 13 Thought Archive -->
                <a href="room-13.html" class="room-card reveal">
                    <img src="assets/Blueprint/Inside the Home/thought_archive.jpg" alt="Thought Archive" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">13</span>
                        <h3 class="room-card__title">Thought Archive</h3>
                    </div>
                </a>
            </div>
        </div>
    </section>`;

// Replace the entire section (from open to close) with the clean version
const pattern = /<section class="section" id="inside-the-home">[\s\S]*?<\/section>/;
const fixed = content.replace(pattern, newSectionContent);

if (fixed === content) {
    console.error('ERROR: Pattern not matched. No changes made.');
    process.exit(1);
} else {
    fs.writeFileSync('inside-the-home.html', fixed, 'utf8');
    const cardCount = (fixed.match(/class="room-card reveal"/g) || []).length;
    console.log(`SUCCESS: inside-the-home.html updated. Found ${cardCount} room cards (expected 13).`);
}
