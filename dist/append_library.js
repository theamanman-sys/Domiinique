const fs = require('fs');
const path = require('path');

const filePath = 'c:\\Users\\Cordo\\Documents\\Websites\\Domiinique\\data\\music_library.json';
let library = {};

try {
    if (fs.existsSync(filePath)) {
        library = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    }
} catch (e) {
    console.log('Error reading file:', e.message);
}

const newCategories = {
  "Nature": [
    "Summer Breeze \u2014 Nature Sounds",
    "Ocean Waves \u2014 Nature Sounds",
    "Forest Rain \u2014 Nature Sounds",
    "Mountain Stream \u2014 Nature Sounds",
    "Morning Birds \u2014 Nature Sounds",
    "Jungle Ambience \u2014 Nature Sounds",
    "Tropical Rain \u2014 Nature Sounds",
    "Soft Wind \u2014 Nature Sounds",
    "Desert Night \u2014 Nature Sounds",
    "Zen Garden Water \u2014 Nature Sounds",
    "Thunderstorm \u2014 Nature Sounds",
    "Under the Sea \u2014 Ambient",
    "Fireplace Crackling \u2014 Nature Sounds",
    "Spring Meadow \u2014 Nature Sounds",
    "Autumn Leaves Wind \u2014 Nature Sounds",
    "Winter Blizzard \u2014 Nature Sounds",
    "Whale Song \u2014 Nature Sounds",
    "Dolphin Clicks \u2014 Nature Sounds",
    "Rain on a Tent \u2014 Nature Sounds",
    "City Rain \u2014 Nature Sounds"
  ],
  "Sleep": [
    "Weightless Part 1 \u2014 Marconi Union",
    "Weightless Part 2 \u2014 Marconi Union",
    "Night Owl \u2014 Galimatias",
    "Breathe \u2014 T\u00e9l\u00e9popmusik",
    "By Your Side (Instrumental) \u2014 Sade",
    "Strawberry Swing (Instrumental) \u2014 Coldplay",
    "Holocene (Instrumental) \u2014 Bon Iver",
    "Re:member \u2014 \u00d3lafur Arnalds",
    "Near Light \u2014 \u00d3lafur Arnalds",
    "Saman \u2014 \u00d3lafur Arnalds",
    "Dawn \u2014 Jean-Michel Blais",
    "Nostos \u2014 Ludovico Einaudi",
    "Nightbook \u2014 Ludovico Einaudi",
    "Una Mattina \u2014 Ludovico Einaudi",
    "Experience \u2014 Ludovico Einaudi",
    "River Flows in You \u2014 Yiruma",
    "Kiss the Rain \u2014 Yiruma",
    "Spring Waltz \u2014 Yiruma",
    "Maybe \u2014 Ludovico Einaudi",
    "Comptine d\u2019un autre \u00e9t\u00e9 \u2014 Yann Tiersen",
    "La Valse d\u2019Am\u00e9lie \u2014 Yann Tiersen"
  ],
  "Meals": [
    "Hotel Lounge \u2014 Rita Carlton",
    "Easy Living \u2014 Rita Carlton",
    "Smooth Afternoon \u2014 Rita Carlton",
    "Evening Chill \u2014 Rita Carlton",
    "Caf\u00e9 Sunset \u2014 Rita Carlton",
    "Jazz in the Afternoon \u2014 George Benson",
    "Breezin\u2019 \u2014 George Benson",
    "Take Five \u2014 Dave Brubeck",
    "Blue Rondo \u00e0 la Turk \u2014 Dave Brubeck",
    "Quiet Nights of Quiet Stars \u2014 Stan Getz & Jo\u00e3o Gilberto",
    "Corcovado \u2014 Stan Getz & Jo\u00e3o Gilberto",
    "Girl From Ipanema \u2014 Stan Getz & Jo\u00e3o Gilberto",
    "Wave \u2014 Ant\u00f4nio Carlos Jobim",
    "Meditation \u2014 Ant\u00f4nio Carlos Jobim",
    "Desafinado \u2014 Ant\u00f4nio Carlos Jobim",
    "Aqua \u2014 Michael Bubl\u00e9 Instrumental",
    "Sway \u2014 Michael Bubl\u00e9 Instrumental",
    "Haven\u2019t Met You Yet (Instrumental) \u2014 Michael Bubl\u00e9",
    "La Vie En Rose (Instrumental) \u2014 Louis Armstrong",
    "Summertime (Instrumental) \u2014 Fitzgerald & Armstrong"
  ],
  "Spa": [
    "Spa Calm \u2014 Relaxing Instrumental",
    "Gentle Waves \u2014 Relaxing Instrumental",
    "Tranquil Moments \u2014 Spa Music",
    "Healing Touch \u2014 Spa Music",
    "Ocean Breeze \u2014 Spa Music",
    "Peaceful Mind \u2014 Spa Music",
    "Soft Waterfall \u2014 Spa Music",
    "Morning Calm \u2014 Spa Music",
    "Zen Garden \u2014 Spa Music",
    "Soothing Wind \u2014 Spa Music"
  ],
  "Seduction": [
    "Adorn \u2014 Miguel",
    "Earned It \u2014 The Weeknd",
    "Pony \u2014 Ginuwine",
    "Untitled (How Does It Feel) \u2014 D\u2019Angelo",
    "All of Me \u2014 John Legend",
    "Pretty Wings \u2014 Maxwell",
    "We Belong Together \u2014 Mariah Carey",
    "Love on Top (Instrumental) \u2014 Beyonc\u00e9",
    "Anytime \u2014 Brian McKnight",
    "So Into You \u2014 Tamia"
  ],
  "LuxuryHotel": [
    "Hotel Lounge \u2014 Rita Carlton",
    "Smooth Afternoon \u2014 Rita Carlton",
    "Easy Living \u2014 Rita Carlton",
    "Evening Chill \u2014 Rita Carlton",
    "Soft Jazz Piano \u2014 Luxury Hotel Instrumentals",
    "Elegant Strings \u2014 Luxury Hotel Instrumentals",
    "Ambient Caf\u00e9 \u2014 Luxury Hotel Instrumentals",
    "Lounge Vibes \u2014 Luxury Hotel Instrumentals",
    "Cocktail Hour \u2014 Luxury Hotel Instrumentals",
    "Piano & Guitar Relax \u2014 Luxury Hotel Instrumentals"
  ],
  "Celebration": [
    "Get Lucky \u2014 Daft Punk",
    "Groove Is in the Heart \u2014 Deee-Lite",
    "September \u2014 Earth, Wind & Fire",
    "Juice \u2014 Lizzo",
    "Uptown Funk \u2014 Bruno Mars",
    "Can\u2019t Stop the Feeling \u2014 Justin Timberlake",
    "Levitating \u2014 Dua Lipa",
    "One Dance \u2014 Drake",
    "Temperature \u2014 Sean Paul",
    "Pon de Replay \u2014 Rihanna"
  ],
  "Travel": [
    "Island in the Sun \u2014 Weezer",
    "Adventure of a Lifetime \u2014 Coldplay",
    "Calma (Remix) \u2014 Pedro Cap\u00f3 & Farruko",
    "Jai Ho \u2014 A. R. Rahman & The Pussycat Dolls",
    "Shape of You \u2014 Ed Sheeran",
    "Sun Is Shining \u2014 Bob Marley",
    "Budapest \u2014 George Ezra",
    "Ocean Drive \u2014 Duke Dumont",
    "Walking on Sunshine \u2014 Katrina & The Waves",
    "Waka Waka \u2014 Shakira"
  ],
  "Seasonal": [
    "Winter Song \u2014 Sara Bareilles & Ingrid Michaelson",
    "Here Comes the Sun \u2014 The Beatles",
    "Summertime \u2014 Ella Fitzgerald & Louis Armstrong",
    "Autumn Leaves \u2014 Nat King Cole",
    "Walking in the Air \u2014 Howard Blake",
    "Under the Boardwalk \u2014 The Drifters",
    "What a Wonderful World \u2014 Louis Armstrong",
    "La Vie En Rose \u2014 Edith Piaf",
    "Island in the Sun \u2014 Weezer",
    "Summer Nights \u2014 Olivia Newton-John & John Travolta"
  ],
  "Creativity": [
    "Clair de Lune \u2014 Claude Debussy",
    "Gymnop\u00e9die No. 1 \u2014 Erik Satie",
    "River Flows in You \u2014 Yiruma",
    "Comptine d\u2019un autre \u00e9t\u00e9 \u2014 Yann Tiersen",
    "La Valse d\u2019Am\u00e9lie \u2014 Yann Tiersen",
    "Experience \u2014 Ludovico Einaudi",
    "Nuvole Bianche \u2014 Ludovico Einaudi",
    "Le Onde \u2014 Ludovico Einaudi",
    "Opus 23 \u2014 Dustin O\u2019Halloran",
    "Prelude in E Minor \u2014 Chopin"
  ],
  "Romance": [
    "Redbone \u2014 Childish Gambino",
    "Adorn \u2014 Miguel",
    "Earned It \u2014 The Weeknd",
    "Call Out My Name \u2014 The Weeknd",
    "Wicked Game \u2014 Chris Isaak",
    "Sexual Healing \u2014 Marvin Gaye",
    "Let\u2019s Get It On \u2014 Marvin Gaye",
    "All of Me \u2014 John Legend",
    "Ordinary People \u2014 John Legend",
    "Neighbors Know My Name \u2014 Trey Songz"
  ]
};

Object.assign(library, newCategories);

fs.writeFileSync(filePath, JSON.stringify(library, null, 2));
console.log('Music library updated successfully with 15 categories total.');
