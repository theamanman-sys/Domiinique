const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc, getDocs } = require('firebase/firestore');
const https = require('https');
const crypto = require('crypto');

const firebaseConfig = require('./config.cjs');

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const CATEGORIES = {
  "Biological & Botanical Engine": [
    { title: "The Hidden Life of Trees", author: "Peter Wohlleben", desc: "A fascinating exploration of how trees communicate, cooperate, and form complex social networks in forests through underground fungal networks." },
    { title: "The Botany of Desire", author: "Michael Pollan", desc: "A look at human-plant co-evolution through four plants: apples, tulips, marijuana, and potatoes, showing how they shaped human desires." },
    { title: "African Wormwood: Traditional Uses & Chemical Profiles", author: "Various Researchers", desc: "Technical research papers on Artemisia afra, exploring traditional African medicine, chemical properties, and therapeutic applications." },
    { title: "The Omnivore's Dilemma", author: "Michael Pollan", desc: "An investigation into the food systems that feed America, tracing meals from industrial agriculture to foraging, and their impact on national health." },
    { title: "Entangled Life", author: "Merlin Sheldrake", desc: "How fungi create networks that sustain life on Earth, from decomposing waste to connecting plants in vast underground communication webs." },
    { title: "Guns, Germs, and Steel", author: "Jared Diamond", desc: "The environmental and geographical roots of power, explaining why certain civilizations dominated through agriculture, disease immunity, and technology." },
    { title: "The Body Electric", author: "Robert O. Becker", desc: "Groundbreaking exploration of bio-electricity and how electromagnetic fields influence healing, cellular regeneration, and overall health." },
    { title: "Internal Medicine: A Guide to Systemic Health", author: "Various Medical Experts", desc: "A foundational medical text covering systemic approaches to diagnosis, treatment, and understanding the interconnected nature of human health." },
    { title: "The Self-Healing Body", author: "Various Experts", desc: "Exploring the biochemistry of nutrition, cellular resilience, and the body's innate ability to repair and regenerate when properly supported." },
    { title: "Zoonosis", author: "Various Epidemiologists", desc: "The study of animal-to-human disease transmission patterns, examining how ecological disruption creates pathways for emerging infectious diseases." }
  ],
  "Macro-Economics & Banking Vault": [
    { title: "The Ascent of Money", author: "Niall Ferguson", desc: "A financial history of the world tracing the evolution of money, credit, banking, and the institutions that shaped modern civilization." },
    { title: "The Bitcoin Standard", author: "Saifedean Ammous", desc: "An analysis of hard money through history and the case for Bitcoin as the next evolution of sound monetary systems." },
    { title: "Debt: The First 5,000 Years", author: "David Graeber", desc: "A radical history of debt, money, and economic systems showing how credit and debt have shaped human societies from antiquity to today." },
    { title: "The Creature from Jekyll Island", author: "G. Edward Griffin", desc: "An exposé of the Federal Reserve system, tracing its origins to a secret meeting on Jekyll Island and examining the mechanics of central banking." },
    { title: "Capital in the Twenty-First Century", author: "Thomas Piketty", desc: "A comprehensive analysis of wealth inequality and capital accumulation across centuries, showing how returns on capital outpace economic growth." },
    { title: "Principles for Dealing with the Changing World Order", author: "Ray Dalio", desc: "A study of historical cycles of empires, economies, and currencies to understand the changing global order and prepare for what's ahead." },
    { title: "The Wealth of Nations", author: "Adam Smith", desc: "The foundational text of modern economics, exploring the nature of markets, division of labor, and the invisible hand that guides economic systems." },
    { title: "The Intelligent Investor", author: "Benjamin Graham", desc: "The definitive guide to value investing and wealth preservation, teaching principles of long-term investment strategy and risk management." },
    { title: "Economics in One Lesson", author: "Henry Hazlitt", desc: "A clear, concise primer on basic economic principles, demonstrating how to evaluate policies by their long-term effects on all groups." },
    { title: "Lords of Finance", author: "Liaquat Ahamed", desc: "The story of the four central bankers who triggered the Great Depression, revealing how their decisions shaped the modern financial landscape." }
  ],
  "Architecture & Infrastructure Logic": [
    { title: "The Works: Anatomy of a City", author: "Kate Ascher", desc: "An illustrated guide to the hidden infrastructure systems that make cities function: electricity, water, waste, transportation, and communication networks." },
    { title: "The Power Broker", author: "Robert Caro", desc: "The monumental biography of Robert Moses showing how infrastructure decisions are fundamentally political exercises of power and influence." },
    { title: "The Architecture of Happiness", author: "Alain de Botton", desc: "An exploration of how our built environment affects our wellbeing, examining the connection between aesthetics, design, and human fulfillment." },
    { title: "A Pattern Language", author: "Christopher Alexander", desc: "A groundbreaking catalog of 253 design patterns for human-centric architecture and community planning, from room layouts to urban design." },
    { title: "Bauhaus", author: "Magdalena Droste", desc: "The definitive history of the Bauhaus school, documenting the revolutionary merge of art, craft, and industrial design that shaped modernism." },
    { title: "Smart Cities", author: "Anthony Townsend", desc: "How big data, sensors, and digital infrastructure are creating a new urban utopia while raising critical questions about privacy and control." },
    { title: "The Death and Life of Great American Cities", author: "Jane Jacobs", desc: "A devastating critique of urban planning orthodoxy, arguing for organic, mixed-use neighborhoods as the foundation of vibrant cities." },
    { title: "Sustainable Infrastructure: The Guide to Green Engineering", author: "Various Experts", desc: "A comprehensive guide to designing and building infrastructure systems that are environmentally responsible, resilient, and resource-efficient." },
    { title: "Parisian Modernism: Architecture of the 20th Century", author: "Various Architects", desc: "Documenting the evolution of modernist architecture in Paris through its most influential buildings, designers, and urban transformations." },
    { title: "Manual of Section", author: "Paul Lewis, Marc Tsurumaki, David J. Lewis", desc: "A deep exploration of architectural section drawings, revealing how the vertical layers of buildings define space, structure, and experience." }
  ],
  "Consciousness & The Synthetic Mind": [
    { title: "The Age of AI", author: "Henry Kissinger, Eric Schmidt, Daniel Huttenlocher", desc: "Examining how artificial intelligence is reshaping human society, geopolitics, and the very nature of reality and decision-making." },
    { title: "Superintelligence", author: "Nick Bostrom", desc: "A rigorous analysis of the paths to artificial superintelligence and the existential challenges humanity faces in controlling minds smarter than us." },
    { title: "The Master and His Emissary", author: "Iain McGilchrist", desc: "How the brain's two hemispheres shape our perception of reality, with the right hemisphere providing context and the left providing analytic focus." },
    { title: "I Am a Strange Loop", author: "Douglas Hofstadter", desc: "Exploring the nature of self and consciousness through paradoxical loops of self-reference, showing how 'I' emerges from symbol systems." },
    { title: "The Origin of Consciousness in the Breakdown of the Bicameral Mind", author: "Julian Jaynes", desc: "A controversial theory that consciousness emerged recently in human history when the two hemispheres of the brain ceased operating independently." },
    { title: "Life 3.0", author: "Max Tegmark", desc: "A vision of the future of artificial intelligence and what it means for life, from AI-designed societies to the ultimate fate of consciousness." },
    { title: "The User Illusion", author: "Tor Nørretranders", desc: "The science of consciousness reveals that our conscious mind is the tip of an iceberg, with most processing happening beneath our awareness." },
    { title: "Godel, Escher, Bach", author: "Douglas Hofstadter", desc: "A brilliant synthesis of mathematics, art, and music exploring the nature of meaning, self-reference, and the fundamental patterns of intelligence." },
    { title: "Scary Smart", author: "Mo Gawdat", desc: "A former Google engineer's analysis of the AI trajectory and what humanity must do to ensure artificial intelligence serves rather than dominates us." },
    { title: "Cybernetics", author: "Norbert Wiener", desc: "The founding text of cybernetics, exploring control and communication in animals, machines, and societies as unified feedback systems." }
  ],
  "Family Dynamics & Relational Geometry": [
    { title: "The State of Affairs", author: "Esther Perel", desc: "Rethinking infidelity and modern relationships, exploring how affairs can reveal deeper truths about desire, commitment, and human connection." },
    { title: "The Seven Principles for Making Marriage Work", author: "John Gottman", desc: "Based on decades of research, the seven evidence-based principles that predict marital success and tools for strengthening relationships." },
    { title: "Adult Children of Emotionally Immature Parents", author: "Lindsay Gibson", desc: "How to recognize and heal from the patterns created by growing up with emotionally unavailable, self-absorbed, or immature parents." },
    { title: "The Boy Crisis", author: "Warren Farrell", desc: "An examination of the crisis facing boys in education, employment, and emotional health, and what society needs to do to support them." },
    { title: "Attached", author: "Amir Levine", desc: "Understanding adult attachment styles and how they shape our romantic relationships, with tools for finding and maintaining healthy connections." },
    { title: "Nonviolent Communication", author: "Marshall Rosenberg", desc: "A practical framework for compassionate communication, teaching the language of empathy, honesty, and diplomacy in personal and professional life." },
    { title: "The Drama of the Gifted Child", author: "Alice Miller", desc: "How childhood trauma shapes adult personality, and the journey of recovering the authentic self hidden beneath protective adaptations." },
    { title: "Systems Theory in Family Therapy", author: "Various Therapists", desc: "Understanding the family as an interconnected system where each member's behavior affects the whole, and how to create systemic change." }
  ],
  "Predatory Logic & Manipulation": [
    { title: "Propaganda", author: "Edward Bernays", desc: "The seminal work on the engineering of consent, revealing how public opinion is manufactured through psychological manipulation and media control." },
    { title: "The 48 Laws of Power", author: "Robert Greene", desc: "A masterful distillation of historical strategies for acquiring, maintaining, and defending power in any social or professional arena." },
    { title: "The Art of Seduction", author: "Robert Greene", desc: "An exploration of seduction as a form of power, analyzing historical seducers and the psychological tactics they employed to captivate and influence." },
    { title: "Snakes in Suits", author: "Paul Babiak", desc: "How psychopaths thrive in corporate environments, their manipulation tactics, and how to recognize and protect yourself from workplace predators." },
    { title: "Influence: The Psychology of Persuasion", author: "Robert Cialdini", desc: "The six universal principles of persuasion explained through decades of research on why people say yes and how to apply ethical influence." },
    { title: "The Prince", author: "Niccolo Machiavelli", desc: "The timeless treatise on political power, strategy, and statecraft that revealed the realistic mechanics of leadership and control." },
    { title: "The Dictionary of Body Language", author: "Joe Navarro", desc: "A comprehensive guide to reading nonverbal communication, decoding the hidden signals people send through posture, gesture, and expression." },
    { title: "Games People Play", author: "Eric Berne", desc: "The psychological analysis of social interactions as games, revealing the hidden transactions and ulterior motives in everyday human behavior." },
    { title: "The Psychopath Test", author: "Jon Ronson", desc: "A journey into the world of psychopathy, exploring how we diagnose and understand the minds of those who lack empathy and conscience." }
  ],
  "The Generalist's Mastery": [
    { title: "The Federalist Papers", author: "Alexander Hamilton, James Madison, John Jay", desc: "The definitive defense of the U.S. Constitution, offering timeless insights into republican government, federalism, and political institutions." },
    { title: "Leviathan", author: "Thomas Hobbes", desc: "The foundational work of social contract theory, arguing for a sovereign authority to prevent the war of all against all in the state of nature." },
    { title: "The Social Contract", author: "Jean-Jacques Rousseau", desc: "A philosophical exploration of legitimate political authority and the conditions under which individuals unite to form a collective society." },
    { title: "On War", author: "Carl von Clausewitz", desc: "The most important treatise on military strategy, introducing concepts like the fog of war, friction, and war as an extension of politics." },
    { title: "The Book of Five Rings", author: "Miyamoto Musashi", desc: "The classic Japanese text on strategy, tactics, and the martial mindset, written by an undefeated swordsman for all forms of conflict." },
    { title: "The Daily Stoic", author: "Ryan Holiday", desc: "A year of daily meditations from the Stoic philosophers, offering practical wisdom for resilience, clarity, and inner peace." },
    { title: "Thus Spoke Zarathustra", author: "Friedrich Nietzsche", desc: "Nietzsche's masterpiece introducing the Uebermensch, the death of God, and the eternal recurrence through poetic philosophical narrative." },
    { title: "Beyond Good and Evil", author: "Friedrich Nietzsche", desc: "A fierce critique of traditional morality, exploring the will to power and the complex nature of human existence beyond simple moral binaries." },
    { title: "Meditations", author: "Marcus Aurelius", desc: "The private journal of the Roman Emperor offering timeless Stoic wisdom on inner peace, resilience, and the art of living with purpose." },
    { title: "The War of Art", author: "Steven Pressfield", desc: "Identifying and overcoming the resistance that blocks creative expression, a guide to the inner battle every artist and creator must fight." },
    { title: "Letters to a Young Poet", author: "Rainer Maria Rilke", desc: "Ten letters of profound wisdom on creativity, solitude, love, and what it truly means to live as an artist in the world." },
    { title: "The Artist's Way", author: "Julia Cameron", desc: "A transformative 12-week program for recovering creativity, using morning pages and artist dates to unblock creative expression." },
    { title: "Complete Works of Afewerk Tekle", author: "Afewerk Tekle", desc: "The collected masterworks of Ethiopia's most celebrated modern artist, spanning paintings, sculptures, and stained glass that define Ethiopian artistic identity." },
    { title: "Biography of Emperor Menelik II", author: "Various Historians", desc: "The life and legacy of the Ethiopian emperor who modernized the nation and led the victorious defense at the Battle of Adwa against colonial invasion." },
    { title: "Empress Taytu Betul: Lioness of Ethiopia", author: "Various Historians", desc: "The remarkable story of Empress Taytu Betul, the strategic and political mastermind who co-founded Addis Ababa and defended Ethiopian sovereignty." }
  ]
};

