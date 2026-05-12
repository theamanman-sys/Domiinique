const { MongoClient } = require('mongodb');

const uri = "mongodb://antigravity:K0h_klSfr1HCkNbZ-ZtoqwCymqn9HKvROx4-G-UtxANEQ4UH@6dd13bc1-e479-4683-80c3-fad820116356.nam5.firestore.goog:443/domiinique?loadBalanced=true&tls=true&authMechanism=SCRAM-SHA-256&retryWrites=false";

const DEFAULT_PRODUCTS = [
  {_id: 'prod_1', id: 'prod_1', name:'Sacred Aroma Oils',category:'Ritual',price:2400,img:'assets/Shop/aroma oils.jpg',status:'active'},
  {_id: 'prod_2', id: 'prod_2', name:'Black Mahakala Tibetan Incense',category:'Ritual',price:980,img:'assets/Shop/black_mahakala_tibetan_incense.jpg',status:'active'},
  {_id: 'prod_3', id: 'prod_3', name:'Ceremonial Candle Set',category:'Sensory',price:1650,img:'assets/Shop/candles.jpg',status:'active'},
  {_id: 'prod_4', id: 'prod_4', name:'Corinthian Wind Chime Bells',category:'Sensory',price:3200,img:'assets/Shop/corinthian_bells.jpg',status:'active'},
  {_id: 'prod_5', id: 'prod_5', name:'Artisan Mist Diffuser',category:'Wellness',price:4500,img:'assets/Shop/diffuser.jpg',status:'active'},
  {_id: 'prod_6', id: 'prod_6', name:'Conscious Living Journal',category:'Stationery',price:1200,img:'assets/Shop/notebook.jpg',status:'active'},
  {_id: 'prod_7', id: 'prod_7', name:'Sacred Tea Ceremony Set',category:'Wellness',price:5800,img:'assets/Shop/tea_set.jpg',status:'active'},
  {_id: 'prod_8', id: 'prod_8', name:'Presence Practice Mat',category:'Wellness',price:3800,img:'assets/Shop/yoga_mat.jpg',status:'active'}
];

const DEFAULT_PKGS = [
  {_id: 'p1', id:'p1',name:'One Hour Clarity Call',price:0,duration:'1 Hour',status:'active'},
  {_id: 'p2', id:'p2',name:'Three Month Life System Program',price:160000,duration:'3 Months Online',status:'active'},
  {_id: 'p3', id:'p3',name:'Six Month Life System Mentorship',price:310000,duration:'6 Months In-Person+Online',status:'active'}
];

const BASE_BOOKS = [
  {title:'The Book on the Taboo Against Knowing Who You Are',author:'Alan Wilson Watts',category:'Philosophy',price:2200,img:'https://m.media-amazon.com/images/I/71OqGSEWDOL._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'},
  {title:'The Prophet',author:'Kahlil Gibran',category:'Poetry',price:1400,img:'https://m.media-amazon.com/images/I/61Lj5wbkw4L._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'},
  {title:'The Red Book',author:'C.G. Jung',category:'Psychology',price:8500,img:'https://m.media-amazon.com/images/I/71pOqXeJT3L._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'},
  {title:'The Way of the Superior Man',author:'David Deida',category:'Spirituality',price:2600,img:'https://m.media-amazon.com/images/I/71Kw5TZbRtL._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'},
  {title:'The Secret Doctrine',author:'Helena Blavatsky',category:'Esoteric',price:5200,img:'https://m.media-amazon.com/images/I/81oU7skkD2L._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'},
  {title:'Women Who Run with the Wolves',author:'Clarissa Pinkola Estés',category:'Psychology',price:3100,img:'https://m.media-amazon.com/images/I/71H2KXjZH9L._AC_UF1000,1000_QL80_.jpg',rare:true,status:'active'}
];

// Generate 200 books
let booksToInsert = [];
for (let i = 1; i <= 200; i++) {
    let base = BASE_BOOKS[i % BASE_BOOKS.length];
    booksToInsert.push({
        _id: 'book_' + i,
        id: 'book_' + i,
        title: `${base.title} - Volume ${i}`,
        author: base.author,
        category: base.category,
        price: base.price + (Math.floor(Math.random() * 5)*100),
        img: base.img,
        rare: i % 10 === 0, // every 10th is rare
        status: 'active'
    });
}

const DEFAULT_USERS = [
  { _id: 'admin_123', uid: 'admin_123', username: 'superadmin', email: 'admin@domiinique.com', role: 'Super Admin', status: 'approved', joinedAt: new Date() },
  { _id: 'user_1', uid: 'user_1', username: 'john_doe', email: 'john@example.com', role: 'member', status: 'approved', joinedAt: new Date() }
];

const DEFAULT_USERNAMES = [
  { _id: 'superadmin', email: 'admin@domiinique.com', uid: 'admin_123' },
  { _id: 'john_doe', email: 'john@example.com', uid: 'user_1' }
];

async function run() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log("Connected successfully to server");

    const db = client.db("domiinique");

    // 1. Products
    const productsCol = db.collection('products');
    console.log("Emptying products...");
    await productsCol.deleteMany({});
    console.log("Seeding products...");
    await productsCol.insertMany(DEFAULT_PRODUCTS);

    // 2. Packages
    const pkgsCol = db.collection('packages');
    console.log("Emptying packages...");
    await pkgsCol.deleteMany({});
    console.log("Seeding packages...");
    await pkgsCol.insertMany(DEFAULT_PKGS);

    // 3. Books
    const booksCol = db.collection('books');
    console.log("Emptying books...");
    await booksCol.deleteMany({});
    console.log("Seeding 200 books...");
    await booksCol.insertMany(booksToInsert);

    // 4. Users
    const usersCol = db.collection('users');
    console.log("Emptying users...");
    await usersCol.deleteMany({});
    console.log("Seeding users...");
    await usersCol.insertMany(DEFAULT_USERS);
    
    // 5. Usernames
    const usernamesCol = db.collection('usernames');
    console.log("Emptying usernames...");
    await usernamesCol.deleteMany({});
    console.log("Seeding usernames...");
    await usernamesCol.insertMany(DEFAULT_USERNAMES);

    console.log("Database seeded successfully!");
  } catch(e) {
    console.error("Error during seeding:", e);
  } finally {
    await client.close();
  }
}

run();
