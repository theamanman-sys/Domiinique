const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getCountFromServer } = require('firebase/firestore');

const firebaseConfig = {
  apiKey: "AIzaSyBYc4qoxM22kPu4Y9Pl-b-YpcNFu9gxdFc",
  authDomain: "domiiniquedb.firebaseapp.com",
  projectId: "domiiniquedb",
  storageBucket: "domiiniquedb.firebasestorage.app",
  messagingSenderId: "651039104149",
  appId: "1:651039104149:web:658b8235f5134a8fda4f9c"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const TOPICS = [
    'Philosophy', 'Psychology', 'Spirituality', 'Esoteric', 'Mystery', 
    'Consciousness', 'Ancient wisdom', 'Metaphysics', 'Mindfulness',
    'Quantum physics', 'Holographic universe', 'String theory', 
    'Higher dimensions', 'Sacred geometry', 'Hermeticism', 'Occult philosophy',
    'Cognitive science', 'Existentialism', 'Alchemy', 'Theosophy',
    'Transpersonal psychology', 'Neuroplasticity', 'Integrative medicine', 
    'Astrobiology', 'Complexity science', 'Symbolism', 'Phenomenology', 
    'Post-humanism', 'Deep ecology', 'Vedic science',
    'Holographic', 'Systems', 'Conscious living', 'Modern living signatures',
    'Galactic history', 'Cybernetics', 'Epigenetics', 'Noosphere',
    'Sacred geography', 'Chronobiology'
];

async function checkDistribution() {
    console.log('Category | Count');
    console.log('---------|-------');
    let total = 0;
    for (const topic of TOPICS) {
        try {
            const q = query(collection(db, 'books'), where('category', '==', topic));
            const snapshot = await getCountFromServer(q);
            const count = snapshot.data().count;
            console.log(`${topic.padEnd(25)} | ${count}`);
            total += count;
        } catch (e) {
            console.log(`${topic.padEnd(25)} | Error: ${e.message}`);
        }
        await new Promise(r => setTimeout(r, 200)); // Be gentle
    }
    console.log('---------|-------');
    console.log(`${'Total'.padEnd(25)} | ${total}`);
    process.exit(0);
}

checkDistribution();
