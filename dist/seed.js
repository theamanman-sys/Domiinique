const { initializeApp } = require('firebase/app');
const { getFirestore, collection, doc, setDoc } = require('firebase/firestore');

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

const DEFAULT_PRODUCTS = [
  {id:1,name:'Sacred Aroma Oils',category:'Ritual',price:2400,img:'assets/Shop/aroma oils.jpg',status:'active',desc:'Spiritually infused botanical oils crafted for introspection and spiritual awakening. Ideal for anointing pulse points or chakras during meditation to uplift mood and promote emotional balance.'},
  {id:2,name:'Black Mahakala Tibetan Incense',category:'Ritual',price:980,img:'assets/Shop/black_mahakala_tibetan_incense.jpg',status:'active',desc:'Handcrafted according to ancient Himalayan recipes. This incense symbolizes the ultimate truth, designed to destroy mental chatter, overcome obstacles, and purify the energy of any space.'},
  {id:3,name:'Ceremonial Candle Set',category:'Sensory',price:1650,img:'assets/Shop/candles.jpg',status:'active',desc:'A collection of candles representing purification, renewal, and the eternal flame of the soul. Each color is tuned to specific energies: white for clarity, red for strength, and blue for healing.'},
  {id:4,name:'Corinthian Wind Chime Bells',category:'Sensory',price:3200,img:'assets/Shop/corinthian_bells.jpg',status:'active',desc:'Precisely hand-tuned chimes that produce a deep, resonant sound reminiscent of church bells. Meticulously crafted to reduce stress and create a calming ambiance in any light breeze.'},
  {id:5,name:'Artisan Mist Diffuser',category:'Wellness',price:4500,img:'assets/Shop/diffuser.jpg',status:'active',desc:'Ultrasonic technology paired with handcrafted blown glass covers. Delivers a fine mist to enhance mood and humidify air, featuring multi-LED lighting and an automatic safety shut-off.'},
  {id:6,name:'Conscious Living Journal',category:'Stationery',price:1200,img:'assets/Shop/notebook.jpg',status:'active',desc:'A space for intentional reflection and stream-of-consciousness writing. Designed to evoke self-discovery, release difficult emotions, and cultivate presence in the current moment.'},
  {id:7,name:'Sacred Tea Ceremony Set',category:'Wellness',price:5800,img:'assets/Shop/tea_set.jpg',status:'active',desc:'Transforms the act of drinking tea into a spiritual ritual of presence. Includes traditional components like celadon cups and auspicious symbols to foster mindful harmony and connection.'},
  {id:8,name:'Presence Practice Mat',category:'Wellness',price:3800,img:'assets/Shop/yoga_mat.jpg',status:'active',desc:'A stable foundation for the mind-body connection. Centering practitioners in their bodies, this mat aids in developing strength and balance while cultivating a sacred space for exploration.'}
];

const DEFAULT_PKGS = [
  {id:'p1',name:'One Hour Clarity Call',price:0,duration:'1 Hour',status:'active'},
  {id:'p2',name:'Three Month Life System Program',price:160000,duration:'3 Months Online',status:'active'},
  {id:'p3',name:'Six Month Life System Mentorship',price:310000,duration:'6 Months In-Person+Online',status:'active'}
];

const BASE_BOOKS = [
  {title:'The Book on the Taboo Against Knowing Who You Are',author:'Alan Wilson Watts',category:'Philosophy',price:2200,img:'https://m.media-amazon.com/images/I/71OqGSEWDOL._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'},
  {title:'The Prophet',author:'Kahlil Gibran',category:'Poetry',price:1400,img:'https://m.media-amazon.com/images/I/61Lj5wbkw4L._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'},
  {title:'The Red Book',author:'C.G. Jung',category:'Psychology',price:8500,img:'https://m.media-amazon.com/images/I/71pOqXeJT3L._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'},
  {title:'The Way of the Superior Man',author:'David Deida',category:'Spirituality',price:2600,img:'https://m.media-amazon.com/images/I/71Kw5TZbRtL._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'},
  {title:'The Secret Doctrine',author:'Helena Blavatsky',category:'Esoteric',price:5200,img:'https://m.media-amazon.com/images/I/81oU7skkD2L._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'},
  {title:'Women Who Run with the Wolves',author:'Clarissa Pinkola Estés',category:'Psychology',price:3100,img:'https://m.media-amazon.com/images/I/71H2KXjZH9L._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'}
];

let booksToInsert = [];
for (let i = 1; i <= 200; i++) {
    let base = BASE_BOOKS[i % BASE_BOOKS.length];
    booksToInsert.push({
        id: 'book_' + i,
        title: `${base.title} - Volume ${i}`,
        author: base.author,
        category: base.category,
        price: base.price + (Math.floor(Math.random() * 5)*100),
        img: base.img,
        rare: i % 10 === 0,
        status: 'active'
    });
}

const DEFAULT_USERS = [
  { uid: 'admin_123', username: 'superadmin', email: 'admin@domiinique.com', role: 'Super Admin', status: 'approved', joinedAt: new Date() },
  { uid: 'user_1', username: 'john_doe', email: 'john@example.com', role: 'member', status: 'approved', joinedAt: new Date() }
];

const DEFAULT_USERNAMES = [
  { id: 'superadmin', email: 'admin@domiinique.com', uid: 'admin_123' },
  { id: 'john_doe', email: 'john@example.com', uid: 'user_1' }
];

const DEFAULT_SETTINGS = [
  {id:'shop',key:'shop',label:'Shop Page',desc:'Enable the shop / e-commerce features',on:true},
  {id:'books',key:'books',label:'Books Archive',desc:'Enable the books and rare collections sections',on:true},
  {id:'rareCollection',key:'rareCollection',label:'Rare Collection',desc:'Show rare books to integrated members only',on:true},
  {id:'memberLogin',key:'memberLogin',label:'Member Login',desc:'Enable member login and sign-up system',on:true},
  {id:'audio',key:'audio',label:'Background Audio',desc:'Enable background music player across all pages',on:true},
  {id:'packages',key:'packages',label:'Packages Page',desc:'Show packages on the integrated page',on:true},
  {id:'checkout',key:'checkout',label:'Checkout / Cart',desc:'Enable add-to-cart and checkout functionality',on:true},
  {id:'darkMode',key:'darkMode',label:'Dark Mode Default',desc:'Set dark mode as the website default theme',on:true}
];

async function seed() {
    console.log("Seeding products...");
    for (let p of DEFAULT_PRODUCTS) {
        await setDoc(doc(db, 'products', p.id.toString()), p);
    }
    console.log("Seeding packages...");
    for (let pk of DEFAULT_PKGS) {
        await setDoc(doc(db, 'packages', pk.id.toString()), pk);
    }
    console.log("Seeding books...");
    for (let b of booksToInsert) {
        await setDoc(doc(db, 'books', b.id.toString()), b);
    }
    console.log("Seeding users...");
    for (let u of DEFAULT_USERS) {
        await setDoc(doc(db, 'users', u.uid), u);
    }
    console.log("Seeding usernames...");
    for (let un of DEFAULT_USERNAMES) {
        await setDoc(doc(db, 'usernames', un.id), un);
    }
    console.log("Seeding site settings...");
    for (let s of DEFAULT_SETTINGS) {
        await setDoc(doc(db, 'site_settings', s.id), s);
    }
    console.log("Done!");
    process.exit(0);
}

seed();
