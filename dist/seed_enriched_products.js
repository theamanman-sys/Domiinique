const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBYc4qoxM22kPu4Y9Pl-b-YpcNFu9gxdFc",
  authDomain: "domiiniquedb.firebaseapp.com",
  projectId: "domiiniquedb",
  storageBucket: "domiiniquedb.firebasestorage.app",
  messagingSenderId: "651039104149",
  appId: "1:651039104149:web:658b8235f5134a8fda4f9c",
  measurementId: "G-F34V0JR3GE"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const ENRICHED_PRODUCTS = [
  {
    id: '1',
    name: 'Sacred Aroma Oils',
    category: 'Ritual',
    price: 2400,
    img: 'assets/Shop/aroma oils.jpg',
    status: 'active',
    desc: 'Spiritually infused botanical oils crafted for introspection and spiritual awakening. Ideal for anointing pulse points or chakras during meditation to uplift mood and promote emotional balance.'
  },
  {
    id: '2',
    name: 'Black Mahakala Tibetan Incense',
    category: 'Ritual',
    price: 980,
    img: 'assets/Shop/black_mahakala_tibetan_incense.jpg',
    status: 'active',
    desc: 'Handcrafted according to ancient Himalayan recipes. This incense symbolizes the ultimate truth, designed to destroy mental chatter, overcome obstacles, and purify the energy of any space.'
  },
  {
    id: '3',
    name: 'Ceremonial Candle Set',
    category: 'Sensory',
    price: 1650,
    img: 'assets/Shop/candles.jpg',
    status: 'active',
    desc: 'A collection of candles representing purification, renewal, and the eternal flame of the soul. Each color is tuned to specific energies: white for clarity, red for strength, and blue for healing.'
  },
  {
    id: '4',
    name: 'Corinthian Wind Chime Bells',
    category: 'Sensory',
    price: 3200,
    img: 'assets/Shop/corinthian_bells.jpg',
    status: 'active',
    desc: 'Precisely hand-tuned chimes that produce a deep, resonant sound reminiscent of church bells. Meticulously crafted to reduce stress and create a calming ambiance in any light breeze.'
  },
  {
    id: '5',
    name: 'Artisan Mist Diffuser',
    category: 'Wellness',
    price: 4500,
    img: 'assets/Shop/diffuser.jpg',
    status: 'active',
    desc: 'Ultrasonic technology paired with handcrafted blown glass covers. Delivers a fine mist to enhance mood and humidify air, featuring multi-LED lighting and an automatic safety shut-off.'
  },
  {
    id: '6',
    name: 'Conscious Living Journal',
    category: 'Stationery',
    price: 1200,
    img: 'assets/Shop/notebook.jpg',
    status: 'active',
    desc: 'A space for intentional reflection and stream-of-consciousness writing. Designed to evoke self-discovery, release difficult emotions, and cultivate presence in the current moment.'
  },
  {
    id: '7',
    name: 'Sacred Tea Ceremony Set',
    category: 'Wellness',
    price: 5800,
    img: 'assets/Shop/tea_set.jpg',
    status: 'active',
    desc: 'Transforms the act of drinking tea into a spiritual ritual of presence. Includes traditional components like celadon cups and auspicious symbols to foster mindful harmony and connection.'
  },
  {
    id: '8',
    name: 'Presence Practice Mat',
    category: 'Wellness',
    price: 3800,
    img: 'assets/Shop/yoga_mat.jpg',
    status: 'active',
    desc: 'A stable foundation for the mind-body connection. Centering practitioners in their bodies, this mat aids in developing strength and balance while cultivating a sacred space for exploration.'
  }
];

async function seedProducts() {
  console.log("🚀 Seeding enriched products to Firestore...");
  for (const p of ENRICHED_PRODUCTS) {
    await setDoc(doc(db, 'products', p.id), p);
    console.log(`✅ Seeded: ${p.name}`);
  }
  console.log("✨ Shop products enriched successfully.");
  process.exit(0);
}

seedProducts().catch(console.error);
