const fs = require('fs');

let content = fs.readFileSync('blueprint.html', 'utf8');

const newSection = `    <section class="section" id="blueprint-system">
        <div class="container container--wide">
            <div class="rooms-grid">
                <!-- 01 Home -->
                <a href="index.html" class="room-card reveal">
                    <img src="assets/Blueprint/Home.jpg" alt="Home" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">01</span>
                        <h3 class="room-card__title">Home</h3>
                    </div>
                </a>
                <!-- 02 About Me -->
                <a href="about.html" class="room-card reveal">
                    <img src="assets/Blueprint/about_me.jpg" alt="About Me" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">02</span>
                        <h3 class="room-card__title">About Me</h3>
                    </div>
                </a>
                <!-- 03 Signature Symbols & Philosophy -->
                <a href="inspiration.html" class="room-card reveal">
                    <img src="assets/Blueprint/signature_and_philosophy.jpg" alt="Signature Symbols &amp; Philosophy" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">03</span>
                        <h3 class="room-card__title">Signature Symbols &amp; Philosophy</h3>
                    </div>
                </a>
                <!-- 04 My Home -->
                <a href="room-15.html" class="room-card reveal">
                    <img src="assets/Blueprint/my_home.jpg" alt="My Home" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">04</span>
                        <h3 class="room-card__title">My Home</h3>
                    </div>
                </a>
                <!-- 05 Inside the Home -->
                <a href="inside-the-home.html" class="room-card reveal">
                    <img src="assets/Blueprint/inside_the_home.jpg" alt="Inside the Home" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">05</span>
                        <h3 class="room-card__title">Inside the Home</h3>
                    </div>
                </a>
                <!-- 06 Rituals and Systems -->
                <a href="room-16.html" class="room-card reveal">
                    <img src="assets/Blueprint/rituals.jpg" alt="Rituals and Systems" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">06</span>
                        <h3 class="room-card__title">Rituals and Systems</h3>
                    </div>
                </a>
                <!-- 07 Fundamental Pillars -->
                <a href="integrated.html" class="room-card reveal">
                    <img src="assets/fundamental_pillars.jpg" alt="Fundamental Pillars" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">07</span>
                        <h3 class="room-card__title">Fundamental Pillars</h3>
                    </div>
                </a>
                <!-- 08 Living Signatures -->
                <a href="room-17.html" class="room-card reveal">
                    <img src="assets/Blueprint/living_signature.jpg" alt="Living Signatures" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">08</span>
                        <h3 class="room-card__title">Living Signatures</h3>
                    </div>
                </a>
                <!-- 09 Personal Development -->
                <a href="room-18.html" class="room-card reveal">
                    <img src="assets/Blueprint/personal development.jpg" alt="Personal Development" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">09</span>
                        <h3 class="room-card__title">Personal Development</h3>
                    </div>
                </a>
                <!-- 10 Health & Wellness -->
                <a href="room-19.html" class="room-card reveal">
                    <img src="assets/Blueprint/health and wellness.jpg" alt="Health &amp; Wellness" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">10</span>
                        <h3 class="room-card__title">Health &amp; Wellness</h3>
                    </div>
                </a>
                <!-- 11 Lifestyle & Hobbies -->
                <a href="creative.html" class="room-card reveal">
                    <img src="assets/Blueprint/lifestyle_and_hobbies.jpg" alt="Lifestyle &amp; Hobbies" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">11</span>
                        <h3 class="room-card__title">Lifestyle &amp; Hobbies</h3>
                    </div>
                </a>
                <!-- 12 Experience Life -->
                <a href="room-20.html" class="room-card reveal">
                    <img src="assets/Blueprint/experiences_life.jpg" alt="Experience Life" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">12</span>
                        <h3 class="room-card__title">Experience Life</h3>
                    </div>
                </a>
                <!-- 13 Sensory Engineering -->
                <a href="room-21.html" class="room-card reveal">
                    <img src="assets/Blueprint/sensory_home.jpg" alt="Sensory Engineering" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">13</span>
                        <h3 class="room-card__title">Sensory Engineering</h3>
                    </div>
                </a>
                <!-- 14 Vision Board -->
                <a href="canvas.html" class="room-card reveal">
                    <img src="assets/Blueprint/vision_board.jpg" alt="Vision Board" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">14</span>
                        <h3 class="room-card__title">Vision Board</h3>
                    </div>
                </a>
                <!-- 15 Schedule & Time Mapping -->
                <a href="time.html" class="room-card reveal">
                    <img src="assets/Blueprint/time_mapping.jpg" alt="Schedule &amp; Time Mapping" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">15</span>
                        <h3 class="room-card__title">Schedule &amp; Time Mapping</h3>
                    </div>
                </a>
                <!-- 16 Community & Contribution -->
                <a href="cocreation.html" class="room-card reveal">
                    <img src="assets/Blueprint/community_and_contribution.jpg" alt="Community &amp; Contribution" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">16</span>
                        <h3 class="room-card__title">Community &amp; Contribution</h3>
                    </div>
                </a>
                <!-- 17 Travel & Exploration -->
                <a href="room-22.html" class="room-card reveal">
                    <img src="assets/Blueprint/travel_and_exploration.jpg" alt="Travel &amp; Exploration" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">17</span>
                        <h3 class="room-card__title">Travel &amp; Exploration</h3>
                    </div>
                </a>
                <!-- 18 Legacy of Vision -->
                <a href="journal.html" class="room-card reveal">
                    <img src="assets/Blueprint/legacy_of_vision.jpg" alt="Legacy of Vision" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">18</span>
                        <h3 class="room-card__title">Legacy of Vision</h3>
                    </div>
                </a>
                <!-- 19 Future Versions -->
                <a href="room-14.html" class="room-card reveal">
                    <img src="assets/Blueprint/future_vision.jpg" alt="Future Versions" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">19</span>
                        <h3 class="room-card__title">Future Versions</h3>
                    </div>
                </a>
                <!-- 20 Soul Imprints -->
                <a href="portraits.html" class="room-card reveal">
                    <img src="assets/Blueprint/soul_imprints.jpg" alt="Soul Imprints" class="room-card__bg">
                    <div class="room-card__content">
                        <span class="room-card__id">20</span>
                        <h3 class="room-card__title">Soul Imprints</h3>
                    </div>
                </a>
            </div>
        </div>
    </section>`;

// Replace from section open to last </section> before <footer
const pattern = /<section class="section" id="blueprint-system">[\s\S]*?<\/section>\s*(?=\s*<footer)/;
const fixed = content.replace(pattern, newSection + '\n\n');

if (fixed === content) {
    console.error('ERROR: Pattern not matched. No changes made.');
    process.exit(1);
} else {
    fs.writeFileSync('blueprint.html', fixed, 'utf8');
    const cardCount = (fixed.match(/class="room-card reveal"/g) || []).length;
    console.log(`SUCCESS: blueprint.html updated. Found ${cardCount} room cards (expected 20).`);
}
