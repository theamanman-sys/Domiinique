/**
 * DOMIINIQUE — Music Module (YouTube)
 * 1,300+ Track Resolution — Dimensional Navigation
 * Version: v5.3.0 (Nature/Ambient Placeholder Engine + CSP Resolve)
 */
console.log("[Music] Gravity Fix v5.3.0 active");
(function () {
  'use strict';

  try {
      var musicData = null;
      var activeCategory = 'Focus';
      var uiInjected = false;
      var allTracksFlat = [];
      var currentQueue = []; // Next/Prev queue
      var currentIndex = -1;

      // Category Icon Mapping 
      var iconMap = {
        'Focus': '✦', 'Relax': '☁', 'Workout': '⚡', 'Meditation': '☸',
        'Nature': '🌿', 'Sleep': '🌙', 'Meals': '🍽', 'Spa': '💧',
        'Seduction': '🔥', 'LuxuryHotel': '🏨', 'Celebration': '🎉',
        'Travel': '✈', 'Seasonal': '❄', 'Creativity': '🎨',
        'Romance': '💋', 'LuxuryLifestyle': '✨', 'MindExpansion': '🧠'
      };

      // Nature/Ambient Placeholder Collection (Curated for DOMIINIQUE aesthetic)
      var naturePool = [
        'photo-1441974231531-c6227db76b6e', 'photo-1470071459604-3b5ec3a7fe05', 
        'photo-1501854140801-50d01698950b', 'photo-1447752875215-b2761acb3c5d',
        'photo-1464822759023-fed622ff2c3b', 'photo-1506744038136-46273834b3fb',
        'photo-1472214103451-9374bd1c798e', 'photo-1433086566085-c313a99ad7f5',
        'photo-1500628550463-c8881a54d4d4', 'photo-1490730141103-6cac27aaab94'
      ];

      function getNaturePlaceholder(seed) {
        var hash = 0;
        for (var i = 0; i < seed.length; i++) hash = seed.charCodeAt(i) + ((hash << 5) - hash);
        var index = Math.abs(hash) % naturePool.length;
        return `https://images.unsplash.com/${naturePool[index]}?auto=format&fit=crop&w=400&q=80`;
      }

      function escHtml(s) {
        return String(s || "").replace(/[&<>"']/g, function (c) {
          return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
        });
      }

      async function loadMusicLibrary() {
        try {
            const response = await fetch('data/music_resolved.json?v=' + Date.now());
            if (!response.ok) throw new Error("Cloud synchronization pending...");
            musicData = await response.json();
            
            allTracksFlat = [];
            for (let cat in musicData) {
                musicData[cat].forEach(t => {
                    t.category = cat;
                    allTracksFlat.push(t);
                });
            }
            console.log("[Music] Synchronized: " + allTracksFlat.length + " tracks.");
        } catch (e) {
            console.warn("[Music] Resolved library not found, attempting raw load...", e);
            try {
                const rawResp = await fetch('data/music_library.json?v=' + Date.now());
                if (!rawResp.ok) throw new Error("Music library not found");
                const rawData = await rawResp.json();
                musicData = {};
                for (let cat in rawData) {
                    musicData[cat] = rawData[cat].map(t => ({ name: t, videoId: null }));
                }
            } catch (e2) {
                console.error("[Music] All music data sources unavailable:", e2);
                musicData = {};
            }
        }
      }

      function card(track, idx) {
        if (!track) return '';
        
        var isResolved = !!track.videoId;
        var placeholder = getNaturePlaceholder(track.name);
        
        // High-Fidelity Thumbnail Fetching
        var poster = isResolved ? `https://i.ytimg.com/vi/${track.videoId}/hqdefault.jpg?v=1` : placeholder;
        var fallbackMQ = isResolved ? `https://i.ytimg.com/vi/${track.videoId}/mqdefault.jpg?v=1` : placeholder;
        var label = track.category || activeCategory;

        return `
          <div class="cin-card reveal" onclick="window.playTrack(${idx})">
            <div class="cin-poster mus-poster">
              <img src="${poster}" alt="${escHtml(track.name)}" loading="lazy" 
                   onerror="if(this.src.indexOf('hq')>-1) this.src='${fallbackMQ}'; else this.src='${placeholder}';">
              <div class="cin-grad"></div>
              <div class="cin-rating">${iconMap[label] || '✦'} ${label}</div>
              <div class="cin-play"><svg viewBox="0 0 24 24" fill="#000" width="13" height="13" style="margin-left:2px"><polygon points="5,3 19,12 5,21"/></svg></div>
              ${!isResolved ? '<div style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.6); padding:2px 6px; font-size:9px; border-radius:4px; color:rgba(255,255,255,0.7); backdrop-filter:blur(4px);">DIMENSIONAL LOAD</div>' : ''}
            </div>
            <div class="cin-info">
              <div class="cin-meta">${label} Dimension</div>
              <div class="cin-title" style="${!isResolved ? 'color:rgba(255,255,255,0.7);' : ''}">${escHtml(track.name)}</div>
            </div>
          </div>`;
      }

      window.playTrack = function(index) {
        if (!currentQueue[index]) return;
        currentIndex = index;
        const track = currentQueue[index];
        const videoId = track.videoId;

        if (!videoId || videoId === 'null') {
            alert("This frequency is still resolving. Please select another track while we attune the connection.");
            return;
        }

        const playerArea = document.getElementById('mus-player-area');
        if (!playerArea) return;

        playerArea.style.display = 'block';
        playerArea.innerHTML = `
          <div class="mus-player-inner">
             <div class="mus-player-video">
                <iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&color=white&vq=hd1080" 
                        frameborder="0" allow="autoplay; encrypted-media" allowfullscreen></iframe>
             </div>
             <div class="mus-player-info">
                <div class="mus-p-header">
                    <span class="t-eyebrow" style="color:var(--rd-gold); font-size:0.7rem; letter-spacing:0.3em;">ACTIVE DIMENSION: ${track.category || activeCategory}</span>
                    <h3 class="t-h2" style="font-size:2rem; margin:1rem 0 2rem; line-height:1.2;">${escHtml(track.name)}</h3>
                </div>
                
                <div class="mus-player-controls">
                    <button class="mus-ctrl-btn" onclick="window.playPrev()" title="Previous Frequency">
                        <svg width="32" height="32" fill="currentColor"><path d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/></svg>
                    </button>
                    <button class="mus-ctrl-btn main" onclick="alert('Frequency Stream Active')" title="Digital High-Fidelity">
                        <svg width="36" height="36" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"/></svg>
                    </button>
                    <button class="mus-ctrl-btn" onclick="window.playNext()" title="Next Frequency">
                        <svg width="32" height="32" fill="currentColor"><path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/></svg>
                    </button>
                </div>

                <div class="mus-progress-wrap">
                    <div id="mus-progress-bar" class="mus-progress-bar" style="width: 45%"></div>
                </div>
                <div style="display:flex; justify-content:space-between; font-size:0.65rem; color:rgba(255,255,255,0.4); font-family:monospace; margin-top:0.8rem; letter-spacing:0.15em;">
                    <span>BITRATE: LOSSLESS</span>
                    <span style="color:var(--rd-gold);">ORIGINAL YOUTUBE SOURCE</span>
                </div>
             </div>
          </div>
        `;
        playerArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
      };

      window.playNext = function() {
        if (currentIndex < currentQueue.length - 1) window.playTrack(currentIndex + 1);
        else window.playTrack(0); 
      };

      window.playPrev = function() {
        if (currentIndex > 0) window.playTrack(currentIndex - 1);
        else window.playTrack(currentQueue.length - 1); 
      };

      function renderTabs() {
        var keys = Object.keys(musicData);
        var html = '<div class="mus-tabs-wrap"><div class="mus-tabs-scroll">';
        keys.forEach(function(key) {
           var active = key === activeCategory ? 'active' : '';
           html += `<button class="mus-tab ${active}" onclick="window.switchMusicCategory('${key}')">
                     <span class="mus-tab-icon">${iconMap[key] || '✦'}</span> ${key}
                   </button>`;
        });
        html += '</div></div>';
        return html;
      }

      window.switchMusicCategory = function(cat) {
        activeCategory = cat;
        currentQueue = musicData[cat] || [];
        
        var tabsWrap = document.querySelector('.mus-tabs-wrap');
        if (tabsWrap) tabsWrap.outerHTML = renderTabs();
        
        var feed = document.getElementById('mus-feed');
        if (feed) {
          feed.innerHTML = `<div class="mus-grid">${currentQueue.map((t, i) => card(t, i)).join('')}</div>`;
          if (window.initReveal) window.initReveal();
        }
      };

      window.renderMusicSection = async function (container) {
        if (!container) return;
        if (!musicData) await loadMusicLibrary();

        if (!uiInjected) {
          var style = document.createElement('style');
          style.innerHTML = `
            .mus-player-area { width:100%; max-width:1100px; margin:0 auto 4rem; background:rgba(255,255,255,0.02); border:1px solid rgba(193,153,79,0.15); border-radius:32px; overflow:hidden; display:none; animation: fadeInDown 0.8s cubic-bezier(0.16, 1, 0.3, 1); box-shadow: 0 50px 100px rgba(0,0,0,0.6); backdrop-filter: blur(25px); }
            .mus-player-inner { display:flex; flex-direction:column; }
            @media(min-width: 1024px) { .mus-player-inner { flex-direction: row; } }
            
            .mus-player-video { flex: 1.4; aspect-ratio: 16/9; background:#000; border-right: 1px solid rgba(193,153,79,0.1); }
            .mus-player-video iframe { width:100%; height:100%; border:0; }
            
            .mus-player-info { flex: 1; padding: 4rem; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center; background: linear-gradient(135deg, rgba(20,15,30,0.5) 0%, rgba(13,9,22,0.7) 100%); }
            
            .mus-player-controls { display:flex; align-items:center; justify-content:center; gap:2.5rem; margin-bottom:3rem; }
            .mus-ctrl-btn { background:none; border:none; color:rgba(255,255,255,0.4); cursor:pointer; transition:all 0.4s; padding:1rem; display:flex; align-items:center; justify-content:center; }
            .mus-ctrl-btn:hover { color:var(--rd-gold); transform:scale(1.2); }
            .mus-ctrl-btn.main { background:var(--rd-gold); color:#000; border-radius:50%; width:75px; height:75px; display:flex; align-items:center; justify-content:center; box-shadow:0 15px 40px rgba(193,153,79,0.4); }
            
            .mus-progress-wrap { width:100%; max-width:400px; height:4px; background:rgba(255,255,255,0.08); border-radius:4px; position:relative; overflow:hidden; }
            .mus-progress-bar { height:100%; background:var(--rd-gold); box-shadow:0 0 25px var(--rd-gold); }
            
            .mus-tabs-wrap { margin-bottom: 3rem; border-bottom: 1px solid rgba(193,153,79,0.1); padding-bottom: 0.5rem; }
            .mus-tabs-scroll { display: flex; gap: 0.8rem; overflow-x: auto; padding: 0 1rem 1rem; scrollbar-width: none; -ms-overflow-style: none; }
            .mus-tab { white-space: nowrap; background: rgba(255,255,255,0.03); border: 1px solid rgba(193,153,79,0.2); color: rgba(255,255,255,0.6); padding: 0.7rem 1.4rem; border-radius: 40px; font-size: 0.85rem; cursor: pointer; transition: all 0.3s; display:flex; align-items:center; gap:0.6rem; }
            .mus-tab.active { background: var(--rd-gold); color: #000; border-color: var(--rd-gold); font-weight: 700; box-shadow: 0 8px 25px rgba(193,153,79,0.4); }
            
            .mus-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 3rem; }
            .mus-poster { aspect-ratio: 16/9 !important; border-radius: 18px; overflow: hidden; position: relative; border: 1px solid rgba(255,255,255,0.06); }
            .mus-poster img { width: 100%; height: 100%; object-fit: cover; transition: transform 0.8s cubic-bezier(0.16, 1, 0.3, 1); }
            .cin-card:hover .mus-poster img { transform: scale(1.12); }

            .music-search { position:relative; max-width:650px; margin:0 auto 3rem; padding: 0 1rem; }
            .music-search-inp { width:100%; border:1px solid rgba(193, 153, 79, 0.25); background: rgba(13, 9, 22, 0.95); color:#fff; padding:1.4rem 2rem; border-radius:100px; font-size:1rem; transition: all 0.4s; }
            .music-search-inp:focus { outline:none; border-color:var(--rd-gold); box-shadow: 0 0 40px rgba(193,153,79,0.2); }
            
            @media(max-width: 1023px) {
                .mus-player-video { border-right: none; border-bottom: 1px solid rgba(193,153,79,0.1); }
                .mus-player-info { padding: 3rem 2rem; }
            }
            @media(max-width: 768px) { 
                .mus-grid { grid-template-columns: repeat(2, 1fr); gap: 1.5rem; } 
                .mus-player-info h3 { font-size: 1.6rem; }
            }
            @media(max-width: 480px) { .mus-grid { grid-template-columns: 1fr; } }
            @keyframes fadeInDown { from { opacity:0; transform:translateY(-40px); } to { opacity:1; transform:translateY(0); } }
          `;
          document.head.appendChild(style);
          uiInjected = true;
        }

        container.innerHTML = `
          <div style="text-align:center; margin-bottom:5rem; padding: 0 1rem;">
            <span class="t-eyebrow" style="color:var(--rd-gold); letter-spacing:0.4em; text-transform:uppercase; font-size:0.75rem;">Multidimensional Frequency Archive</span>
            <h2 class="t-h2" style="margin-top:1rem; letter-spacing:-0.03em; font-size:3.5rem;">Reality Design Music</h2>
            <p class="t-body" style="max-width:650px; margin:2rem auto 0; opacity:0.6; font-size:1.1rem; line-height:1.8;">Attune your environment to the high-fidelity soundscapes of the Domiinique Living Signature.</p>
          </div>
          
          <div id="mus-player-area" class="mus-player-area"></div>

          <div class="music-search">
            <input type="text" id="mus-search-inp" class="music-search-inp" placeholder="Navigate 1,300+ frequencies..." required>
          </div>
          ${renderTabs()}
          <div id="mus-feed" style="padding: 0 1.5rem; min-height:600px;"></div>
        `;

        var inp = document.getElementById('mus-search-inp');
        window.switchMusicCategory(activeCategory);

        var dbToggle;
        inp.addEventListener('input', function (e) {
          clearTimeout(dbToggle);
          var q = e.target.value.trim().toLowerCase();
          dbToggle = setTimeout(function () {
            if (!q) { window.switchMusicCategory(activeCategory); return; }
            var results = allTracksFlat.filter(t => t.name.toLowerCase().indexOf(q) > -1 || (t.category && t.category.toLowerCase().indexOf(q) > -1));
            currentQueue = results;
            document.querySelector('.mus-tabs-wrap').style.display = 'none';
            if (results.length === 0) {
              document.getElementById('mus-feed').innerHTML = '<div style="text-align:center;padding:12rem 0;opacity:0.4; font-size:1.1rem; letter-spacing:0.1em;">No frequency synchronized at this coordinates.</div>';
              return;
            }
            document.getElementById('mus-feed').innerHTML = `<div class="mus-grid">${results.slice(0, 50).map((t, i) => card(t, i)).join('')}</div>`;
            if (window.initReveal) window.initReveal();
          }, 400);
        });
      };
  } catch (err) { console.error("[Music] Critical Synchronicity Failure", err); }
})();
