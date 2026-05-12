const { initializeApp } = require('firebase/app');
const { getFirestore, doc, setDoc } = require('firebase/firestore');
const fs = require('fs');
const path = require('path');

// Use the SAME Firebase project that the website uses (env-config.js)
const firebaseConfig = {
  apiKey: "AIzaSyArOatx6mi-loTY5YkUHZONEzR5CYUIZ4A",
  authDomain: "domiinique-db.firebaseapp.com",
  projectId: "domiinique-db",
  storageBucket: "domiinique-db.firebasestorage.app",
  messagingSenderId: "979202038788",
  appId: "1:979202038788:web:61f9055a91f7f2da52a951",
  measurementId: "G-BV91XC3N3R"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ── Parse product.txt ──────────────────────────────────────
function parseProductTxt(filepath) {
  const raw = fs.readFileSync(filepath, 'utf-8');
  const lines = raw.split(/\r?\n/).map(l => l.trim()).filter(l => l.length > 0);

  const entries = [];
  let currentUrl = null;
  let currentName = null;

  for (const line of lines) {
    if (line.startsWith('http')) {
      if (currentName) {
        entries.push({ url: currentUrl, name: currentName });
      }
      currentUrl = line;
      currentName = null;
    } else if (line === 'PENDING ACQUISITION' || line === 'INTEGRATED') {
      continue;
    } else {
      if (!currentName) {
        currentName = line;
      }
    }
  }
  if (currentUrl && currentName) {
    entries.push({ url: currentUrl, name: currentName });
  }

  return entries;
}

const rawProducts = parseProductTxt(path.join(__dirname, 'product.txt'));

// ── Enrich with categories, prices, descriptions ───────────
function classifyProduct(name) {
  const u = name.toUpperCase();

  if (u.includes('WALL PANEL') || u.includes('ACOUSTIC')) return { cat: 'Sensory', price: 8500, desc: 'High-density acoustic felt panels that transform any room into a sound sanctuary. Reduces echo and enhances auditory clarity for meditation, music, and focused work.' };
  if (u.includes('OLIVE') || u.includes('OLEA')) return { cat: 'Wellness', price: 12000, desc: 'Ancient living trees that bring Mediterranean tranquility indoors. Olea Europaea — a symbol of peace, longevity, and conscious connection to nature.' };
  if (u.includes('BONSAI')) return { cat: 'Sensory', price: 6500, desc: 'A living meditation in miniature form. Carefully pruned and shaped, each bonsai embodies patience, balance, and the art of intentional cultivation.' };
  if (u.includes('KITCHEN SCALE')) return { cat: 'Wellness', price: 3500, desc: 'Precision digital kitchen scale for conscious cooking and portion awareness. A tool for mindful nourishment and culinary precision.' };
  if (u.includes('VACUUM SEALER')) return { cat: 'Wellness', price: 4800, desc: 'High-performance vacuum sealer for preserving food freshness and reducing waste. An essential tool for intentional kitchen management.' };
  if (u.includes('ALKALINE') || u.includes('WATER IONIZER') || u.includes('FILTRATION')) return { cat: 'Wellness', price: 28500, desc: 'Advanced alkaline water ionizer and filtration system that transforms your water into a source of vitality. Mineral-rich, pH-balanced hydration.' };
  if (u.includes('ROBOTIC KITCHEN')) return { cat: 'Wellness', price: 95000, desc: 'The future of conscious cooking — an automated culinary system that prepares meals with precision while you focus on presence and creativity.' };
  if (u.includes('DREAME') || u.includes('CYBER')) return { cat: 'Wellness', price: 42000, desc: 'The Dreame Cyber 10 Ultra — a revolution in home cleaning intelligence. Autonomous, adaptive, and designed for the pristine living environment.' };
  if (u.includes('AIR QUALITY')) return { cat: 'Wellness', price: 15000, desc: 'Advanced air quality monitoring system that tracks particulates, VOCs, humidity and temperature. Breathe consciously with real-time environmental awareness.' };
  if (u.includes('SAUNA BOX') || u.includes('PORTABLE SAUNA')) return { cat: 'Wellness', price: 18000, desc: 'Portable infrared sauna box for detoxification, relaxation and cellular rejuvenation. Your personal wellness chamber, anywhere.' };
  if (u.includes('MASSAGE BED')) return { cat: 'Wellness', price: 32000, desc: 'Adjustable massage bed with targeted vibration and heat therapy. Engineered for deep muscle recovery, stress release, and restorative sleep.' };
  if (u.includes('VERTU') || u.includes('META RING')) return { cat: 'Sensory', price: 55000, desc: 'The Vertu AI Meta Ring — a fusion of luxury craftsmanship and artificial intelligence. Wearable consciousness technology that adapts to your bio-rhythms.' };
  if (u.includes('RAY-BAN') || u.includes('META SMART GLASSES')) return { cat: 'Sensory', price: 35000, desc: 'Ray-Ban Meta Smart Glasses Gen 2 — capture moments hands-free with integrated AI. A seamless bridge between your visual world and digital consciousness.' };
  if (u.includes('NEURO-FEEDBACK') || u.includes('NEUROFEEDBACK HEADPHONES')) return { cat: 'Sensory', price: 28000, desc: 'Neuro-feedback headphones that train your brainwave patterns for deeper focus, relaxation, and cognitive enhancement. Listen to your mind.' };
  if (u.includes('ROBOROCK') || u.includes('QREVO')) return { cat: 'Wellness', price: 38000, desc: 'Roborock Qrevo Curv 2 Pro — intelligent robotic cleaning with adaptive navigation. Maintain a pristine environment effortlessly.' };
  if (u.includes('INFRARED SAUNA BLANKET')) return { cat: 'Wellness', price: 9500, desc: 'Infrared sauna blanket for deep detoxification and cellular repair. A portable sanctuary for daily thermotherapy and relaxation.' };
  if (u.includes('EEG') || u.includes('NEUROFEEDBACK')) return { cat: 'Sensory', price: 45000, desc: 'Closed-loop EEG neurofeedback system for real-time brainwave training. Explore the landscape of your own consciousness with precision.' };
  if (u.includes('HOLOGRAPHIC') || u.includes('HERITAGE LEDGER')) return { cat: 'Ritual', price: 22000, desc: 'Holographic Heritage Ledger — a digital-physical hybrid archive for preserving ancestral knowledge, personal legacy, and sacred documentation.' };
  if (u.includes('LUMINA') || u.includes('SMART MIRROR')) return { cat: 'Sensory', price: 16000, desc: 'Lumina Smart Mirror — a reflective AI interface that responds to your presence. Displays biometrics, affirmations, and atmospheric data.' };
  if (u.includes('BIO-WELL') || u.includes('GDV')) return { cat: 'Wellness', price: 52000, desc: 'Bio-Well GDV Camera — visualize your bio-energetic field with gas discharge visualization technology. See the aura of your vitality.' };
  if (u.includes('SYSTEMIC DIFFUSION') || u.includes('AROMA 360')) return { cat: 'Sensory', price: 14000, desc: 'The Systemic Diffusion system by Aroma 360 — whole-environment scent delivery engineered for atmospheric transformation. Inhabit your signature fragrance.' };
  if (u.includes('PEMF') || u.includes('PULSED ELECTROMAGNETIC')) return { cat: 'Wellness', price: 22000, desc: 'PEMF therapy mat delivering pulsed electromagnetic fields to stimulate cellular repair, reduce inflammation, and restore natural energy balance.' };
  if (u.includes('BINAURAL') || u.includes('BRAINTAP')) return { cat: 'Sensory', price: 19000, desc: 'Binaural beat generator and BrainTap headset for auditory brainwave entrainment. Deepen meditation, enhance creativity, and synchronize your hemispheres.' };
  if (u.includes('SINGING BOWL') || u.includes('QUARTZ')) return { cat: 'Ritual', price: 7500, desc: 'Quartz crystal singing bowls — precision-tuned to the chakra frequencies. Each strike resonates through your being, clearing and aligning your energy centers.' };
  if (u.includes('SHUNGITE')) return { cat: 'Ritual', price: 4500, desc: 'Shungite pyramids — one of Earth\'s oldest minerals, known for EMF protection and purification. A grounding presence for any sacred space.' };
  if (u.includes('MALACHITE')) return { cat: 'Ritual', price: 3800, desc: 'Malachite — the stone of transformation. Known for its deep green bands and powerful heart-chakra activation. A catalyst for emotional healing.' };
  if (u.includes('SELENITE')) return { cat: 'Ritual', price: 3200, desc: 'Selenite — the white light crystal. Known for its high-vibrational cleansing properties, it clears stagnant energy and connects you to higher consciousness.' };
  if (u.includes('ETHIOPIAN OPAL')) return { cat: 'Ritual', price: 5800, desc: 'Ethiopian Opal — a fire within stone. Prized for its mesmerizing play of color, it amplifies emotions and awakens creativity and passion.' };
  if (u.includes('AMETHYST')) return { cat: 'Ritual', price: 2800, desc: 'Amethyst — the stone of spiritual protection and purification. A powerful meditation ally that calms the mind and opens the crown chakra.' };
  if (u.includes('ANCESTOR') || u.includes('CODE OF THE FUTURE')) return { cat: 'Ritual', price: 12000, desc: 'Spirit of the Ancestors, Code of the Future — a ceremonial artifact bridging ancestral wisdom with future consciousness. A living sigil of legacy.' };

  return { cat: 'Sensory', price: 5000, desc: 'A curated conscious living tool designed to elevate your sensory environment and support intentional daily practice.' };
}

// ── Try to resolve Pinterest pin URL ────────────────────────
async function resolvePinterestUrl(url) {
  try {
    const resp = await fetch(url, { method: 'HEAD', redirect: 'follow', signal: AbortSignal.timeout(8000) });
    return resp.url || url;
  } catch {
    return url;
  }
}

async function extractImageFromPinterestPage(fullUrl) {
  try {
    const resp = await fetch(fullUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36'
      },
      signal: AbortSignal.timeout(10000)
    });
    const html = await resp.text();

    // Try to extract from meta tags
    const metaMatch = html.match(/<meta[^>]+property="og:image"[^>]+content="([^"]+)"/i);
    if (metaMatch) return metaMatch[1];

    const metaMatch2 = html.match(/<meta[^>]+name="og:image"[^>]+content="([^"]+)"/i);
    if (metaMatch2) return metaMatch2[1];

    const srcMatch = html.match(/src="(https:\/\/i\.pinimg\.com\/[^"]+)"/i);
    if (srcMatch) return srcMatch[1];

    // Try to find any pinimg URL
    const pinImg = html.match(/https:\/\/i\.pinimg\.com\/[^"'\s]+/i);
    if (pinImg) return pinImg[0];

    return null;
  } catch {
    return null;
  }
}