function fetchCover(searchTerm) {
  return new Promise((resolve) => {
    const query = encodeURIComponent(searchTerm);
    const url = `https://openlibrary.org/search.json?q=${query}&limit=5`;
    https.get(url, { headers: { 'User-Agent': 'DomiiniqueSeeder/1.0' } }, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          if (parsed.docs && parsed.docs.length > 0) {
            const doc = parsed.docs[0];
            const coverId = doc.cover_i || doc.cover_id;
            if (coverId) {
              resolve(`https://covers.openlibrary.org/b/id/${coverId}-L.jpg`);
            } else if (doc.isbn && doc.isbn[0]) {
              resolve(`https://covers.openlibrary.org/b/isbn/${doc.isbn[0]}-L.jpg`);
            } else {
              resolve(null);
            }
          } else {
            resolve(null);
          }
        } catch (e) {
          resolve(null);
        }
      });
    }).on('error', () => resolve(null));
  });
}

async function seed() {
  console.log("Checking existing books in database...");
  const snapshot = await getDocs(collection(db, 'books'));
  const existingTitles = new Set();
  snapshot.forEach(d => {
    const data = d.data();
    if (data.title) existingTitles.add(data.title.toLowerCase().trim());
  });
  console.log(`Found ${existingTitles.size} existing books.`);

  let totalAdded = 0;
  let totalSkipped = 0;
  let coversFound = 0;

  for (const [category, books] of Object.entries(CATEGORIES)) {
    console.log(`\n--- ${category} ---`);
    let catAdded = 0;
    let catSkipped = 0;

    for (const book of books) {
      const titleLower = book.title.toLowerCase().trim();

      if (existingTitles.has(titleLower)) {
        console.log(`  SKIP: ${book.title}`);
        catSkipped++;
        totalSkipped++;
        continue;
      }

      const searchTerm = `${book.title} ${book.author}`.replace(/[^a-zA-Z0-9 ]/g, ' ');
      const coverUrl = await fetchCover(searchTerm);
      if (coverUrl) coversFound++;

      const docId = crypto.randomUUID();
      const bookData = {
        id: docId,
        title: book.title,
        author: book.author,
        description: book.desc,
        category: category,
        price: 1500 + Math.floor(Math.random() * 3500),
        image: coverUrl || 'assets/Blueprint/Journal.jpg',
        status: 'active',
        rating: +(4 + Math.random() * 1).toFixed(1),
        rare: Math.random() > 0.8,
        timestamp: new Date().toISOString()
      };

      try {
        await setDoc(doc(db, 'books', docId), bookData);
        existingTitles.add(titleLower);
        catAdded++;
        totalAdded++;
        const icon = coverUrl ? 'COVER' : 'NOIMG';
        console.log(`  [${icon}] ${book.title}`);
      } catch (e) {
        console.error(`  ERROR: ${book.title}: ${e.message}`);
      }

      await new Promise(r => setTimeout(r, 300));
    }

    console.log(`  -> Added: ${catAdded} | Skipped (duplicates): ${catSkipped}`);
  }

  console.log(`\n${'='.repeat(50)}`);
  console.log(`SEEDING COMPLETE`);
  console.log(`  Added:   ${totalAdded} new books`);
  console.log(`  Skipped: ${totalSkipped} duplicates`);
  console.log(`  Covers:  ${coversFound} found`);
  console.log(`${'='.repeat(50)}`);
  process.exit(0);
}

seed().catch(console.error);
