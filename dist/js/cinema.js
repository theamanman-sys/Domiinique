/**
 * Domiinique — Cinema Module (TMDB v3)
 * All 50 films from the Domiinique Integration PDF
 */
(function () {
  'use strict';

  var TMDB_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJhMzQyZWNhZjBjNzNmYzU1NmI1NDk3NzQwYmJmZmE5MiIsIm5iZiI6MTc3NTIyMDE5OS42MDA5OTk4LCJzdWIiOiI2OWNmYjVlNzY4YjcwYWNmYjgyZjc2MmQiLCJzY29wZXMiOlsiYXBpX3JlYWQiXSwidmVyc2lvbiI6MX0.jxycsZVC7uLmewooOKm20BvZUZ5s5H4qPsalI3FBmok';
  var TMDB_BASE  = 'https://api.themoviedb.org/3';
  var IMG_W342   = 'https://image.tmdb.org/t/p/w342';
  var IMG_W780   = 'https://image.tmdb.org/t/p/w780';
  var IMG_W185   = 'https://image.tmdb.org/t/p/w185';
  var TMDB_OPTS  = { headers: { 'Authorization': 'Bearer ' + TMDB_TOKEN, 'Content-Type': 'application/json' } };

  /* ── Curated list from Domiinique Integration PDF ─────────────────────── */
  var CATEGORIES = [
    {
      label: '✦ Reality & Perception',
      ids: [603, 27205, 1090, 1946, 2666, 4977, 37165, 220289, 1381, 83542]
    },
    {
      label: '✦ Quantum & Science-Inspired Consciousness',
      ids: [8357, 52565, 202141, 157336, 329865, 686, 317978, 284052, 300668, 2033]
    },
    {
      label: '✦ Spirituality & Inner Work',
      ids: [89708, 14002, 11314, 18524, 290504, 244267, 616, 51270, 13689, 59468]
    },
    {
      label: '✦ Philosophy & Existential Exploration',
      ids: [9081, 1600, 31011, 13363, 8967, 490, 38, 1262, 428449, 38050]
    },
    {
      label: '✦ Mind Expansion / Psychedelic / Mystical',
      ids: [34647, 453395, 11542, 805627, 48745, 152795, 347945, 436994, 16306, 8327]
    }
  ];

  /* ── API helpers ──────────────────────────────────────────────────────── */
  function tmdbFetch(path) {
    return fetch(TMDB_BASE + path, TMDB_OPTS)
      .then(function (r) {
        if (!r.ok) { console.warn('[Cinema] TMDB', r.status, path); return null; }
        return r.json();
      })
      .catch(function (e) { console.error('[Cinema] fetch error', e); return null; });
  }

  function fetchMovie(id) {
    return tmdbFetch('/movie/' + id + '?append_to_response=videos');
  }

  function searchTMDB(q) {
    return tmdbFetch('/search/movie?query=' + encodeURIComponent(q) + '&language=en-US&page=1&include_adult=false')
      .then(function (d) { return (d && d.results) || []; });
  }

  function trailerKey(movie) {
    var vids = (movie.videos && movie.videos.results) || [];
    var t = vids.find(function (v) { return v.type === 'Trailer' && v.site === 'YouTube'; })
          || vids.find(function (v) { return v.site === 'YouTube'; });
    return t ? t.key : null;
  }

  /* ── Skeleton helper ──────────────────────────────────────────────────── */
  function skeletons(n) {
    var out = '';
    for (var i = 0; i < n; i++) out += '<div class="cin-skel"></div>';
    return out;
  }

  /* ── Card ─────────────────────────────────────────────────────────────── */
  function card(movie) {
    if (!movie) return '';
    var poster = movie.poster_path ? IMG_W342 + movie.poster_path : '';
    var year   = (movie.release_date || '').slice(0, 4);
    var rating = movie.vote_average ? Number(movie.vote_average).toFixed(1) : '—';
    var genres = (movie.genres || []).slice(0, 2).map(function (g) { return g.name; }).join(' · ');
    var key    = trailerKey(movie);

    return '<div class="cin-card reveal" onclick="window.openCinemaModal(' + movie.id + ')"' +
      ' onmouseenter="this.classList.add(\'cin-hover\')" onmouseleave="this.classList.remove(\'cin-hover\')">' +
      '<div class="cin-poster">' +
        (poster
          ? '<img src="' + poster + '" alt="' + escHtml(movie.title) + '" loading="lazy"' +
            ' onerror="this.parentElement.innerHTML=\'<div class=cin-noimg>🎬</div>\'">'
          : '<div class="cin-noimg">🎬</div>') +
        '<div class="cin-grad"></div>' +
        '<div class="cin-rating">★ ' + rating + '</div>' +
        (key ? '<div class="cin-play"><svg viewBox="0 0 24 24" fill="#000" width="13" height="13" style="margin-left:2px"><polygon points="5,3 19,12 5,21"/></svg></div>' : '') +
      '</div>' +
      '<div class="cin-info">' +
        '<div class="cin-meta">' + [year, genres].filter(Boolean).join(' · ') + '</div>' +
        '<div class="cin-title">' + escHtml(movie.title) + '</div>' +
      '</div>' +
    '</div>';
  }

  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];
    });
  }

  /* ── Modal ────────────────────────────────────────────────────────────── */
  function ensureModal() {
    if (document.getElementById('cin-modal')) return;
    var el = document.createElement('div');
    el.id = 'cin-modal';
    el.innerHTML =
      '<div id="cin-modal-box">' +
        '<button class="cin-close" onclick="window.closeCinemaModal()">✕</button>' +
        '<div id="cin-media"></div>' +
        '<div id="cin-detail"></div>' +
      '</div>';
    document.body.appendChild(el);
    el.addEventListener('click', function (e) { if (e.target === el) window.closeCinemaModal(); });
  }

  window.openCinemaModal = function (id) {
    ensureModal();
    var modal  = document.getElementById('cin-modal');
    var media  = document.getElementById('cin-media');
    var detail = document.getElementById('cin-detail');
    modal.classList.add('cin-open');
    document.body.style.overflow = 'hidden';
    media.innerHTML  = '<div class="cin-spinner"></div>';
    detail.innerHTML = '';

    fetchMovie(id).then(function (m) {
      if (!m) { media.innerHTML = '<div class="cin-err">Film data unavailable</div>'; return; }
      var key      = trailerKey(m);
      var backdrop = m.backdrop_path ? IMG_W780 + m.backdrop_path : '';
      var poster   = m.poster_path   ? IMG_W185 + m.poster_path   : '';
      var year     = (m.release_date || '').slice(0, 4);
      var rt       = m.runtime ? Math.floor(m.runtime / 60) + 'h ' + (m.runtime % 60) + 'm' : '';
      var rat      = m.vote_average ? Number(m.vote_average).toFixed(1) : '—';
      var tags     = (m.genres || []).map(function (g) {
        return '<span class="cin-tag">' + escHtml(g.name) + '</span>';
      }).join('');

      if (key) {
        media.innerHTML = '<iframe src="https://www.youtube.com/embed/' + key +
          '?autoplay=1&rel=0&modestbranding=1" allow="autoplay;encrypted-media" allowfullscreen></iframe>';
      } else if (backdrop) {
        media.innerHTML = '<img src="' + backdrop + '" alt="' + escHtml(m.title) + '" style="width:100%;height:100%;object-fit:cover;">';
      } else {
        media.innerHTML = '<div class="cin-err">No Trailer Available</div>';
      }

      detail.innerHTML =
        '<div class="cin-detail-inner">' +
          (poster ? '<img class="cin-poster-sm" src="' + poster + '" onerror="this.style.display=\'none\'">' : '') +
          '<div class="cin-detail-body">' +
            '<div class="cin-detail-meta">' + [year, rt, '★ ' + rat + '/10'].filter(Boolean).join(' · ') + '</div>' +
            '<h2 class="cin-detail-title">' + escHtml(m.title) + '</h2>' +
            (m.tagline ? '<p class="cin-tagline">"' + escHtml(m.tagline) + '"</p>' : '') +
            '<div class="cin-tags">' + tags + '</div>' +
            '<p class="cin-overview">' + escHtml(m.overview || '') + '</p>' +
          '</div>' +
        '</div>';
    });
  };

  window.closeCinemaModal = function () {
    var modal = document.getElementById('cin-modal');
    if (modal) {
      modal.classList.remove('cin-open');
      document.body.style.overflow = '';
      var m = document.getElementById('cin-media');
      if (m) m.innerHTML = ''; // stop video
    }
  };

  /* ── Styles (injected once) ───────────────────────────────────────────── */
  function injectStyles() {
    if (document.getElementById('cin-styles')) return;
    var s = document.createElement('style');
    s.id = 'cin-styles';
    s.textContent = [
      '@keyframes cinShimmer{0%{opacity:.3}100%{opacity:.55}}',
      '@keyframes cinSpin{to{transform:rotate(360deg)}}',
      '@keyframes cinSlide{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}',

      /* Grid */
      '#cin-wrap{padding:0}',
      '#cin-search-row{display:flex;gap:.7rem;align-items:center;flex-wrap:wrap;margin-bottom:1.8rem}',
      '#cin-search-input{flex:1;min-width:180px;padding:.7rem 1rem .7rem 2.5rem;background:rgba(255,255,255,.04);border:1px solid rgba(201,168,76,.22);border-radius:8px;color:#fff;font-family:Inter,sans-serif;font-size:.72rem;outline:none;transition:border-color .25s;box-sizing:border-box}',
      '#cin-search-input:focus{border-color:rgba(201,168,76,.55)}',
      '.cin-search-icon{position:absolute;left:.8rem;top:50%;transform:translateY(-50%);width:13px;height:13px;color:rgba(201,168,76,.4);pointer-events:none}',
      '.cin-btn{padding:.68rem 1.2rem;border-radius:8px;font-size:.62rem;letter-spacing:.14em;text-transform:uppercase;cursor:pointer;transition:background .25s,border-color .25s}',
      '.cin-btn-gold{background:rgba(201,168,76,.1);border:1px solid rgba(201,168,76,.3);color:#c9a84c}',
      '.cin-btn-gold:hover{background:rgba(201,168,76,.2)}',
      '.cin-btn-ghost{background:transparent;border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.4)}',
      '.cin-btn-ghost:hover{border-color:rgba(255,255,255,.28);color:#fff}',
      '#cin-count{font-size:.58rem;letter-spacing:.22em;color:rgba(201,168,76,.5);text-transform:uppercase;margin-bottom:1.1rem}',
      '#cin-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(155px,1fr));gap:1.1rem}',
      '@media(max-width:600px){#cin-grid{grid-template-columns:repeat(auto-fill,minmax(120px,1fr));gap:.75rem}}',
      '.cin-cat{grid-column:1/-1;font-size:.58rem;letter-spacing:.22em;color:rgba(201,168,76,.6);text-transform:uppercase;padding-bottom:.5rem;border-bottom:1px solid rgba(201,168,76,.1);margin-top:1.8rem}',
      '.cin-cat:first-child{margin-top:0}',
      '.cin-skel{border-radius:12px;background:rgba(255,255,255,.03);border:1px solid rgba(255,255,255,.05);aspect-ratio:2/3;animation:cinShimmer 1.4s ease-in-out infinite alternate}',

      /* Card */
      '.cin-card{border-radius:12px;overflow:hidden;background:rgba(0,0,0,.45);border:1px solid rgba(201,168,76,.1);cursor:pointer;transition:transform .3s cubic-bezier(.23,1,.32,1),box-shadow .3s}',
      '.cin-card.cin-hover{transform:translateY(-6px) scale(1.02);box-shadow:0 20px 50px rgba(0,0,0,.65),0 0 0 1px rgba(201,168,76,.28)}',
      '.cin-poster{position:relative;aspect-ratio:2/3;overflow:hidden;background:#0d0916}',
      '.cin-poster img{width:100%;height:100%;object-fit:cover}',
      '.cin-noimg{display:flex;align-items:center;justify-content:center;height:100%;font-size:2.5rem;color:rgba(201,168,76,.25)}',
      '.cin-grad{position:absolute;inset:0;background:linear-gradient(to top,rgba(5,2,12,.92) 0%,rgba(5,2,12,.1) 55%,transparent 100%);pointer-events:none}',
      '.cin-rating{position:absolute;top:8px;right:8px;background:rgba(5,2,12,.72);backdrop-filter:blur(6px);border:1px solid rgba(201,168,76,.32);border-radius:20px;padding:2px 8px;font-size:.58rem;color:#c9a84c;letter-spacing:.04em}',
      '.cin-play{position:absolute;bottom:10px;right:10px;width:28px;height:28px;border-radius:50%;background:rgba(201,168,76,.85);display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 4px rgba(201,168,76,.15)}',
      '.cin-info{padding:.75rem .8rem .9rem}',
      '.cin-meta{font-size:.53rem;letter-spacing:.18em;color:rgba(201,168,76,.6);text-transform:uppercase;margin-bottom:.25rem}',
      '.cin-title{font-family:"Playfair Display",serif;font-size:.85rem;color:#fff;line-height:1.3;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}',

      /* Modal */
      '#cin-modal{display:none;position:fixed;inset:0;z-index:99999;background:rgba(0,0,0,.88);backdrop-filter:blur(14px);-webkit-backdrop-filter:blur(14px);align-items:center;justify-content:center;padding:1.2rem}',
      '#cin-modal.cin-open{display:flex}',
      '#cin-modal-box{position:relative;width:100%;max-width:820px;max-height:92vh;background:#0d0916;border:1px solid rgba(201,168,76,.2);border-radius:18px;overflow:hidden;box-shadow:0 50px 120px rgba(0,0,0,.95);display:flex;flex-direction:column;animation:cinSlide .3s cubic-bezier(.23,1,.32,1)}',
      '#cin-media{flex-shrink:0;background:#000;aspect-ratio:16/9;display:flex;align-items:center;justify-content:center}',
      '#cin-media iframe{width:100%;height:100%;border:none}',
      '#cin-detail{padding:1.4rem 1.7rem 1.8rem;overflow-y:auto;flex:1}',
      '.cin-close{position:absolute;top:.9rem;right:.9rem;z-index:10;background:rgba(255,255,255,.07);border:1px solid rgba(255,255,255,.1);color:rgba(255,255,255,.7);border-radius:50%;width:33px;height:33px;font-size:1rem;cursor:pointer;display:flex;align-items:center;justify-content:center;transition:background .2s}',
      '.cin-close:hover{background:rgba(255,255,255,.14);color:#fff}',
      '.cin-spinner{width:36px;height:36px;border:2px solid rgba(201,168,76,.15);border-top-color:rgba(201,168,76,.7);border-radius:50%;animation:cinSpin .9s linear infinite}',
      '.cin-err{padding:2rem;color:rgba(255,255,255,.35);font-size:.75rem;letter-spacing:.1em;text-align:center}',
      '.cin-detail-inner{display:flex;gap:1.4rem;align-items:flex-start;flex-wrap:wrap}',
      '.cin-poster-sm{width:75px;border-radius:8px;flex-shrink:0;box-shadow:0 8px 24px rgba(0,0,0,.6)}',
      '.cin-detail-body{flex:1;min-width:180px}',
      '.cin-detail-meta{font-size:.55rem;letter-spacing:.24em;color:rgba(201,168,76,.65);text-transform:uppercase;margin-bottom:.4rem}',
      '.cin-detail-title{font-family:"Playfair Display",serif;font-size:1.4rem;color:#fff;margin:0 0 .6rem;line-height:1.2}',
      '.cin-tagline{font-style:italic;color:rgba(201,168,76,.55);font-size:.7rem;margin-bottom:.85rem}',
      '.cin-tags{display:flex;flex-wrap:wrap;gap:.3rem;margin-bottom:.9rem}',
      '.cin-tag{background:rgba(201,168,76,.08);border:1px solid rgba(201,168,76,.22);border-radius:20px;padding:3px 11px;font-size:.58rem;color:rgba(201,168,76,.85);letter-spacing:.1em}',
      '.cin-overview{font-size:.7rem;line-height:1.85;color:rgba(255,255,255,.5);margin:0}'
    ].join('\n');
    document.head.appendChild(s);
  }

  /* ── Main section renderer ──────────────────────────────────────────────*/
  window.renderCinemaSection = function (container) {
    if (!container) return;
    injectStyles();

    container.innerHTML =
      '<div id="cin-wrap">' +
        '<div id="cin-search-row">' +
          '<div style="flex:1;min-width:180px;position:relative;">' +
            '<input id="cin-search-input" type="text" placeholder="Search films…">' +
            '<svg class="cin-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>' +
          '</div>' +
          '<button class="cin-btn cin-btn-gold" onclick="window.cinSearch()">Search</button>' +
          '<button id="cin-clear" class="cin-btn cin-btn-ghost" onclick="window.cinReset()" style="display:none">✕ Clear</button>' +
        '</div>' +
        '<div id="cin-count">50 Consciousness-Expanding Films</div>' +
        '<div id="cin-grid">' + skeletons(12) + '</div>' +
      '</div>';

    var inp = document.getElementById('cin-search-input');
    if (inp) inp.addEventListener('keydown', function (e) { if (e.key === 'Enter') window.cinSearch(); });

    window.cinReset();
  };

  /* ── Load all by category ──────────────────────────────────────────────*/
  window.cinReset = function () {
    var inp = document.getElementById('cin-search-input');
    var clr = document.getElementById('cin-clear');
    var cnt = document.getElementById('cin-count');
    var grd = document.getElementById('cin-grid');
    if (inp) inp.value = '';
    if (clr) clr.style.display = 'none';
    if (cnt) cnt.textContent = '50 Consciousness-Expanding Films';
    if (!grd) return;
    grd.innerHTML = skeletons(12);

    var html = '';
    var promises = CATEGORIES.map(function (cat) {
      return Promise.all(cat.ids.map(fetchMovie)).then(function (movies) {
        var valid = movies.filter(Boolean);
        if (!valid.length) return '';
        return '<div class="cin-cat">' + cat.label + '</div>' +
               valid.map(card).join('');
      });
    });

    Promise.all(promises).then(function (chunks) {
      html = chunks.join('');
      grd.innerHTML = html ||
        '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:rgba(255,255,255,.3);font-size:.75rem;">Could not load films — check your connection.</div>';
      if (window.initReveal) window.initReveal();
    }).catch(function (err) {
      console.error('[Cinema]', err);
      grd.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:rgba(255,255,255,.3);font-size:.75rem;">Cinema unavailable. Please try again.</div>';
    });
  };

  /* ── Search ────────────────────────────────────────────────────────────*/
  window.cinSearch = function () {
    var inp   = document.getElementById('cin-search-input');
    var query = inp ? inp.value.trim() : '';
    if (!query) { window.cinReset(); return; }

    var clr = document.getElementById('cin-clear');
    var cnt = document.getElementById('cin-count');
    var grd = document.getElementById('cin-grid');
    if (clr) clr.style.display = 'inline-block';
    if (cnt) cnt.textContent = 'Results for "' + query + '"';
    if (!grd) return;
    grd.innerHTML = skeletons(6);

    searchTMDB(query).then(function (results) {
      if (!results.length) {
        grd.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:rgba(255,255,255,.35);font-size:.75rem;">No films found for "<em>' + escHtml(query) + '</em>"</div>';
        return;
      }
      return Promise.all(results.slice(0, 9).map(function (m) { return fetchMovie(m.id); }))
        .then(function (detailed) {
          grd.innerHTML = detailed.filter(Boolean).map(card).join('');
          if (window.initReveal) window.initReveal();
        });
    }).catch(function () {
      grd.innerHTML = '<div style="grid-column:1/-1;text-align:center;padding:3rem;color:rgba(255,255,255,.3);">Search unavailable.</div>';
    });
  };

  /* Signal ready */
  console.log('[Cinema] Module ready — TMDB integration active');

})();