// Try to get product image via web search
async function searchProductImage(productName) {
  try {
    const searchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(productName + ' product')}`;
    const resp = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      signal: AbortSignal.timeout(8000)
    });
    const html = await resp.text();
    const imgMatch = html.match(/src="(https:[^"]+\.(?:jpg|jpeg|png|webp)[^"]*)"/i);
    return imgMatch ? imgMatch[1] : null;
  } catch {
    return null;
  }
}

// ── Main ────────────────────────────────────────────────────
async function seedShopProducts() {
  console.log(`\n Parsed ${rawProducts.length} products from product.txt\n`);

  let seededCount = 0;
  let startId = 9; // IDs 1-8 are already used by existing products

  for (const [idx, raw] of rawProducts.entries()) {
    const name = raw.name;
    const pinUrl = raw.url;
    const { cat, price, desc } = classifyProduct(name);
    const productId = String(startId + idx);
    const nameSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/_+/g, '_').replace(/^_|_$/g, '');

    console.log(`\n[${productId}] ${name}`);
    console.log(`   Pin URL: ${pinUrl}`);
    console.log(`   Category: ${cat} | Price: ${price} ETB`);

    // Try to resolve Pinterest URL -> image
    let imgUrl = null;
    const resolvedUrl = await resolvePinterestUrl(pinUrl);
    console.log(`   Resolved: ${resolvedUrl}`);

    if (resolvedUrl && resolvedUrl.includes('pinterest.com')) {
      imgUrl = await extractImageFromPinterestPage(resolvedUrl);
      if (imgUrl) console.log(`   Image from Pinterest: ${imgUrl.substring(0, 80)}...`);
    }

    // Fallback: try google image search
    if (!imgUrl) {
      console.log('   Pinterest extraction failed, trying web search...');
      imgUrl = await searchProductImage(name);
      if (imgUrl) console.log(`   Image from web: ${imgUrl.substring(0, 80)}...`);
    }

    // Final fallback to placeholder
    if (!imgUrl) {
      imgUrl = 'assets/Shop/placeholder.jpg';
      console.log('   Using placeholder image');
    }

    const product = {
      id: productId,
      name: name,
      category: cat,
      price: price,
      img: imgUrl,
      status: 'active',
      desc: desc
    };

    try {
      await setDoc(doc(db, 'products', productId), product);
      console.log(`   ✓ Seeded: ${name}`);
      seededCount++;
    } catch (err) {
      console.error(`   ✗ Failed to seed ${name}:`, err.message);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 500));
  }

  console.log(`\n Done! Seeded ${seededCount} products.`);
  process.exit(0);
}

seedShopProducts().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
