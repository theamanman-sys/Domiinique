const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const firebaseConfig = require('./config.cjs');
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Map every old phase name to its new name and order
const phaseMap = {
  // Original phases (keep)
  "PHASE I: HUMAN NATURE": { phase: "PHASE I: HUMAN NATURE", phaseOrder: 1 },
  "PHASE II: STATECRAFT": { phase: "PHASE II: STATECRAFT", phaseOrder: 2 },
  "PHASE III: SYSTEMS THINKING": { phase: "PHASE III: SYSTEMS THINKING", phaseOrder: 3 },
  "PHASE IV: AESTHETIC INTEGRITY": { phase: "PHASE IV: AESTHETIC INTEGRITY", phaseOrder: 4 },
  "PHASE V: UNBOUND LOGIC": { phase: "PHASE V: UNBOUND LOGIC", phaseOrder: 5 },
  "PHASE VI: THE IMPERIAL ROOT": { phase: "PHASE VI: THE IMPERIAL ROOT", phaseOrder: 6 },

  // User's new phases
  "PHASE VII: MACRO-ECONOMICS & THE ARCHITECTURE OF VALUE": { phase: "PHASE VII: MACRO-ECONOMICS & THE ARCHITECTURE OF VALUE", phaseOrder: 7 },
  "PHASE VIII: BIOLOGICAL SOVEREIGNTY & THE MEDICAL ENGINE": { phase: "PHASE VIII: BIOLOGICAL SOVEREIGNTY & THE MEDICAL ENGINE", phaseOrder: 8 },
  "PHASE IX: INFRASTRUCTURE & URBAN GEOMETRY": { phase: "PHASE IX: INFRASTRUCTURE & URBAN GEOMETRY", phaseOrder: 9 },
  "PHASE X: PREDATORY LOGIC & THE STUDY OF MANIPULATION": { phase: "PHASE X: PREDATORY LOGIC & THE STUDY OF MANIPULATION", phaseOrder: 10 },
  "PHASE XI: ETHIOPIAN IMPERIAL EXCELLENCE": { phase: "PHASE XI: ETHIOPIAN IMPERIAL EXCELLENCE", phaseOrder: 11 },

  // Old I-VII category names -> new phase names
  "IV. CONSCIOUSNESS & THE SYNTHETIC MIND (The AI Logic)": { phase: "THE SYSTEMIC ARCHIVES", phaseOrder: 12 },
  "V. FAMILY DYNAMICS & RELATIONAL GEOMETRY (The Social Logic)": { phase: "THE SYSTEMIC ARCHIVES", phaseOrder: 12 },
  "VII. THE REMAINING VOLUMES (The Generalist's Mastery)": { phase: "THE SYSTEMIC ARCHIVES", phaseOrder: 12 },

  // Map by category for any remaining books
  "Consciousness & The Synthetic Mind": { phase: "THE SYSTEMIC ARCHIVES", phaseOrder: 12 },
  "Family Dynamics & Relational Geometry": { phase: "THE SYSTEMIC ARCHIVES", phaseOrder: 12 },
  "The Generalist's Mastery": { phase: "THE SYSTEMIC ARCHIVES", phaseOrder: 12 }
};

// Books with specific new descriptions
const descriptions = {
  "PHASE VII: MACRO-ECONOMICS & THE ARCHITECTURE OF VALUE": {
    "The Ascent of Money": "The evolution of banking.",
    "Debt: The First 5,000 Years": "Understanding the root of human transaction.",
    "The Creature from Jekyll Island": "The logic of central banking.",
    "Capital in the Twenty-First Century": "The flow of global wealth.",
    "The Bitcoin Standard": "The future of decentralized sovereignty.",
    "The Alchemy of Finance": "How perception changes markets.",
    "Basic Economics": "The baseline of resource management."
  },
  "PHASE VIII: BIOLOGICAL SOVEREIGNTY & THE MEDICAL ENGINE": {
    "The Emperor of All Maladies": "The history of the medical struggle.",
    "The Body Electric": "The bio-electrical nature of life.",
    "The Botany of Desire": "How plants manipulate humans.",
    "Medical Nemesis": "A critique of modern medical systems.",
    "Being Mortal": "How a nation handles life and death.",
    "The Hidden Life of Trees": "Systemic communication in nature.",
    "African Herbal Pharmacopoeia": "To ground your study of African Wormwood and traditional medicine."
  },
  "PHASE IX: INFRASTRUCTURE & URBAN GEOMETRY": {
    "The Works: Anatomy of a City": "How electricity, water, and waste actually move.",
    "The Power Broker": "How physical infrastructure creates political power."
  },
  "PHASE X: PREDATORY LOGIC & THE STUDY OF MANIPULATION": {
    "Propaganda": "How the public mind is shaped.",
    "The Prince": "The core of political manipulation.",
    "The Art of Seduction": "The psychology of the social signal.",
    "Snakes in Suits": "Identifying predatory patterns in high-level systems.",
    "Games People Play": "The patterns of human interaction."
  },
  "PHASE XI: ETHIOPIAN IMPERIAL EXCELLENCE": {
    "The Autobiography of Emperor Haile Selassie I": "The leader's own voice on Ethiopian sovereignty and modernization.",
    "Pioneers of Change in Ethiopia": "The intellectuals and reformers who shaped modern Ethiopia.",
    "The Ethiopian Orthodox Church: A History": "The spiritual and cultural foundation of Ethiopian identity.",
    "The Battle of Adwa: Reflections on Ethiopia's Historic Victory": "The definitive stand against colonial domination.",
    "Haile Selassie's Government": "The structure and vision of Ethiopia's imperial administration."
  }
};

async function main() {
  const snap = await getDocs(collection(db, 'books'));
  let renamed = 0;

  for (const d of snap.docs) {
    const data = d.data();
    const updates = {};

    // Rename by current phase name
    if (data.phase && phaseMap[data.phase]) {
      updates.phase = phaseMap[data.phase].phase;
      updates.phaseOrder = phaseMap[data.phase].phaseOrder;
    }

    // For books still using old category name as phase
    if (!updates.phase && data.category && phaseMap[data.category]) {
      updates.phase = phaseMap[data.category].phase;
      updates.phaseOrder = phaseMap[data.category].phaseOrder;
    }

    // Ensure correct order for already-correct phase names
    if (!updates.phase && data.phase) {
      for (const [oldName, mapping] of Object.entries(phaseMap)) {
        if (mapping.phase === data.phase && data.phaseOrder !== mapping.phaseOrder) {
          updates.phaseOrder = mapping.phaseOrder;
          break;
        }
      }
    }

    // Add description if book matches
    const targetPhase = updates.phase || data.phase;
    if (targetPhase && descriptions[targetPhase]) {
      for (const [title, desc] of Object.entries(descriptions[targetPhase])) {
        if (data.title && data.title.toLowerCase().includes(title.toLowerCase())) {
          updates.description = desc;
          break;
        }
      }
    }

    if (Object.keys(updates).length > 0) {
      await updateDoc(doc(db, 'books', d.id), updates);
      renamed++;
    }
  }

  console.log(`Updated ${renamed} books`);
  process.exit(0);
}
main().catch(console.error);
