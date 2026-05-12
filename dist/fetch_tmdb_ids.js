const token = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQyZWNhZjBjNzNmYzU1NmI1NDk3NzQwYmJmZmE5MiIsIm5iZiI6MTc3NTIyMDE5OS42MDA5OTk4LCJzdWIiOiI2OWNmYjVlNzY4YjcwYWNmYjgyZjc2MmQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.jxycsZVC7uLmewooOKm20BvZUZ5s5H4qPsalI3FBmok';
const options = { headers: { 'Authorization': `Bearer ${token}` } };

const moviesList = [
  // 1
  { title: 'The Matrix', year: 1999 },
  { title: 'Inception', year: 2010 },
  { title: 'The Thirteenth Floor', year: 1999 },
  { title: 'eXistenZ', year: 1999 },
  { title: 'Dark City', year: 1998 },
  { title: 'Paprika', year: 2006 },
  { title: 'The Truman Show', year: 1998 },
  { title: 'Coherence', year: 2013 },
  { title: 'The Fountain', year: 2006 },
  { title: 'Cloud Atlas', year: 2012 },
  
  // 2
  { title: 'What the Bleep Do We Know!?', year: 2004 },
  { title: 'The Quantum Activist', year: 2009 },
  { title: 'Particle Fever', year: 2013 },
  { title: 'Interstellar', year: 2014 },
  { title: 'Arrival', year: 2016 },
  { title: 'Contact', year: 1997 },
  { title: 'The Principle', year: 2014 },
  { title: 'Doctor Strange', year: 2016 },
  { title: 'Annihilation', year: 2018 },
  { title: 'Infinity', year: 1996 },

  // 3
  { title: 'Samsara', year: 2011 },
  { title: 'Baraka', year: 1992 },
  { title: 'Koyaanisqatsi', year: 1982 },
  { title: 'The Celestine Prophecy', year: 2006 },
  { title: 'Awake: The Life of Yogananda', year: 2014 },
  { title: 'I Origins', year: 2014 },
  { title: 'The Last Samurai', year: 2003 },
  { title: 'The Shift', year: 2009 },
  { title: 'Peaceful Warrior', year: 2006 },
  { title: 'The Way', year: 2010 },

  // 4
  { title: 'Waking Life', year: 2001 },
  { title: 'The Double Life of Veronique', year: 1991 },
  { title: 'Mr. Nobody', year: 2009 },
  { title: 'The Man from Earth', year: 2007 },
  { title: 'The Tree of Life', year: 2011 },
  { title: 'The Seventh Seal', year: 1957 },
  { title: 'Eternal Sunshine of the Spotless Mind', year: 2004 },
  { title: 'Stranger Than Fiction', year: 2006 },
  { title: 'A Ghost Story', year: 2017 },
  { title: 'The Adjustment Bureau', year: 2011 },

  // 5
  { title: 'Enter the Void', year: 2009 },
  { title: 'Doctor Strange in the Multiverse of Madness', year: 2022 },
  { title: 'Altered States', year: 1980 },
  { title: 'Beyond the Infinite Two Minutes', year: 2020 },
  { title: 'Mindwalk', year: 1990 },
  { title: 'The Congress', year: 2013 },
  { title: 'Synchronicity', year: 2015 }, // Fallback for Cloudy with a chance of synchronicity
  { title: 'Lucid Dream', year: 2017 },
  { title: 'Fantastic Planet', year: 1973 },
  { title: 'The Holy Mountain', year: 1973 }
];

async function run() {
  const finalCategories = [ [], [], [], [], [] ];
  
  for (let i = 0; i < moviesList.length; i++) {
    const m = moviesList[i];
    const catIndex = Math.floor(i / 10);
    
    try {
      const url = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(m.title)}&primary_release_year=${m.year}`;
      const res = await fetch(url, options);
      const data = await res.json();
      
      if (data.results && data.results.length > 0) {
        // Take the first result
        const topResult = data.results[0];
        console.log(`[FOUND] ${m.title} (${m.year}) -> ID: ${topResult.id} (${topResult.title})`);
        finalCategories[catIndex].push(topResult.id);
      } else {
        console.log(`[NOT FOUND] ${m.title} (${m.year})`);
      }
    } catch (e) {
      console.log(`[ERROR] ${m.title} -> ${e.message}`);
    }
  }

  console.log("\n\n=== FINAL ARRAYS ===");
  console.log("Cat 1:", JSON.stringify(finalCategories[0]));
  console.log("Cat 2:", JSON.stringify(finalCategories[1]));
  console.log("Cat 3:", JSON.stringify(finalCategories[2]));
  console.log("Cat 4:", JSON.stringify(finalCategories[3]));
  console.log("Cat 5:", JSON.stringify(finalCategories[4]));
}

run();
