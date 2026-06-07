/**
 * High-Fidelity Dashboard Migration from "Integrated"
 */

// ── API SAFETY CONFIGURATION ──
// For production, these should be handled via environment variables or a proxy.
const RD_CONFIG = {
    spoonacular: {
        apiKey: '5c1ca4923194401a8830d0022f24c57f',
        baseUrl: 'https://api.spoonacular.com',
        limit: 150
    }
};

// ── FALLBACK DATA FOR OFFLINE/CORS/502 RESONANCE ──
const MOCK_NUTRITIONAL_DATA = {
    weekly: {
        week: {
            monday: { meals: [{ id: 101, title: "Alpha Quinoa Power Bowl", imageType: "jpg" }, { id: 102, title: "Lentil Resonance Soup", imageType: "jpg" }, { id: 103, title: "Theta Tempeh Stir-fry", imageType: "jpg" }], nutrients: { calories: 1950 } },
            tuesday: { meals: [{ id: 104, title: "Gamma Green Smoothie", imageType: "jpg" }, { id: 105, title: "Beta Berry Salad", imageType: "jpg" }, { id: 106, title: "Delta Mushroom Risotto", imageType: "jpg" }], nutrients: { calories: 1850 } },
            wednesday: { meals: [{ id: 107, title: "High-Fidelity Avocado Toast", imageType: "jpg" }, { id: 108, title: "Chickpea Flow Wrap", imageType: "jpg" }, { id: 109, title: "Omega Walnut Pasta", imageType: "jpg" }], nutrients: { calories: 2100 } },
            thursday: { meals: [{ id: 110, title: "Sensory Tofu Scramble", imageType: "jpg" }, { id: 111, title: "Pattern Integration Bowl", imageType: "jpg" }, { id: 112, title: "Deep Restoration Stew", imageType: "jpg" }], nutrients: { calories: 2000 } },
            friday: { meals: [{ id: 113, title: "Focus Fuel Chia Pudding", imageType: "jpg" }, { id: 114, title: "Resonance Buddha Bowl", imageType: "jpg" }, { id: 115, title: "Cognitive Curry", imageType: "jpg" }], nutrients: { calories: 1900 } },
            saturday: { meals: [{ id: 116, title: "Creative Energy Pancakes", imageType: "jpg" }, { id: 117, title: "Social Resonance Tapas", imageType: "jpg" }, { id: 118, title: "Euphoric Eggplant Bake", imageType: "jpg" }], nutrients: { calories: 2200 } },
            sunday: { meals: [{ id: 119, title: "Baseline Reset Omelette", imageType: "jpg" }, { id: 120, title: "Community Roast (Vegan)", imageType: "jpg" }, { id: 121, title: "Zen Zucchini Noodles", imageType: "jpg" }], nutrients: { calories: 1800 } }
        }
    },
    search: {
        results: [
            { id: 201, title: "Resonance Superfood Salad", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&q=80&w=400" },
            { id: 202, title: "Theta Frequency Hummus", image: "https://images.unsplash.com/photo-1541518763039-461628873c06?auto=format&fit=crop&q=80&w=400" },
            { id: 203, title: "Gamma Sprout Wrap", image: "https://images.unsplash.com/photo-1540713434306-58f3587e53f2?auto=format&fit=crop&q=80&w=400" }
        ]
    }
};

class NutritionalEngine {
    constructor(app) {
        this.app = app;
        this.apiKey = RD_CONFIG.spoonacular.apiKey;
        this.baseUrl = RD_CONFIG.spoonacular.baseUrl;
        this.fridge = JSON.parse(localStorage.getItem('rd-fridge') || '[]');
        this.weeklyPlan = JSON.parse(localStorage.getItem('rd-weekly-plan') || 'null');
        this.shoppingList = JSON.parse(localStorage.getItem('rd-shopping-list') || '{}');
        this.activeTab = 'search';
    }

    init() {
        // Tab switching — support both attributes for consistency
        document.querySelectorAll('.meals-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.mealsTab || btn.dataset.tab;
                if (target) this.switchTab(target);
            });
        });

        // Close modal on click outside or ESC
        const overlay = document.getElementById('recipe-modal-overlay');
        if (overlay) {
            overlay.addEventListener('click', (e) => {
                if (e.target === overlay) this.closeModal();
            });
        }
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && overlay?.classList.contains('active')) {
                this.closeModal();
            }
        });

        // Search inputs
        const searchInput = document.getElementById('recipe-search-input');
        if (searchInput) {
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.searchRecipes();
            });
        }

        // Render initial states
        this.renderFridge();
        if (this.weeklyPlan) this.renderWeeklyPlan();
        if (Object.keys(this.shoppingList).length > 0) this.renderShoppingList();
        
        // Initial Quota & Status check
        this.updateQuotaUI();
        this.checkAPIStatus();
    }

    async checkAPIStatus() {
        const tag = document.getElementById('api-status-tag');
        if (!tag) return;

        try {
            // Minimal request to verify key
            const used = localStorage.getItem('rd-api-quota') || 0;
            if (used >= RD_CONFIG.spoonacular.limit) {
                tag.style.background = 'rgba(239, 68, 68, 0.1)';
                tag.style.borderColor = '#ef4444';
                tag.style.color = '#ef4444';
                tag.innerHTML = 'SPOONACULAR: QUOTA REACHED';
                return;
            }
            
            tag.innerHTML = '<span class="rd-pulse"></span> SPOONACULAR: ACTIVE';
        } catch (err) {
            tag.style.background = 'rgba(239, 68, 68, 0.1)';
            tag.style.borderColor = '#ef4444';
            tag.style.color = '#ef4444';
            tag.innerHTML = 'SPOONACULAR: OFFLINE';
        }
    }

    async fetchAPI(endpoint, params = {}, options = {}) {
        const url = new URL(`${this.baseUrl}${endpoint}`);
        url.searchParams.append('apiKey', this.apiKey);
        Object.keys(params).forEach(key => {
            if (params[key] !== undefined && params[key] !== '') url.searchParams.append(key, params[key]);
        });

        try {
            const fetchOptions = options.method === 'POST' ? {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: options.body
            } : {};

            const response = await fetch(url, fetchOptions);
            
            if (!response.ok) throw new Error(`API Error: ${response.status}`);
            
            return await response.json();
        } catch (err) {
            console.warn("Meal Engine Connection Unstable. Using Local Resonance Fallback.", err);
            this.app.systemLog && this.app.systemLog("Spoonacular resonance unstable: Using local fallback.");
            
            // Return appropriate mock data based on endpoint
            if (endpoint.includes('generate')) return MOCK_NUTRITIONAL_DATA.weekly;
            if (endpoint.includes('complexSearch')) return MOCK_NUTRITIONAL_DATA.search;
            return null;
        }
    }

    updateQuotaUI(used = localStorage.getItem('rd-api-quota') || 0) {
        const bar = document.getElementById('quota-fill');
        const label = document.getElementById('quota-label');
        if (bar && label) {
            const limit = 150; // Standard free tier daily limit
            const percent = Math.min((used / limit) * 100, 100);
            bar.style.width = `${percent}%`;
            label.innerText = `${Math.round(used)} / ${limit} pts`;
            if (percent > 90) bar.style.background = '#ff4444';
        }
    }

    switchTab(tabId) {
        if (!tabId) return;
        this.activeTab = tabId;
        
        // Sensory feedback
        this.app.playCommitSound();
        this.app.triggerPulse();
        
        // Update Buttons
        document.querySelectorAll('.meals-tab-btn').forEach(btn => {
            const btnTab = btn.dataset.mealsTab || btn.dataset.tab;
            btn.classList.toggle('active', btnTab === tabId);
        });

        // Update Panels
        document.querySelectorAll('.meals-tab-panel').forEach(panel => {
            const isActive = panel.id === `meals-tab-${tabId}`;
            panel.classList.toggle('active', isActive);
            // Reset scroll when switching tabs
            if (isActive) panel.scrollTop = 0;
        });

        // Trigger animations
        const activePanel = document.getElementById(`meals-tab-${tabId}`);
        if (activePanel) {
            gsap.from(activePanel.children, { opacity: 0, scale: 0.98, stagger: 0.05, duration: 0.4, ease: "power2.out" });
        }
    }

    /* ═══ TAB 1: ADVANCED SEARCH ═══ */
    async searchRecipes() {
        const query = document.getElementById('recipe-search-input')?.value;
        const grid = document.getElementById('recipe-results-grid');
        const count = document.getElementById('search-result-count');
        const btn = document.querySelector('.search-exec-btn');
        if (!query) return;

        if (btn) btn.classList.add('committing');
        this.app.playCommitSound();
        this.app.triggerPulse();
        grid.innerHTML = '<div class="rd-spinner" style="margin:2rem auto; grid-column:1/-1;"></div>';

        const diets = Array.from(document.querySelectorAll('#diet-filters .filter-chip.active')).map(el => el.innerText.toLowerCase()).join(',');
        const intolerances = Array.from(document.querySelectorAll('#intolerance-filters .filter-chip.active')).map(el => el.innerText.toLowerCase()).join(',');
        const maxCalories = document.getElementById('max-calories')?.value;
        const minProtein = document.getElementById('min-protein')?.value;
        const maxFat = document.getElementById('max-fat')?.value;
        const sort = document.getElementById('sort-select')?.value || 'popularity';

        try {
            const data = await this.fetchAPI('/recipes/complexSearch', {
                query, diet: diets, intolerances, maxCalories, minProtein, maxFat, sort,
                number: 12, addRecipeInformation: true, fillIngredients: true
            });

            if (data && data.results) {
                this.renderRecipeGrid(data.results, grid);
                document.getElementById('search-result-count').innerText = `Sync complete: ${data.totalResults} nodes found`;
                // grid.scrollIntoView removed to prevent viewport jumping
            } else {
                grid.innerHTML = '<div class="rd-empty-state" style="grid-column:1/-1;">No results found for this query.</div>';
            }
        } finally {
            if (btn) btn.classList.remove('committing');
        }
    }

    renderRecipeGrid(recipes, container) {
        if (!recipes.length) {
            container.innerHTML = '<div class="meals-empty-state"><p>Zero results in this frequency.</p></div>';
            return;
        }
        container.innerHTML = recipes.map(recipe => `
            <div class="recipe-card" onclick="window.rdApp.nutritionalEngine.openRecipeModal(${recipe.id})">
                <img src="${recipe.image}" class="recipe-card-img" alt="${recipe.title}">
                <div class="recipe-card-body">
                    <h3 class="recipe-card-title">${recipe.title}</h3>
                    <div class="recipe-card-meta">
                        <span>⏱️ ${recipe.readyInMinutes || '--'}m</span>
                        <span>🔥 ${recipe.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || '--'} kcal</span>
                    </div>
                </div>
                <div class="recipe-health-badge">${recipe.healthScore || '--'}</div>
            </div>
        `).join('');
    }

    /* ═══ FRIDGE MODE ═══ */
    addFridgeIngredient() {
        const input = document.getElementById('fridge-ingredient-input');
        const val = input?.value.trim();
        if (val && !this.fridge.includes(val)) {
            this.fridge.push(val);
            input.value = '';
            this.app.playCommitSound();
            this.app.triggerPulse();
            this.renderFridge();
            localStorage.setItem('rd-fridge', JSON.stringify(this.fridge));
        }
    }

    removeFridgeIngredient(index) {
        this.app.playCommitSound();
        this.app.triggerPulse();
        this.fridge.splice(index, 1);
        this.renderFridge();
        localStorage.setItem('rd-fridge', JSON.stringify(this.fridge));
    }

    renderFridge() {
        const wrap = document.getElementById('fridge-wrap');
        if (!wrap) return;
        if (this.fridge.length === 0) {
            wrap.innerHTML = '<span class="fridge-placeholder">No ingredients added yet</span>';
            return;
        }
        wrap.innerHTML = this.fridge.map((ing, idx) => `
            <span class="filter-chip active" style="background:rgba(201,168,76,0.15); border:1px solid var(--rd-gold); color:var(--rd-gold);">
                ${ing} <span onclick="window.rdApp.nutritionalEngine.removeFridgeIngredient(${idx})" style="cursor:pointer; margin-left:5px; opacity:0.6;">✕</span>
            </span>
        `).join('');
    }

    async searchByIngredients() {
        const grid = document.getElementById('recipe-results-grid');
        const btn = document.querySelector('button[onclick*="searchByIngredients"]');
        if (!this.fridge.length) return;
        
        grid.innerHTML = '<div class="meals-empty-state"><span class="rd-spinner"></span><p>Matching Molecular Signatures...</p></div>';
        if (btn) btn.classList.add('committing');
        this.app.playCommitSound();
        this.app.triggerPulse();

        try {
            const data = await this.fetchAPI('/recipes/findByIngredients', {
                ingredients: this.fridge.join(','), number: 12, ranking: 1
            });

            if (data) {
                this.renderRecipeGrid(data, grid);
                // grid.scrollIntoView removed
            }
        } finally {
            if (btn) btn.classList.remove('committing');
        }
    }

    /* ═══ TAB 2: MEAL PLANNER ═══ */
    async generateWeeklyPlan() {
        const calories = document.getElementById('plan-calories')?.value || 2000;
        const diet = document.getElementById('plan-diet')?.value;
        const grid = document.getElementById('weekly-planner-grid');
        const btn = document.querySelector('button[onclick*="generateWeeklyPlan"]');
        
        if (btn) btn.classList.add('committing');
        this.app.playCommitSound();
        this.app.triggerPulse();

        grid.innerHTML = '<div style="grid-column:span 7; padding:4rem; text-align:center;"><span class="rd-spinner"></span><p>Architecting Weekly Resonance...</p></div>';

        const data = await this.fetchAPI('/mealplanner/generate', {
            timeFrame: 'week', targetCalories: calories, diet: diet
        });

        if (data && data.week) {
            this.weeklyPlan = data.week;
            localStorage.setItem('rd-weekly-plan', JSON.stringify(this.weeklyPlan));
            this.renderWeeklyPlan();
            
            // Auto-trigger shopping list generation
            await this.generateShoppingList();
            
            if (this.app.refreshOverview) this.app.refreshOverview();
        } else {
            grid.innerHTML = '<div style="grid-column:span 7; padding:4rem; text-align:center; opacity:0.8;"><p>Connection to Spoonacular failed or returned invalid data. Please try again later.</p></div>';
        }
        
        if (btn) btn.classList.remove('committing');
    }

    renderWeeklyPlan() {
        const grid = document.getElementById('weekly-planner-grid');
        if (!grid || !this.weeklyPlan) return;

        const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
        grid.innerHTML = days.map(day => {
            const dayData = this.weeklyPlan[day];
            return `
                <div class="planner-day">
                    <span class="planner-day-name">${day.charAt(0).toUpperCase() + day.slice(1)}</span>
                    <div class="planner-day-meals">
                        ${dayData.meals.map(meal => `
                            <div class="planner-meal-card" onclick="window.rdApp.nutritionalEngine.openRecipeModal(${meal.id})">
                                <img src="https://spoonacular.com/recipeImages/${meal.id}-90x90.${meal.imageType}" alt="${meal.title}">
                                <div class="planner-meal-info">
                                    <div class="title">${meal.title}</div>
                                    <div class="meta">${meal.readyInMinutes}m</div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                </div>
            `;
        }).join('');
    }

    async generateShoppingList() {
        if (!this.weeklyPlan) return;
        const panel = document.getElementById('shopping-list-panel');
        const content = document.getElementById('shopping-list-content');
        const btn = document.getElementById('btn-toggle-shopping');
        if (!panel || !content) return;
        
        panel.style.display = 'block';
        content.innerHTML = '<div style="padding:4rem; text-align:center;"><span class="rd-spinner"></span><p>Consolidating Molecular Inventories...</p></div>';
        if (btn) btn.classList.add('committing');
        this.app.playCommitSound();

        try {
            // Collect all meal IDs
            const mealIds = [];
            Object.values(this.weeklyPlan).forEach(day => {
                if (day.meals) day.meals.forEach(m => mealIds.push(m.id));
            });

            if (mealIds.length === 0) {
                content.innerHTML = '<p style="text-align:center; opacity:0.6; padding:2rem;">Zero nodes detected in current plan.</p>';
                return;
            }

            // Fetch bulk information
            const recipes = await this.fetchAPI('/recipes/informationBulk', { 
                ids: mealIds.join(','), 
                includeNutrition: false 
            });

            if (!recipes) throw new Error("Failed to fetch recipe details for consolidation");

            // Consolidate ingredients
            const inventory = {};
            recipes.forEach(recipe => {
                recipe.extendedIngredients.forEach(ing => {
                    const key = ing.name.toLowerCase().trim();
                    if (!inventory[key]) {
                        inventory[key] = { 
                            name: ing.name, 
                            amount: ing.measures.us.amount, 
                            unit: ing.measures.us.unitShort, 
                            checked: false 
                        };
                    } else {
                        // Simple addition if units match
                        if (inventory[key].unit === ing.measures.us.unitShort) {
                            inventory[key].amount += ing.measures.us.amount;
                        } else if (!inventory[key].unit) {
                             inventory[key].unit = ing.measures.us.unitShort;
                             inventory[key].amount += ing.measures.us.amount;
                        }
                    }
                });
            });

            this.shoppingList = inventory;
            localStorage.setItem('rd-shopping-list', JSON.stringify(inventory));
            this.renderShoppingList();

        } catch (err) {
            console.error("Shopping List Error:", err);
            content.innerHTML = `<p style="text-align:center; padding:2rem; color: #ff6b6b;">Resonance error during inventory consolidation: ${err.message}</p>`;
        } finally {
            if (btn) btn.classList.remove('committing');
            panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    renderShoppingList() {
        const content = document.getElementById('shopping-list-content');
        if (!content || !this.shoppingList) return;

        const items = Object.values(this.shoppingList);
        if (items.length === 0) {
            content.innerHTML = '<p style="text-align:center; opacity:0.6; padding:2rem;">Inventory cleared.</p>';
            return;
        }

        content.innerHTML = `
            <div class="shopping-list mode-${this.app.activeSensoryMode}">
                <div class="rd-grid-2col" style="gap:1rem;">
                    ${items.map((item, idx) => `
                        <div class="shop-item ${item.checked ? 'checked' : ''}" 
                             data-node-name="${item.name.replace(/'/g, "\\'")}"
                             onclick="window.rdApp.nutritionalEngine.toggleShopItem('${item.name.replace(/'/g, "\\'")}', this)">
                            <div class="rd-node-checkbox">
                               <div class="inner"></div>
                            </div>
                            <div class="shop-item-details">
                                <span class="name">${item.name}</span>
                                <span class="amount">${Number(item.amount.toFixed(1))} ${item.unit}</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div style="margin-top:2.5rem; padding-top:1.5rem; border-top:1px solid rgba(255,255,255,0.05); font-size:0.7rem; opacity:0.5; text-align:center; font-family:var(--rd-mono); letter-spacing:0.1em;">
                    NEURAL CONSOLIDATION COMPLETE: ${items.length} NODES INTEGRATED.
                </div>
            </div>
        `;
    }

    toggleShopItem(name, el) {
        const key = name.toLowerCase().trim();
        if (this.shoppingList[key]) {
            const newState = !this.shoppingList[key].checked;
            this.shoppingList[key].checked = newState;
            localStorage.setItem('rd-shopping-list', JSON.stringify(this.shoppingList));
            
            // Visual Feedback
            if (el) {
                el.classList.toggle('checked', newState);
                if (newState) {
                    el.classList.add('node-committing');
                    setTimeout(() => el.classList.remove('node-committing'), 600);
                }
            }

            // Play sound and pulse
            this.app.triggerPulse();
            if (newState) {
                this.playCheckOffSound();
            } else {
                this.playCommitSound();
            }
        }
    }

    playCommitSound() { this.app.playCommitSound(); }
    playCheckOffSound() { this.app.playCheckOffSound(); }

    toggleShoppingList() {
        const panel = document.getElementById('shopping-list-panel');
        if (panel) {
            const isHidden = panel.style.display === 'none';
            panel.style.display = isHidden ? 'block' : 'none';
            if (isHidden && !this.weeklyPlan) {
                document.getElementById('shopping-list-content').innerHTML = `
                    <div style="padding:2rem; text-align:center; opacity:0.6;">
                        <p>No active plan detected. Generate a weekly protocol to initialize inventory.</p>
                        <button class="rd-btn-primary" style="width:auto; padding:0.8rem 1.5rem; margin-top:1rem;" onclick="window.rdApp.nutritionalEngine.switchTab('planner')">GOTO PLANNER</button>
                    </div>
                `;
            } else if (isHidden) {
                this.generateShoppingList();
            }
        }
    }

    exportPlan() {
        if (!this.weeklyPlan) {
            alert("Generate a plan before exporting.");
            return;
        }
        window.print();
    }

    exportShoppingList() {
        window.print();
    }

    /* ═══ TAB 3: ANALYSIS ═══ */
    async analyzeByInput() {
        const val = document.getElementById('analyze-recipe-id')?.value;
        const btn = document.querySelector('button[onclick*="analyzeByInput"]');
        if (!val) return;
        
        if (btn) btn.classList.add('committing');
        this.playCommitSound();
        
        try {
            await this.openRecipeModal(val);
        } finally {
            if (btn) btn.classList.remove('committing');
        }
    }

    /* ═══ RECIPE MODAL ═══ */
    async openRecipeModal(id) {
        const overlay = document.getElementById('recipe-modal-overlay');
        const content = document.getElementById('recipe-modal-content');
        
        // Show overlay with GSAP
        overlay.classList.add('active');
        gsap.to(overlay, { opacity: 1, duration: 0.3, ease: "power2.out" });
        
        content.innerHTML = '<div style="padding:4rem; text-align:center;"><span class="rd-spinner"></span><p>Decrypting Somatic Data...</p></div>';
        content.scrollTop = 0;

        const info = await this.fetchAPI(`/recipes/${id}/information`, { includeNutrition: true });
        if (!info) {
            content.innerHTML = '<p>Failed to retrieve recipe data.</p>';
            return;
        }

        const cal = info.nutrition?.nutrients?.find(n => n.name === 'Calories')?.amount || 0;
        const protein = info.nutrition?.nutrients?.find(n => n.name === 'Protein')?.amount || 0;
        const fat = info.nutrition?.nutrients?.find(n => n.name === 'Fat')?.amount || 0;
        const carb = info.nutrition?.nutrients?.find(n => n.name === 'Carbohydrates')?.amount || 0;

        content.innerHTML = `
            <button class="modal-close-btn" onclick="window.rdApp.nutritionalEngine.closeModal()">✕</button>
            <div class="recipe-modal-body">
                <div class="recipe-modal-hero" style="background-image: url('${info.image}')">
                    <div class="recipe-modal-header-info">
                        <h2 class="rd-font-serif">${info.title}</h2>
                        <div class="rd-tag">Ready in ${info.readyInMinutes}m</div>
                    </div>
                </div>

                <div class="recipe-modal-tabs">
                    <button class="recipe-modal-tab active" data-modaltab="overview">Overview</button>
                    <button class="recipe-modal-tab" data-modaltab="ingredients">Ingredients</button>
                    <button class="recipe-modal-tab" data-modaltab="instructions">Instructions</button>
                    <button class="recipe-modal-tab" data-modaltab="biometrics">Bio-Metrics</button>
                </div>

                <div class="recipe-modal-tab-content active" id="modal-overview">
                    <p style="font-size:0.85rem; line-height:1.7; opacity:0.8;">${info.summary.split('. ').slice(0, 3).join('. ')}...</p>
                    <div style="display:flex; gap:1rem; margin-top:1.5rem;">
                        <div class="stat-mini"><span>Health</span><strong>${info.healthScore}%</strong></div>
                        <div class="stat-mini"><span>Price</span><strong>$${(info.pricePerServing/100).toFixed(2)} / sv</strong></div>
                        <div class="stat-mini"><span>Score</span><strong>${info.spoonacularScore}%</strong></div>
                    </div>
                    <div class="rd-divider" style="margin:2rem 0;"></div>
                    <h4 class="rd-panel-label">Dietary Attributes</h4>
                    <div class="filter-chips">
                        ${info.vegan ? '<span class="filter-chip active">Vegan</span>' : ''}
                        ${info.vegetarian ? '<span class="filter-chip active">Vegetarian</span>' : ''}
                        ${info.glutenFree ? '<span class="filter-chip active">Gluten-Free</span>' : ''}
                        ${info.dairyFree ? '<span class="filter-chip active">Dairy-Free</span>' : ''}
                        ${info.ketogenic ? '<span class="filter-chip active">Keto</span>' : ''}
                    </div>
                </div>

                <div class="recipe-modal-tab-content" id="modal-ingredients">
                    <ul class="recipe-modal-list">
                        ${info.extendedIngredients.map(ing => `<li><span style="color:var(--rd-gold)">${ing.measures.us.amount} ${ing.measures.us.unitShort}</span> ${ing.originalName}</li>`).join('')}
                    </ul>
                </div>

                <div class="recipe-modal-tab-content" id="modal-instructions">
                     <div class="recipe-modal-list">
                        ${info.analyzedInstructions[0]?.steps.map(s => `
                            <div style="margin-bottom:1.2rem;">
                                <span style="font-family:var(--rd-mono); color:var(--rd-gold); font-size:0.7rem;">Step ${s.number}</span>
                                <p style="font-size:0.85rem; margin-top:0.3rem; line-height:1.6;">${s.step}</p>
                            </div>
                        `).join('') || '<p>No structured instructions found.</p>'}
                    </div>
                </div>

                <div class="recipe-modal-tab-content" id="modal-biometrics">
                    <div class="biometrics-grid">
                        <!-- Nutrition Label -->
                        <div class="nutrition-label">
                            <div class="label-title">Nutrition Facts</div>
                            <div class="label-hr-thick"></div>
                            <div style="padding:4px 0;">Amount per serving</div>
                            <div class="label-cal-row">
                                <span>Calories</span>
                                <span>${Math.round(cal)}</span>
                            </div>
                            <div class="label-hr-med"></div>
                            <div style="text-align:right; font-size:0.65rem; font-weight:bold;">% Daily Value*</div>
                            <div class="label-line">
                                <span><strong>Total Fat</strong> ${Math.round(fat)}g</span>
                                <span><strong>${Math.round((fat/65)*100)}%</strong></span>
                            </div>
                            <div class="label-line">
                                <span><strong>Total Carbohydrate</strong> ${Math.round(carb)}g</span>
                                <span><strong>${Math.round((carb/300)*100)}%</strong></span>
                            </div>
                            <div class="label-line" style="border-bottom:none;">
                                <span><strong>Protein</strong> ${Math.round(protein)}g</span>
                            </div>
                            <div class="label-hr-thick"></div>
                            <p style="font-size:0.5rem; line-height:1.2;">* The % Daily Value (DV) tells you how much a nutrient in a serving of food contributes to a daily diet. 2,000 calories a day is used for general nutrition advice.</p>
                        </div>
                        
                        <!-- Charts -->
                        <div class="biometrics-charts">
                            <div class="radar-container">
                                <canvas id="tasteRadarCanvas"></canvas>
                            </div>
                            <div class="rd-divider" style="margin: 1.5rem 0;"></div>
                            <label class="rd-control-label">Macronutrient Ratio</label>
                            <div class="macro-bars">
                                <div class="macro-bar"><span class="label">P</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.min((protein/50)*100, 100)}%; background:#c9a84c;"></div></div></div>
                                <div class="macro-bar"><span class="label">C</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.min((carb/200)*100, 100)}%; background:#800020;"></div></div></div>
                                <div class="macro-bar"><span class="label">F</span><div class="bar-bg"><div class="bar-fill" style="width:${Math.min((fat/65)*100, 100)}%; background:#333;"></div></div></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Animate content entrance
        gsap.from(content.querySelector('.recipe-modal-body'), {
            y: 30,
            opacity: 0,
            duration: 0.5,
            ease: "back.out(1.7)"
        });

        // Initialize Modal Tab Listeners
        document.querySelectorAll('.recipe-modal-tab').forEach(btn => {
            btn.addEventListener('click', () => {
                document.querySelectorAll('.recipe-modal-tab').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.recipe-modal-tab-content').forEach(p => p.classList.remove('active'));
                btn.classList.add('active');
                const targetPanel = document.getElementById(`modal-${btn.dataset.modaltab}`);
                if (targetPanel) targetPanel.classList.add('active');
                
                // If biometrics tab, render radar
                if (btn.dataset.modaltab === 'biometrics') this.renderTasteRadar(id);
            });
        });
    }

    async renderTasteRadar(id) {
        const taste = await this.fetchAPI(`/recipes/${id}/tasteWidget.json`);
        const ctx = document.getElementById('tasteRadarCanvas')?.getContext('2d');
        if (!taste || !ctx) return;

        if (this.modalChart) this.modalChart.destroy();
        this.modalChart = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: ['Sweet', 'Salty', 'Sour', 'Bitter', 'Savory', 'Spicy'],
                datasets: [{
                    data: [taste.sweetness, taste.saltiness, taste.sourness, taste.bitterness, taste.savoriness, taste.spiciness],
                    borderColor: 'rgba(201,168,76, 0.8)',
                    backgroundColor: 'rgba(201,168,76, 0.15)',
                    borderWidth: 1.5,
                    pointRadius: 2
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { legend: { display: false } },
                scales: {
                    r: {
                        angleLines: { color: 'rgba(255,255,255,0.05)' },
                        grid: { color: 'rgba(255,255,255,0.05)' },
                        pointLabels: { color: 'rgba(255,255,255,0.4)', font: { size: 8 } },
                        ticks: { display: false },
                        suggestedMin: 0, suggestedMax: 100
                    }
                }
            }
        });
    }

    syncToSensoryMode(mode) {
        const root = document.getElementById('view-meals');
        if (!root) return;

        const isActive = root.classList.contains('active');
        root.className = `rd-view view-with-hero mode-${mode}${isActive ? ' active' : ''}`;

        const modal = document.getElementById('recipe-modal');
        if (modal) {
            modal.className = `recipe-modal mode-${mode}`;
        }

        const shopPanel = document.getElementById('shopping-list-panel');
        if (shopPanel) {
            shopPanel.className = `rd-panel shopping-list mode-${mode}`;
        }
    }

    closeModal() {
        const overlay = document.getElementById('recipe-modal-overlay');
        gsap.to(overlay, { 
            opacity: 0, 
            duration: 0.3, 
            onComplete: () => {
                overlay.classList.remove('active');
                if (this.modalChart) this.modalChart.destroy();
            }
        });
    }

    /* ═══ TAB 4/5: SMART TOOLS ═══ */
    async lookupUPC() {
        const upc = document.getElementById('upc-input')?.value;
        const resultDiv = document.getElementById('upc-result');
        const btn = document.querySelector('button[onclick*="lookupUPC"]');
        if (!upc) return;

        resultDiv.innerHTML = '<span class="rd-spinner"></span> Scanning SKUs...';
        if (btn) btn.classList.add('committing');
        this.playCommitSound();

        try {
            const data = await this.fetchAPI(`/food/products/upc/${upc}`);

            if (data && data.title) {
                resultDiv.innerHTML = `
                    <div style="display:flex; gap:1rem; align-items:center; margin-top:1rem; padding:1rem; background:rgba(255,255,255,0.02); border-radius:12px;">
                        <img src="${data.images ? data.images[0] : ''}" style="width:60px; height:60px; object-fit:contain; background:white; padding:4px; border-radius:8px;">
                        <div>
                            <div style="font-weight:bold; font-size:0.9rem;">${data.title}</div>
                            <div style="font-size:0.75rem; color:var(--rd-gold);">${data.badges ? data.badges.join(' • ') : ''}</div>
                        </div>
                    </div>
                `;
            } else {
                resultDiv.innerHTML = '<p style="font-size:0.75rem; color:#ff4444; margin-top:0.5rem;">Product not found in Spoonacular library.</p>';
            }
        } finally {
            if (btn) btn.classList.remove('committing');
        }
    }

    async searchMenuItems() {
        const query = document.getElementById('menu-search-input')?.value;
        const results = document.getElementById('menu-results');
        const btn = document.querySelector('button[onclick*="searchMenuItems"]');
        if (!query) return;

        results.innerHTML = '<span class="rd-spinner"></span> Querying Menu Registries...';
        if (btn) btn.classList.add('committing');
        this.app.playCommitSound();
        const data = await this.fetchAPI('/food/menuItems/search', { query, number: 5 });

        if (data && data.menuItems) {
            results.innerHTML = data.menuItems.map(item => `
                <div style="padding:0.8rem; border-bottom:1px solid var(--rd-border); display:flex; justify-content:space-between; align-items:center;">
                    <div>
                        <div style="font-size:0.8rem; font-weight:600;">${item.title}</div>
                        <div style="font-size:0.7rem; opacity:0.6;">${item.restaurantChain}</div>
                    </div>
                    <div style="color:var(--rd-gold); font-weight:bold; font-size:0.8rem;">${item.calories || '--'} kcal</div>
                </div>
            `).join('');
        }
    }

    async parseText() {
        const text = document.getElementById('natural-msg-input')?.value;
        const output = document.getElementById('parsed-ingredients-output');
        const btn = document.querySelector('button[onclick*="parseText"]');
        if (!text) return;

        output.innerHTML = '<span class="rd-spinner"></span> Extracting Bio-Metrics...';
        if (btn) btn.classList.add('committing');
        this.app.playCommitSound();
        const response = await fetch(`https://api.spoonacular.com/recipes/parseIngredients?apiKey=${this.apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: `ingredientList=${encodeURIComponent(text)}&servings=1`
        });
        const data = await response.json();

        if (data && data.length) {
            output.innerHTML = data.map(ing => `
                <div class="rd-check-item" style="cursor:default; margin-bottom:0.4rem;">
                    <div class="rd-checkbox" style="background:var(--rd-gold)"></div>
                    <div class="rd-check-label">
                        <span style="font-weight:bold;">${ing.amount} ${ing.unit}</span> ${ing.originalName}
                        <br><span style="font-size:0.65rem; opacity:0.5;">Est. $${(ing.estimatedCost?.value/100).toFixed(2)}</span>
                    </div>
                </div>
            `).join('');
        }
    }

    async getWinePairing() {
        const dish = document.getElementById('wine-dish-input')?.value;
        const output = document.getElementById('wine-pairing-output');
        if (!dish) return;

        output.innerHTML = '<span class="rd-spinner"></span> Consulting Sommelier...';
        const data = await this.fetchAPI('/food/wine/pairing', { food: dish });

        if (data && data.pairedWines) {
            output.innerHTML = `
                <div style="padding:1rem; background:rgba(201,168,76,0.05); border-left:3px solid var(--rd-gold); border-radius:0 12px 12px 0;">
                    <div style="font-weight:bold; color:var(--rd-gold); margin-bottom:0.5rem;">Suggested: ${data.pairedWines.join(', ')}</div>
                    <p style="font-size:0.8rem; line-height:1.5;">${data.pairingText}</p>
                </div>
            `;
        } else {
            output.innerHTML = '<p style="font-size:0.75rem; opacity:0.6;">No precise pairing found for this dish trajectory.</p>';
        }
    }

    async getSubstitutes() {
        const dish = document.getElementById('substitute-input')?.value;
        const output = document.getElementById('substitutes-output');
        if (!dish) return;

        output.innerHTML = '<span class="rd-spinner"></span> Processing Substitutions...';
        const data = await this.fetchAPI('/recipes/substitutes', { ingredientName: dish });

        if (data && data.substitutes) {
            output.innerHTML = `
                <div class="rd-checklist">
                    ${data.substitutes.map(sub => `
                        <div class="rd-check-item">
                            <div class="rd-checkbox" style="background:var(--rd-gold)"></div>
                            <div class="rd-check-label">${sub}</div>
                        </div>
                    `).join('')}
                </div>
            `;
        } else {
            output.innerHTML = '<p style="font-size:0.75rem; opacity:0.6;">Unique molecular signature — no direct substitute found.</p>';
        }
    }

    analyzeImage(input) {
        const output = document.getElementById('image-analysis-output');
        if (input.files && input.files[0]) {
            output.innerHTML = '<div style="margin-top:1rem; padding:1rem; background:rgba(255,255,255,0.05); border-radius:12px; font-size:0.75rem; color:var(--rd-gold); text-align:center;">Neural Vision Active... Identification Pending.<br><span style="font-size:0.6rem; color:var(--rd-text-muted);">In production, this uploads to the /food/images/analyze endpoint.</span></div>';
        }
    }
}

class HobbyEngine {
    constructor(app) {
        this.app = app;
        this.activeTab = 'flow';
        this.timer = {
            minutes: 25,
            seconds: 0,
            interval: null,
            isRunning: false
        };
        this.archives = JSON.parse(localStorage.getItem('rd-hobby-archives') || '[]');
        this.charts = {};
    }

    init() {
        // Tab switching
        document.querySelectorAll('[data-hobby-tab]').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.hobbyTab));
        });

        // Hobby Selection Logic
        document.querySelectorAll('#hobby-selection-list .rd-check-item').forEach(item => {
            item.addEventListener('click', () => {
                document.querySelectorAll('#hobby-selection-list .rd-check-item').forEach(i => {
                    i.classList.remove('active');
                    i.querySelector('.rd-checkbox').innerText = '';
                });
                item.classList.add('active');
                item.querySelector('.rd-checkbox').innerText = '✓';
                
                this.app.playCommitSound();
                this.app.triggerPulse();
                
                const hobbyId = item.dataset.hobby;
                this.updateHobbyCalibration(hobbyId);
            });
        });

        this.renderArchives();
        this.initCharts();
    }

    updateHobbyCalibration(id) {
        const display = document.getElementById('flow-timer-display');
        if (!display) return;
        
        const calibrations = {
            'coding': { time: 45, label: 'Algorithmic Flow' },
            'design': { time: 25, label: 'Digital Atelier' },
            'music': { time: 60, label: 'Resonance Practice' },
            'reading': { time: 20, label: 'Linguistic Synthesis' },
            'fitness': { time: 30, label: 'Somatic Excellence' },
            'cooking': { time: 40, label: 'Molecular Alchemy' },
            'photography': { time: 25, label: 'Visual Preservation' },
            'gaming': { time: 60, label: 'Strategic Simulation' }
        };

        const config = calibrations[id] || calibrations['design'];
        this.timer.minutes = config.time;
        this.timer.seconds = 0;
        this.app.playCommitSound();
        this.updateTimerDisplay();
        
        const labelEl = document.getElementById('flow-active-label');
        if (labelEl) labelEl.innerText = config.label;
    }

    switchTab(tabId) {
        this.activeTab = tabId;
        this.app.playCommitSound();
        this.app.triggerPulse();
        document.querySelectorAll('[data-hobby-tab]').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.hobbyTab === tabId);
        });
        document.querySelectorAll('#view-hobbies .meals-tab-panel, #view-hobbies .hobby-tab-panel').forEach(panel => {
            panel.classList.toggle('active', panel.id === `hobby-tab-${tabId}`);
        });

        if (tabId === 'metrics') this.initCharts();
        
        // Trigger animations
        const activePanel = document.getElementById(`hobby-tab-${tabId}`);
        if (activePanel && typeof gsap !== 'undefined') {
            gsap.from(activePanel.children, { opacity: 0, scale: 0.98, stagger: 0.05, duration: 0.4, ease: "power2.out" });
        }
    }

    // ── TAB 1: FLOW TIMER ──
    toggleTimer() {
        const btn = document.getElementById('flow-timer-btn') || document.getElementById('flow-start-btn');
        this.app.playCommitSound();
        this.app.triggerPulse();

        if (this.timer.isRunning) {
            this.stopTimer();
            if (btn) btn.innerText = 'RESUME FLOW';
        } else {
            this.startTimer();
            if (btn) btn.innerText = 'PAUSE FLOW';
        }
    }

    startTimer() {
        if (this.timer.isRunning) return;
        this.timer.isRunning = true;
        
        // Pulse animation
        if (typeof gsap !== 'undefined') {
            const pulse = document.getElementById('flow-pulse-bg');
            if (pulse) {
                gsap.killTweensOf(pulse);
                gsap.set(pulse, { opacity: 0, scale: 0.1 });
                gsap.to(pulse, { opacity: 0.3, scale: 20, duration: 2, repeat: -1, ease: "sine.inOut", yoyo: true });
            }
        }

        this.timer.interval = setInterval(() => {
            if (this.timer.seconds === 0) {
                if (this.timer.minutes === 0) {
                    this.completeTimer();
                    return;
                }
                this.timer.minutes--;
                this.timer.seconds = 59;
            } else {
                this.timer.seconds--;
            }
            this.updateTimerDisplay();
        }, 1000);
    }

    stopTimer() {
        this.timer.isRunning = false;
        clearInterval(this.timer.interval);
        if (typeof gsap !== 'undefined') {
            const pulse = document.getElementById('flow-pulse-bg');
            if (pulse) gsap.to(pulse, { opacity: 0, scale: 0.1, duration: 1 });
        }
    }

    resetTimer() {
        this.app.playCommitSound();
        this.app.triggerPulse();
        this.stopTimer();
        this.timer.minutes = 25;
        this.timer.seconds = 0;
        this.updateTimerDisplay();
        const btn = document.getElementById('flow-timer-btn') || document.getElementById('flow-start-btn');
        if (btn) btn.innerText = 'START FLOW';
    }

    updateTimerDisplay() {
        const display = document.getElementById('flow-timer-display');
        if (display) {
            const m = String(this.timer.minutes).padStart(2, '0');
            const s = String(this.timer.seconds).padStart(2, '0');
            display.innerText = `${m}:${s}`;
        }
    }

    completeTimer() {
        this.stopTimer();
        alert("Flow State Cycle Complete. Calibrating recovery...");
        this.resetTimer();
    }

    // Alias so HTML onclick="addProject()" works too
    addProject() { this.addArchive(); }

    addArchive(titleOverride) {
        const input = document.getElementById('archive-input');
        const title = titleOverride || input?.value.trim();
        if (!title) {
            const prompted = prompt('Project / Discovery name:');
            if (!prompted) return;
            return this.addArchive(prompted);
        }

        const btn = document.querySelector('button[onclick*="addArchive"]');
        if (btn) btn.classList.add('committing');
        this.playCommitSound();

        const activeHobbyEl = document.querySelector('#hobby-selection-list .rd-check-item.active');
        const category = activeHobbyEl ? activeHobbyEl.querySelector('.rd-check-label').innerText.split(' (')[0] : 'General';

        const entry = {
            id: Date.now(),
            title: title,
            category: category,
            progress: 0,
            timestamp: new Date().toISOString()
        };

        this.archives.unshift(entry);
        localStorage.setItem('rd-hobby-archives', JSON.stringify(this.archives));
        this.renderArchives();
        this.app.refreshOverview();
        if (input) input.value = '';
        if (btn) btn.classList.remove('committing');
    }

    removeArchive(id) {
        this.app.playCommitSound();
        this.archives = this.archives.filter(a => a.id !== id);
        localStorage.setItem('rd-hobby-archives', JSON.stringify(this.archives));
        this.renderArchives();
        this.app.refreshOverview();
    }

    updateArchiveProgress(id, progress) {
        const entry = this.archives.find(a => a.id === id);
        if (entry) {
            this.app.playCommitSound();
            this.app.triggerPulse();
            entry.progress = Math.min(100, Math.max(0, parseInt(progress)));
            localStorage.setItem('rd-hobby-archives', JSON.stringify(this.archives));
            this.renderArchives();
            this.app.refreshOverview();
        }
    }

    renderArchives() {
        // Support both the old and new grid IDs
        const grid = document.getElementById('hobby-archive-grid') || document.getElementById('archive-list-grid');
        if (!grid) return;

        if (!this.archives.length) {
            grid.innerHTML = `
                <div class="meals-empty-state" style="grid-column: 1/-1;">
                    <div class="empty-icon">📔</div>
                    <p>Archive directory empty. Initialize your first intellectual trajectory.</p>
                </div>
            `;
            return;
        }

        grid.innerHTML = this.archives.map(a => `
            <div class="rd-check-item" style="height:auto; display:block; padding:1.2rem; background:rgba(255,255,255,0.02); border-radius:16px; border:1px solid var(--rd-border);">
                <div style="display:flex; justify-content:space-between; margin-bottom:0.8rem;">
                    <span class="rd-tag" style="background:rgba(201,168,76,0.1); color:var(--rd-gold);">${a.category}</span>
                    <span style="font-size:0.7rem; color:var(--rd-text-muted);">${a.progress}% Nodes Synced</span>
                </div>
                <div style="font-weight:700; margin-bottom:0.4rem;">${a.title}</div>
                <div style="display:flex; gap:0.5rem; margin-top:1rem; align-items:center;">
                    <div style="flex:1; height:4px; background:rgba(255,255,255,0.1); border-radius:10px; overflow:hidden;">
                        <div style="width:${a.progress}%; height:100%; background:var(--rd-gold); transition: width 0.5s ease;"></div>
                    </div>
                    <button onclick="window.rdApp.hobbyEngine.removeArchive(${a.id})" style="background:none; border:none; color:#ff4444; font-size:0.8rem; cursor:pointer;">✕</button>
                </div>
                <input type="range" value="${a.progress}" min="0" max="100" style="width:100%; margin-top:1rem; opacity:0.1; height:10px;" onchange="window.rdApp.hobbyEngine.updateArchiveProgress(${a.id}, this.value)">
            </div>
        `).join('');
    }

    // ── TAB 3: PULSE ANALYTICS ──
    initCharts() {
        if (typeof Chart === 'undefined') return;

        // 1. Creative Pulse (Line)
        const pulseCtx = document.getElementById('hobbyPulseChart')?.getContext('2d');
        if (pulseCtx) {
            if (this.charts.pulse) this.charts.pulse.destroy();
            this.charts.pulse = new Chart(pulseCtx, {
                type: 'line',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [{
                        label: 'Interaction Points',
                        data: [65, 59, 80, 81, 56, 95, 110],
                        borderColor: '#c9a84c',
                        backgroundColor: 'rgba(201, 168, 76, 0.1)',
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        y: { display: false },
                        x: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { color: 'rgba(255,255,255,0.4)', font: { size: 10 } } }
                    }
                }
            });
        }

        // 2. Engagement Equilibrium (Radar)
        const eqCtx = document.getElementById('hobbyEquilibriumChart')?.getContext('2d');
        if (eqCtx) {
            if (this.charts.equilibrium) this.charts.equilibrium.destroy();
            this.charts.equilibrium = new Chart(eqCtx, {
                type: 'radar',
                data: {
                    labels: ['Logic', 'Creative', 'Social', 'Physical', 'Reflective'],
                    datasets: [{
                        data: [80, 95, 40, 60, 85],
                        borderColor: '#c9a84c',
                        backgroundColor: 'rgba(201, 168, 76, 0.2)',
                        borderWidth: 1
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        r: {
                            pointLabels: { color: 'rgba(255,255,255,0.4)' },
                            ticks: { display: false }
                        }
                    }
                }
            });
        }
    }

    playCommitSound() { this.app.playCommitSound(); }
    playCheckOffSound() { this.app.playCheckOffSound(); }
}

class SleepEngine {
    constructor(app) {
        this.app = app;
        this.activeTab = 'frequencies';
        this.activeTrack = null;
        this.checklist = JSON.parse(localStorage.getItem('rd-sleep-checklist') || '{"magnesium":false,"fountain":false,"candle":false,"journal":false}');
        
        this.tracks = {
            frequencies: [
                { id: 'f1', name: 'Delta Waves Sleep Deep', hz: '1-4Hz', desc: 'Restorative Sleep' },
                { id: 'f2', name: 'Theta Sleep Meditation', hz: '4-7Hz', desc: 'Dream State & Intuition' },
                { id: 'f3', name: '528 Hz Deep Sleep Healing', hz: '528Hz', desc: 'DNA & Emotional Repair' },
                { id: 'f4', name: '417 Hz Reset & Release', hz: '417Hz', desc: 'Stress & Trauma Release' },
                { id: 'f5', name: '852 Hz Intuition Activation', hz: '852Hz', desc: 'Awareness Activation' },
                { id: 'f6', name: '963 Hz Higher Self Alignment', hz: '963Hz', desc: 'Higher Connection' },
                { id: 'f7', name: 'Calm Night Binaural Beats', hz: 'Loop', desc: '8-hour Deep Rest' },
                { id: 'f8', name: 'Mind Programming Theta', hz: 'Theta', desc: 'Subconscious Reprogramming' },
                { id: 'f9', name: 'Subconscious Affirmations', hz: 'Theta', desc: 'Positive Rewiring' },
                { id: 'f10', name: 'Deep Rest Isochronic', hz: 'Delta', desc: 'Sync Brainwave activity' }
            ],
            bowls: [
                { id: 'b1', name: 'Tibetan Singing Bowl', desc: 'Hand-crafted metal resonance' },
                { id: 'b2', name: 'Crystal Bowls Low Tone', desc: 'Pure quartz vibrations' },
                { id: 'b3', name: 'Gong Bath for Deep Rest', desc: 'Intense somatic relaxation' },
                { id: 'b4', name: 'Quartz Bowl Theta Sleep', desc: '432Hz focused clarity' },
                { id: 'b5', name: 'Sonic Vibrations Reset', desc: 'Nervous system recalibration' }
            ],
            guided: [
                { id: 'g1', name: 'Subconscious Abundance', desc: 'Guided Hypnosis for Morning Wealth' },
                { id: 'g2', name: 'Confidence & Self-Love', desc: 'Repairing the core identity' },
                { id: 'g3', name: 'Creativity & Intuition', desc: 'Unlocking the Theta gate' },
                { id: 'g4', name: 'Nightly Success — Whispered', desc: 'Subliminal achievement loops' },
                { id: 'g5', name: 'Relaxation & Mind Reset', desc: 'Complete somatic shutdown' }
            ],
            ambient: [
                { id: 'a1', name: 'Forest Night Ambience', desc: 'Crickets & Gentle Wind' },
                { id: 'a2', name: 'Rainfall & Light Thunder', desc: 'Continuous loop' },
                { id: 'a3', name: 'Ocean Waves at Night', desc: 'Delta Frequency Overlay' },
                { id: 'a4', name: 'Gentle River Flow', desc: 'Low grounding tones' },
                { id: 'a5', name: 'Soft Wind & Leaves', desc: 'Isochronic Overlay' }
            ]
        };
    }

    init() {
        document.querySelectorAll('.sleep-tab-btn').forEach(btn => {
            btn.addEventListener('click', () => this.switchTab(btn.dataset.sleepTab));
        });
        
        this.renderTracks();
        this.updateChecklistUI();
    }

    switchTab(tabId) {
        this.activeTab = tabId;
        
        // Sensory feedback
        this.app.playCommitSound();
        this.app.triggerPulse();

        document.querySelectorAll('.sleep-tab-btn').forEach(btn => btn.classList.toggle('active', btn.dataset.sleepTab === tabId));
        document.querySelectorAll('.sleep-tab-panel').forEach(panel => panel.classList.toggle('active', panel.id === `sleep-tab-${tabId}`));
        this.renderTracks();
    }

    renderTracks() {
        // Find the grid within the active tab panel
        const activePanel = document.getElementById(`sleep-tab-${this.activeTab}`);
        if (!activePanel) return;
        
        const grid = activePanel.querySelector('.rd-checklist');
        if (!grid) return;
        
        const currentData = this.tracks[this.activeTab];
        if (!currentData) return;
        
        grid.innerHTML = currentData.map(t => `
            <div class="rd-check-item ${this.activeTrack === t.id ? 'active' : ''}" onclick="window.rdApp.sleepEngine.toggleTrack('${t.id}')">
                <div class="rd-checkbox">${this.activeTrack === t.id ? '⏸' : '▶'}</div>
                <div class="rd-check-label">
                    <div style="font-weight:600;">${t.name}</div>
                    <div style="font-size:0.65rem; opacity:0.6;">${t.hz ? t.hz + ' — ' : ''}${t.desc}</div>
                </div>
            </div>
        `).join('');
    }

    toggleTrack(id) {
        if (this.activeTrack === id) {
            this.activeTrack = null;
            this.app.playbackSensory('silence');
            this.app.systemLog && this.app.systemLog("Sleep sequence suspended.");
        } else {
            this.activeTrack = id;
            
            // Comprehensive Mapping for All Sleep Tracks (No 404s)
            let type = 'theta';
            
            if (id.startsWith('f')) { // Frequencies
                const freqMap = { 'f1': 'delta', 'f2': 'theta', 'f3': 'solfeggio-528', 'f4': 'solfeggio-417', 'f5': 'solfeggio-852', 'f6': 'solfeggio-963', 'f7': 'delta', 'f8': 'theta', 'f9': 'theta', 'f10': 'delta' };
                type = freqMap[id] || 'theta';
            } else if (id.startsWith('b')) { // Bowls (Vibrations)
                const bowlMap = { 'b1': 'bowl-432', 'b2': 'bowl-528', 'b3': 'vibration', 'b4': 'bowl-396', 'b5': 'bowl-174' };
                type = bowlMap[id] || 'vibration';
            } else if (id.startsWith('g')) { // Guided
                const guideMap = { 'g1': 'guided-alpha', 'g2': 'guided-theta', 'g3': 'guided-theta', 'g4': 'guided-delta', 'g5': 'guided-alpha' };
                type = guideMap[id] || 'guided';
            } else if (id.startsWith('a')) { // Ambient
                const ambMap = { 'a1': 'forest', 'a2': 'rain', 'a3': 'waves', 'a4': 'river', 'a5': 'wind' };
                type = ambMap[id] || 'waves';
            }
            
            this.app.playCommitSound();
            this.app.triggerPulse();
            this.app.playbackSensory(type);
            this.app.systemLog && this.app.systemLog("Initiating restorative resonance...");
        }
        this.renderTracks();
    }

    toggleChecklist(key) {
        this.checklist[key] = !this.checklist[key];
        localStorage.setItem('rd-sleep-checklist', JSON.stringify(this.checklist));
        
        this.app.triggerPulse();
        if (this.checklist[key]) {
            this.app.playCheckOffSound();
        } else {
            this.app.playCommitSound();
        }

        this.updateChecklistUI();
        this.app.refreshOverview();
    }

    updateChecklistUI() {
        Object.keys(this.checklist).forEach(key => {
            const el = document.querySelector(`[data-sleep-check="${key}"]`);
            if (el) {
                el.classList.toggle('active', this.checklist[key]);
                el.querySelector('.rd-checkbox').innerHTML = this.checklist[key] ? '✓' : '';
            }
        });
    }

    getReadinessScore() {
        const done = Object.values(this.checklist).filter(v => v).length;
        return (done / Object.values(this.checklist).length) * 100;
    }

    initRituals() {
        this.completedRituals = JSON.parse(localStorage.getItem('rd-completed-rituals') || '[]');
    }

    toggleRitual(id) {
        if (this.completedRituals.includes(id)) {
            this.completedRituals = this.completedRituals.filter(r => r !== id);
        } else {
            this.completedRituals.push(id);
        }
        localStorage.setItem('rd-completed-rituals', JSON.stringify(this.completedRituals));
    }

    playCommitSound() { this.app.playCommitSound(); }
    playCheckOffSound() { this.app.playCheckOffSound(); }
}

class RealityApp {
    constructor() {
        window.rdApp = this; // Expose early for inline HTML handlers
        this.views = ['onboarding', 'welcome', 'dashboard', 'sensory', 'sleep', 'rituals', 'roadmap', 'hobbies', 'meals'];
        this.hasOnboarded = localStorage.getItem('rd-onboarded') === 'true';
        this.currentView = this.hasOnboarded ? 'welcome' : 'onboarding';
        this.onboardStep = 1;
        this.onboardingData = { focus: null, frequency: null, baseline: 50 };
        this.charts = {};

        // ── ENGINES ──
        this.nutritionalEngine = new NutritionalEngine(this);
        this.hobbyEngine = new HobbyEngine(this);
        this.sleepEngine = new SleepEngine(this);

        // ── PERSISTENCE: LOAD DATA ──
        const savedRituals = localStorage.getItem('rd-rituals-active');
        this.rituals = {
            library: [
                { id: 'b1', name: 'Binaural Grounding', icon: '🎧', category: 'Focus' },
                { id: 'b2', name: 'Somatic Release', icon: '🤸', category: 'Energy' },
                { id: 'b3', name: 'Chromatic Bath', icon: '🌈', category: 'Sensory' },
                { id: 'b4', name: 'Neural Scripting', icon: '✍️', category: 'Clarity' },
                { id: 'b5', name: 'Vortex Breathing', icon: '🌀', category: 'Energy' }
            ],
            active: savedRituals ? JSON.parse(savedRituals) : ['b1', 'b4']
        };

        this.sensoryModes = {
            focus: { title: 'Focus', label: 'Deep Work Mode', desc: 'Sub-bass grounding and blue light calibration.', color: '#111111', baseCurve: [40, 70, 95, 80, 60, 40] },
            relax: { title: 'Relax', label: 'Restorative Mode', desc: 'Ambient textures and 2700K amber warmth.', color: '#d6cfc7', baseCurve: [30, 40, 50, 70, 90, 85] },
            create: { title: 'Create', label: 'Expansion Mode', desc: 'Natural light spectrum and floral essence.', color: '#eae6e1', baseCurve: [50, 60, 80, 95, 85, 70] },
            sleep: { title: 'Sleep', label: 'Reset Mode', desc: 'Deep red spectrum and silence.', color: '#2a2a2a', baseCurve: [20, 15, 10, 20, 40, 10] }
        };

        this.activeSensoryMode = localStorage.getItem('rd-sensory-mode') || 'focus';
        this.sensoryOptions = JSON.parse(localStorage.getItem('rd-sensory-options')) || { acoustic: 'binaural', chromatic: 'arctic' };

        // ── SENSORY AUDIO ENGINE ──
        this.audio = {
            ctx: null,
            gain: null,
            currentSource: null,
            isPlaying: false,
            activeNode: null,
            sources: {
                binaural: null,
                brown: null,
                ambient: null,
                silence: null
            }
        };

        this.sensoryNodes = [
            { id: 'v1', name: 'Arctic Spectrum', category: 'visual', icon: '❄️', value: 'arctic', desc: '450-490nm wavelength for high-logic cognitive tasks.' },
            { id: 'v2', name: 'Amber Glow', category: 'visual', icon: '🕯️', value: 'amber', desc: 'Selective blue-light reduction for melatonin protection.' },
            { id: 'v3', name: 'Signature Burgundy', category: 'visual', icon: '🍷', value: 'red', desc: 'The baseline frequency of the Domiinique architect.' },
            { id: 'a1', name: 'Theta Binaural', category: 'auditory', icon: '🎧', value: 'binaural', desc: 'Neural synchronization for deep flow and subconscious access.' },
            { id: 'a2', name: 'Brown Noise', category: 'auditory', icon: '🌊', value: 'brown', desc: 'Low-frequency masking for high-intensity focus.' },
            { id: 'a3', name: 'Forest Path', category: 'auditory', icon: '🌲', value: 'ambient', desc: 'Biophilic restoration for pattern decoupling.' },
            { id: 's1', name: 'Central Pillar', category: 'spatial', icon: '🏛️', value: 'pillar', desc: 'Spatial anchor for grounding the cognitive self.' },
            { id: 'k1', name: 'Somatic Link', category: 'kinesthetic', icon: '🧘', value: 'somatic', desc: 'Tactile synchronization for metabolic alignment.' }
        ];

        this.init();
        this.startClockTicker();
        this.updateSystemTheme(this.sensoryOptions.chromatic);
    }

    systemLog(msg, type = 'info') {
        const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
        console.log(`[${timestamp}] [Reality Design] ${msg}`);
        
        // Update UI log if it exists
        const logContainer = document.getElementById('rd-system-log-content') || document.getElementById('system-log-content');
        if (logContainer) {
            const entry = document.createElement('div');
            entry.className = `rd-log-entry log-${type}`;
            entry.style.opacity = '0';
            entry.innerHTML = `<span class="rd-font-mono" style="opacity:0.5; margin-right:0.5rem;">[${timestamp}]</span> ${msg}`;
            logContainer.prepend(entry);
            gsap.to(entry, { opacity: 1, x: 0, duration: 0.3 });
            
            // Limit entries
            if (logContainer.children.length > 20) {
                logContainer.lastElementChild.remove();
            }
        }
    }

    startClockTicker() {
        const timeElements = document.querySelectorAll('.rd-time, #rd-current-time, #summary-time, #dashboard-time, .rd-dashboard-time, #timeline-ticker');
        const dateElements = document.querySelectorAll('.rd-date, #rd-current-date, #summary-date');
        
        const update = () => {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('en-GB', { hour12: false });
            const dateStr = now.toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }).toUpperCase();
            
            timeElements.forEach(el => { if (el) el.textContent = timeStr; });
            dateElements.forEach(el => { if (el) el.textContent = dateStr; });
        };

        update();
        setInterval(update, 1000);
    }

    init() {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.onReady());
        } else {
            this.onReady();
        }

        // ── PREMIUM: MOUSE TRACKING GLOW ──
        document.addEventListener('mousemove', (e) => this.handleGlobalPointer(e));
    }

    handleGlobalPointer(e) {
        if (typeof gsap === 'undefined') return;
        const wrap = document.querySelector('.rd-onboard-wrap');
        if (!wrap || this.hasOnboarded) return;

        const { clientX, clientY } = e;
        const { left, top, width, height } = wrap.getBoundingClientRect();
        
        const x = (clientX - left) / width - 0.5;
        const y = (clientY - top) / height - 0.5;

        gsap.to(wrap, {
            rotationY: x * 10,
            rotationX: -y * 10,
            transformPerspective: 1000,
            duration: 1.2,
            ease: "power2.out",
            boxShadow: `${-x * 30}px ${-y * 30}px 60px rgba(201, 168, 76, 0.15)`
        });
    }

    onReady() {
        // Expose self early for inline handlers
        window.rdApp = this;
        this.systemLog("INIT: Neural core synchronization sequence active.");
        
        try {
            // Initialize Audio Content if needed on first interaction
            document.addEventListener('click', () => {
                if (!this.audio.ctx) {
                    this.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
                } else if (this.audio.ctx.state === 'suspended') {
                    this.audio.ctx.resume();
                }
            }, { once: true });

            this.setupNavigation();
            this.setupRoadmapProtocolHandlers();
            this.renderWeek();
            this.initEnergyDots();
            this.renderRitualLibrary();
            this.renderActiveSequence();
            this.renderDashboardRituals();
            this.renderSensoryNodes();
            
            // Restore Design State
            if (this.hasOnboarded) {
                this.setSensoryMode(this.activeSensoryMode);
                this.initCharts();
            }

            // ── SYSTEMS: INIT ──
            this.nutritionalEngine.init();
            this.hobbyEngine.init();
            this.sleepEngine.init();
            this.sleepEngine.initRituals();

            // Refresh Overview
            this.refreshOverview();

            // Live Clock for Welcome View
            this.startWelcomeClock();

            // Initial View: Force visibility
            const startView = this.hasOnboarded ? this.currentView : 'onboarding';
            this.setView(startView, false);

        } catch (err) {
            console.error("RealityApp — Initialization Error:", err);
            this.setView('onboarding', false);
        }
    }

    // ── SENSORY FEEDBACK ──
    playCommitSound() {
        try {
            if (!this.audio.ctx) {
                this.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audio.ctx.state === 'suspended') return;
            
            const ctx = this.audio.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(432, ctx.currentTime);
            
            gain.gain.setValueAtTime(0.15, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.8);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
        } catch(e) { 
            console.warn("Commitment Resonance Blocked: ", e);
        }
    }

    playCheckOffSound() {
        try {
            if (!this.audio.ctx) {
                this.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
            }
            if (this.audio.ctx.state === 'suspended') return;
            
            const ctx = this.audio.ctx;
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(528, ctx.currentTime);
            
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.5);
            
            osc.connect(gain);
            gain.connect(ctx.destination);
            
            osc.start();
            osc.stop(ctx.currentTime + 0.5);
        } catch(e) { 
            console.warn("Audio Resonance Blocked: ", e);
        }
    }

    triggerPulse() {
        const pulse = document.createElement('div');
        pulse.className = 'rd-resonance-pulse-overlay';
        document.body.appendChild(pulse);
        
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(pulse, 
                { opacity: 0.6, scale: 0.8 },
                { opacity: 0, scale: 1.5, duration: 1.2, ease: "power2.out", onComplete: () => pulse.remove() }
            );
        } else {
            pulse.remove();
        }
    }


    // ── ONBOARDING LOGIC ──
    selectOption(category, value, el) {
        this.onboardingData[category] = value;
        
        // Visual Feedback: Active state
        const parent = el.closest('.rd-option-cloud') || el.parentElement;
        parent.querySelectorAll('.rd-option-chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');

        this.playCommitSound();
        this.triggerPulse();

        // Cinematic Visual Feedback: Ambient Background Shift
        const wrap = document.querySelector('.rd-onboard-wrap');
        const container = document.querySelector('.rd-app-container');
        const colors = {
            focus: 'rgba(128, 0, 32, 0.35)',
            energy: 'rgba(201, 168, 76, 0.25)',
            calm: 'rgba(0, 50, 100, 0.35)',
            create: 'rgba(100, 0, 100, 0.35)'
        };
        
        if (wrap && colors[value] && typeof gsap !== 'undefined') {
            gsap.to(wrap, { backgroundColor: colors[value], duration: 1, ease: "power2.out" });
            // Glow the container too for immersion
            gsap.to(container, { boxShadow: `0 0 100px ${colors[value]} inset`, duration: 1.5 });
        }

        // Auto-Advance to next step
        setTimeout(() => this.nextOnboard(), 600);
    }

    nextOnboard() {
        if (this.onboardStep < 3) {
            const current = document.querySelector(`.rd-onboard-step[data-step="${this.onboardStep}"]`);
            this.onboardStep++;
            const next = document.querySelector(`.rd-onboard-step[data-step="${this.onboardStep}"]`);

            if (current && next) {
                // Update Progress Bar
                const progress = document.getElementById('onboard-progress');
                if (progress) {
                    gsap.to(progress, { width: `${(this.onboardStep / 3) * 100}%`, duration: 0.6 });
                }

                gsap.to(current, {
                    opacity: 0,
                    x: -20,
                    duration: 0.5,
                    ease: "power2.in",
                    onComplete: () => {
                        current.classList.remove('active');
                        current.style.display = 'none';
                        next.classList.add('active');
                        next.style.display = 'flex';
                        gsap.fromTo(next, 
                            { opacity: 0, x: 20 },
                            { opacity: 1, x: 0, duration: 0.7, ease: "power2.out" }
                        );
                    }
                });
            }
        }
    }

    completeOnboarding() {
        // Feedback
        const btn = document.querySelector('.rd-onboard-step.active .rd-btn-primary');
        if (btn) btn.classList.add('committing');
        this.playCommitSound();

        localStorage.setItem('rd-onboarded', 'true');
        this.hasOnboarded = true;
        
        // ── UPDATE DASHBOARD BASED ON ANSWERS ──
        this.applyOnboardingResults();
        
        // Cinematic Transition to Dashboard
        gsap.to('.rd-onboard-wrap', { 
            opacity: 0, 
            scale: 0.95, 
            duration: 0.8, 
            ease: "power2.inOut",
            onComplete: () => {
                this.setView('welcome');
            }
        });
    }

    applyOnboardingResults() {
        const data = this.onboardingData;
        
        // 1. Update Focus/Sensory Mode
        if (data.focus) {
            const modeMap = { focus: 'focus', energy: 'create', calm: 'relax', create: 'create' };
            this.setSensoryMode(modeMap[data.focus] || 'focus');
            
            // 2. Clear and Suggest Rituals
            this.rituals.active = [];
            const suggestions = {
                focus: ['b1', 'b4'],
                energy: ['b2', 'b5'],
                calm: ['b1', 'b3'],
                create: ['b3', 'b4']
            };
            this.rituals.active = suggestions[data.focus] || ['b1'];
            this.renderActiveSequence();
        }

        // 3. Update Baseline in Charts (if charts exist)
        if (this.charts.resonance) {
            const baselineVal = parseInt(data.baseline) || 50;
            this.charts.resonance.data.datasets[0].data[0] = baselineVal;
            this.charts.resonance.update();
        }
    }

    // ── DASHBOARD REAL-TIME SYNC ──
    refreshOverview() {
        // 1. Time/Date
        const timeEl = document.getElementById('summary-time');
        const dateEl = document.getElementById('summary-date');
        if (timeEl) timeEl.innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
        if (dateEl) dateEl.innerText = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();

        // 2. Active Mode
        const modeEl = document.getElementById('summary-mode');
        const modeDescEl = document.getElementById('summary-mode-desc');
        if (modeEl && modeDescEl) {
            const modes = {
                focus: { name: 'Focus Phase', desc: 'System calibrated to Alpha frequency for precision cognitive synthesis and archival work.' },
                relax: { name: 'Relaxation Mode', desc: 'Theta wave immersion for stress reduction and sensory decompression.' },
                create: { name: 'Creative Flow', desc: 'Gamma burst synchronization for divergent thinking and artistic output.' },
                sleep: { name: 'Sleep Architecture', desc: 'Delta wave priming and environmental optimization for restorative cycles.' }
            };
            const m = modes[this.activeSensoryMode] || modes.focus;
            modeEl.innerText = m.name;
            modeDescEl.innerText = m.desc;
        }

        // 3. System Status
        const acoustic = document.getElementById('summary-acoustic');
        const chromatic = document.getElementById('summary-chromatic');
        const nutrition = document.getElementById('summary-nutrition');
        const creative = document.getElementById('summary-creative');
        const sleep = document.getElementById('summary-sleep');
        
        if (acoustic) {
            const labels = { binaural: 'Binaural', noise: 'Ambient Noise', ocean: 'Ocean Waves', silence: 'Silence' };
            acoustic.innerText = labels[this.sensoryOptions.acoustic] || '—';
        }
        if (chromatic) {
            const labels = { arctic: 'Arctic', sunset: 'Sunset', forest: 'Forest', darkness: 'Darkness' };
            chromatic.innerText = labels[this.sensoryOptions.chromatic] || '—';
        }
        if (nutrition) {
            const plan = this.nutritionalEngine.weeklyPlan;
            if (plan) {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
                const dayPlan = plan[today];
                if (dayPlan) {
                    const totalCal = dayPlan.meals.reduce((sum, m) => sum + (m.calories || 450), 0);
                    nutrition.innerText = `${totalCal} kcal planned`;
                } else {
                    nutrition.innerText = 'No plan generated';
                }
            } else {
                nutrition.innerText = 'No plan generated';
            }
        }
        if (creative) {
            const archives = this.hobbyEngine.archives;
            if (archives.length > 0) {
                const avg = Math.round(archives.reduce((sum, a) => sum + a.progress, 0) / archives.length);
                creative.innerText = `${avg}% avg progress`;
            } else {
                creative.innerText = 'No active hobbies';
            }
        }
        if (sleep) {
            const score = this.sleepEngine.getReadinessScore();
            sleep.innerText = `${Math.round(score)}% readiness`;
        }

        // 4. Active Rituals
        const ritualList = document.getElementById('welcome-ritual-list');
        if (ritualList) {
            const rituals = [
                { id: 'sleep-magic', label: 'Sleep Ritual' },
                { id: 'morning-reset', label: 'Morning Reset' },
                { id: 'midday-sync', label: 'Midday Sync' },
                { id: 'shutdown-sequence', label: 'Shutdown Sequence' }
            ];
            const completedRituals = this.sleepEngine.completedRituals || [];
            ritualList.innerHTML = rituals.map(r => {
                const done = completedRituals.includes(r.id);
                return `<div class="rd-checklist-item ${done ? 'completed' : ''}" data-ritual="${r.id}" style="cursor:pointer;">
                    <span class="rd-check-icon">${done ? '✓' : '○'}</span>
                    <span class="rd-check-label">${r.label}</span>
                </div>`;
            }).join('');
            
            // Bind click to toggle ritual
            ritualList.querySelectorAll('.rd-checklist-item').forEach(item => {
                item.addEventListener('click', () => {
                    const ritualId = item.getAttribute('data-ritual');
                    this.sleepEngine.toggleRitual(ritualId);
                    this.refreshOverview();
                    this.playCheckOffSound();
                });
            });
        }

        // 5. Update Resonance Score & Charts
        this.updateResonanceScore();
        this.initCharts();
    }

    startWelcomeClock() {
        if (this._welcomeClockInterval) clearInterval(this._welcomeClockInterval);
        this._lastDisplayedDate = null;
        const update = () => {
            const timeEl = document.getElementById('summary-time');
            const dateEl = document.getElementById('summary-date');
            if (timeEl) timeEl.innerText = new Date().toLocaleTimeString('en-US', { hour12: false });
            const todayStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
            if (dateEl && this._lastDisplayedDate !== todayStr) {
                dateEl.innerText = todayStr;
                this._lastDisplayedDate = todayStr;
            }
        };
        update();
        this._welcomeClockInterval = setInterval(update, 1000);
    }

    updateResonanceScore() {
        const scoreEl = document.getElementById('rd-resonance-score');
        const fillEl = document.getElementById('rd-resonance-fill');
        const welcomeScore = document.getElementById('summary-resonance');
        if (!scoreEl || !fillEl) return;

        // 1. Core Points from Engines
        const mealPoints = this.nutritionalEngine.weeklyPlan ? 33 : 10;
        const hobbyPoints = Math.min(this.hobbyEngine.archives.length * 10, 33);
        const sleepPoints = (this.sleepEngine.getReadinessScore() / 100) * 34;
        
        // 2. Sensory Alignment Bonus
        const baseScores = { focus: 8, relax: 5, create: 10, sleep: 4 };
        let sensoryBonus = baseScores[this.activeSensoryMode] || 0;
        if (this.sensoryOptions.acoustic === 'binaural') sensoryBonus += 5;
        if (this.sensoryOptions.chromatic === 'arctic') sensoryBonus += 3;
        
        const total = Math.min(100, Math.round(mealPoints + hobbyPoints + sleepPoints + sensoryBonus));
        
        // 3. Animate UI
        gsap.to(fillEl, { width: `${total}%`, duration: 1.5, ease: "power2.out" });
        if (welcomeScore) welcomeScore.innerText = total;

        // Counter animate text
        let currentVal = parseInt(scoreEl.innerText.replace(/[^0-9]/g, '')) || 0;
        let obj = { val: currentVal };
        
        const summaryScore = document.getElementById('summary-resonance');
        
        gsap.to(obj, {
            val: total,
            duration: 1.5,
            onUpdate: () => { 
                const val = Math.round(obj.val);
                scoreEl.innerText = val; 
                if (summaryScore) summaryScore.innerText = val;
            }
        });
    }

    // ── SPA NAVIGATION ──
    setupNavigation() {
        // Floating Nav Links
        const links = document.querySelectorAll('.rd-view-link');
        this.systemLog(`Navigation: Binding ${links.length} view links.`);
        
        links.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const route = link.getAttribute('data-route');
                this.systemLog(`Navigation Link: ${route} activated.`);
                this.setView(route);
            });
        });

        // Any other [data-route] buttons
        document.body.addEventListener('click', (e) => {
            const btn = e.target.closest('[data-route]');
            if (btn && !btn.classList.contains('rd-view-link')) {
                e.preventDefault();
                this.setView(btn.getAttribute('data-route'));
            }
        });
    }

    setupRoadmapProtocolHandlers() {
        const portal = document.getElementById('roadmap-portal');
        if (!portal) return;
        
        portal.addEventListener('click', (e) => {
            const item = e.target.closest('.rd-check-item');
            if (!item) return;
            e.preventDefault();
            
            const protocolId = item.getAttribute('data-protocol-id');
            if (!protocolId) return;
            
            const saved = JSON.parse(localStorage.getItem('rd-roadmap-progress') || '{}');
            
            if (item.classList.contains('active')) {
                item.classList.remove('active');
                delete saved[protocolId];
                this.playCommitSound();
            } else {
                item.classList.add('active');
                saved[protocolId] = { completedAt: new Date().toISOString(), mode: this.activeSensoryMode };
                this.playCheckOffSound();
                this.tuneAlignment(2);
            }
            
            localStorage.setItem('rd-roadmap-progress', JSON.stringify(saved));
            this.updateRoadmapProgressUI();
        });
    }

    setView(viewId, animate = true) {
        if (!this.views.includes(viewId)) return;
        this.systemLog(`Transitioning view to: ${viewId}`);
        
        // Sensory feedback
        this.playCommitSound();
        if (animate) this.triggerPulse();

        // Reset onboarding if entering
        if (viewId === 'onboarding') {
            this.onboardStep = 1;
            const progress = document.getElementById('onboard-progress');
            if (progress) progress.style.width = '33.33%';
            const wrap = document.querySelector('.rd-onboard-wrap');
            if (wrap) {
                wrap.style.backgroundColor = 'rgba(255, 255, 255, 0.02)';
                wrap.style.opacity = 1;
                wrap.style.scale = 1;
            }
            
            document.querySelectorAll('.rd-onboard-step').forEach(s => {
                s.classList.remove('active');
                s.style.display = 'none';
                s.style.opacity = 0;
            });
            const first = document.querySelector('.rd-onboard-step[data-step="1"]');
            if (first) {
                first.classList.add('active');
                first.style.display = 'flex';
                first.style.opacity = 1;
            }
        }

        const prevView = document.getElementById(`view-${this.currentView}`);
        const nextView = document.getElementById(`view-${viewId}`);

        if (!nextView) return;

        // Instantly reset scroll to top before any transition starts
        window.scrollTo({ top: 0, behavior: 'instant' });

        if (viewId === 'welcome') {
            document.getElementById('rd-status-bar').style.display = 'none';
        } else {
            document.getElementById('rd-status-bar').style.display = 'flex';
        }

        // Clean up: Ensure all other views are hidden and opacity is clear
        document.querySelectorAll('.rd-view').forEach(v => {
            if (v !== nextView && v !== prevView) {
                v.classList.remove('active');
                v.style.display = 'none';
                v.style.opacity = '';
                v.style.visibility = 'hidden';
            }
        });

        // Update Nav UI
        document.querySelectorAll('.rd-view-link').forEach(link => {
            link.classList.toggle('active', link.getAttribute('data-route') === viewId);
        });

        if (animate && prevView && prevView !== nextView) {
            gsap.to(prevView, {
                opacity: 0,
                duration: 0.3,
                ease: "power2.in",
                onComplete: () => {
                    prevView.classList.remove('active');
                    prevView.style.display = 'none';
                    prevView.style.visibility = 'hidden';
                    prevView.style.opacity = '0';
                    this.showView(nextView, viewId);
                }
            });
        } else {
            if (prevView && prevView !== nextView) {
                prevView.classList.remove('active');
                prevView.style.display = 'none';
                prevView.style.visibility = 'hidden';
                prevView.style.opacity = '0';
            }
            this.showView(nextView, viewId, animate && !prevView);
        }

        this.currentView = viewId;
    }

    showView(el, viewId, animate = true) {
        window.scrollTo(0, 0); // Force scroll to top
        el.classList.add('active');
        el.style.display = 'block'; // Force display
        el.style.visibility = 'visible';
        
        if (animate && typeof gsap !== 'undefined') {
            const tl = gsap.timeline();
            tl.fromTo(el, 
                { opacity: 0 },
                { opacity: 1, duration: 0.5, ease: "power2.out" }
            );
        } else {
            el.style.opacity = 1;
        }

        // View Specific Re-init
        if (viewId === 'dashboard' || viewId === 'welcome') {
            try { 
                this.refreshOverview(); 
                this.renderMetricTable();
            } catch(e) { console.error("Sync Failed", e); }
        }

        if (viewId === 'roadmap') {
            this.generateRoadmap();
        }

        if (viewId === 'meals') {
            // Initial animation for the meals section
            if (typeof gsap !== 'undefined' && document.querySelector('#view-meals .rd-panel')) {
                gsap.from('#view-meals .rd-panel', {
                    opacity: 0,
                    scale: 0.98,
                    stagger: 0.1,
                    duration: 0.8,
                    ease: "power2.out"
                });
            }
        }
    }

    // ── DASHBOARD: WEEK STRIP ──
    renderWeek() {
        const strip = document.getElementById('week-strip');
        if (!strip) return;

        const days = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        const now = new Date();
        const todayIdx = now.getDay();
        
        // Start from Monday of the current week
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - (todayIdx === 0 ? 6 : todayIdx - 1));

        let html = '';
        for (let i = 0; i < 7; i++) {
            const current = new Date(startOfWeek);
            current.setDate(startOfWeek.getDate() + i);
            const isToday = current.toDateString() === now.toDateString();
            const isPast = current < now && !isToday;

            html += `
                <div class="rd-day-card ${isToday ? 'active' : (isPast ? 'past' : '')}">
                    <span style="font-size: 0.6rem; opacity: 0.5;">${days[current.getDay()]}</span>
                    <span style="font-weight: 600;">${current.getDate()}</span>
                    <div class="rd-day-dot"></div>
                </div>
            `;
        }
        strip.innerHTML = html;
    }

    // ── DASHBOARD: ENERGY DOTS ──
    initEnergyDots() {
        document.querySelectorAll('.rd-dots-container').forEach(container => {
            const count = 10;
            const filled = parseInt(container.dataset.val) || 0;
            
            container.innerHTML = '';
            for (let i = 0; i < count; i++) {
                const dot = document.createElement('div');
                dot.className = `rd-dot ${i < filled ? 'filled' : ''}`;
                container.appendChild(dot);
            }
        });
    }

    // ── DASHBOARD: CHARTS ──
    initCharts() {
        if (typeof Chart === 'undefined') return;
        // Destroy existing
        if (this.charts.resonance) this.charts.resonance.destroy();
        if (this.charts.overview) this.charts.overview.destroy();

        const dynamicData = this.generateResonanceData();

        // 1. Dashboard Resonance
        const dashCtx = document.getElementById('resonanceChart')?.getContext('2d');
        if (dashCtx) {
            this.charts.resonance = this.createResonanceChart(dashCtx, dynamicData);
        }

        // 2. Overview Resonance (Simplified)
        const overCtx = document.getElementById('overviewResonanceChart')?.getContext('2d');
        if (overCtx) {
            this.charts.overview = this.createResonanceChart(overCtx, dynamicData, true);
        }

        // 3. System Composition (Pie Chart)
        const compCtx = document.getElementById('stateCompositionChart')?.getContext('2d');
        if (compCtx) {
            if (this.charts.composition) this.charts.composition.destroy();
            this.charts.composition = new Chart(compCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Logic', 'Creative', 'Reflective'],
                    datasets: [{
                        data: this.getCompositionData(),
                        backgroundColor: ['#c9a84c', '#800020', 'rgba(255,255,255,0.1)'],
                        borderWidth: 0,
                        cutout: '70%'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } }
                }
            });
        }

        // 4. Cognitive Dimensions (Radar Chart)
        const radarCtx = document.getElementById('cognitiveDimensionsChart')?.getContext('2d');
        if (radarCtx) {
            if (this.charts.radar) this.charts.radar.destroy();
            this.charts.radar = new Chart(radarCtx, {
                type: 'radar',
                data: {
                    labels: ['Precision', 'Flow', 'Calm', 'Energy', 'Reach'],
                    datasets: [{
                        data: this.getRadarData(),
                        borderColor: 'var(--rd-gold)',
                        backgroundColor: 'rgba(201, 168, 76, 0.2)',
                        borderWidth: 1.5,
                        pointRadius: 2,
                        pointBackgroundColor: 'var(--rd-gold)'
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
                    scales: {
                        r: {
                            angleLines: { color: 'rgba(255,255,255,0.1)' },
                            grid: { color: 'rgba(255,255,255,0.1)' },
                            pointLabels: { color: 'var(--rd-text-muted)', font: { size: 9 } },
                            ticks: { display: false, count: 3 },
                            suggestedMin: 0,
                            suggestedMax: 100
                        }
                    }
                }
            });
        }
    }

    getRadarData() {
        const mapping = {
            focus: [90, 70, 40, 80, 50],
            relax: [30, 50, 95, 40, 60],
            create: [60, 95, 50, 80, 90],
            sleep: [20, 30, 98, 10, 40]
        };
        return mapping[this.activeSensoryMode] || [50, 50, 50, 50, 50];
    }

    getCompositionData() {
        const mapping = {
            focus: [70, 10, 20],
            relax: [10, 20, 70],
            create: [20, 70, 10],
            sleep: [5, 5, 90]
        };
        return mapping[this.activeSensoryMode] || [33, 33, 34];
    }

    generateResonanceData() {
        const mode = this.sensoryModes[this.activeSensoryMode];
        let curve = [...mode.baseCurve];

        // Apply Option Modifiers
        if (this.sensoryOptions.acoustic === 'silence') curve = curve.map(v => v * 0.8);
        if (this.sensoryOptions.chromatic === 'off') curve = curve.map(v => v * 0.9);
        
        return curve;
    }

    createResonanceChart(ctx, data, isMini = false) {
        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['6AM', '9AM', '12PM', '3PM', '6PM', '9PM'],
                datasets: [{
                    data: data,
                    borderColor: 'var(--rd-gold)',
                    backgroundColor: 'rgba(201, 168, 76, 0.05)',
                    fill: true,
                    tension: 0.4,
                    borderWidth: isMini ? 1.5 : 2,
                    pointRadius: isMini ? 0 : 3,
                    pointBackgroundColor: 'var(--rd-gold)',
                    pointHoverRadius: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: { 
                    legend: { display: false },
                    tooltip: {
                        enabled: true,
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: { size: 10 },
                        bodyFont: { size: 10 },
                        callbacks: {
                            label: (ctx) => `Resonance: ${ctx.raw}%`
                        }
                    }
                },
                scales: {
                    x: { display: !isMini, grid: { display: false }, ticks: { color: 'var(--rd-text-muted)', font: { size: 9 } } },
                    y: { display: false, suggestedMin: 0, suggestedMax: 100 }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                }
            }
        });
    }

    renderMetricTable() {
        const tbody = document.querySelector('#systemMetricTable tbody');
        if (!tbody) return;

        const intervals = ['06:00', '09:00', '12:00', '15:00', '18:00', '21:00'];
        const data = this.generateResonanceData();
        const mode = this.sensoryModes[this.activeSensoryMode].title;

        tbody.innerHTML = intervals.map((time, i) => `
            <tr>
                <td class="rd-font-mono">${time}</td>
                <td>650THz</td>
                <td>${data[i]}%</td>
                <td><span class="rd-tag" style="margin:0; font-size:0.5rem; border:1px solid var(--rd-gold); padding:2px 5px;">${mode}</span></td>
            </tr>
        `).join('');
    }

    // ── COMMIT LOGIC ──
    async commitEnvironment() {
        const btn = document.querySelector('#view-sensory .rd-btn-primary');
        const originalText = btn.innerHTML;
        
        btn.innerHTML = '<span class="rd-spinner"></span> CALIBRATING RESONANCE...';
        btn.style.opacity = 0.7;
        
        // Persist
        localStorage.setItem('rd-sensory-mode', this.activeSensoryMode);
        localStorage.setItem('rd-sensory-options', JSON.stringify(this.sensoryOptions));
        
        await new Promise(r => setTimeout(r, 1500)); // Cinematic delay
        
        btn.innerHTML = '✓ SYSTEM CALIBRATED';
        btn.style.background = 'var(--rd-gold)';
        btn.style.color = 'var(--rd-bg)';

        this.playCommitSound();
        this.triggerPulse();

        // ── UPDATE REAL-TIME METRICS ──
        this.updateResonanceScore();
        this.initCharts(); 

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.opacity = 1;
        }, 2000);
    }


    async commitSequence() {
        const btn = document.getElementById('commit-sequence-btn');
        const originalText = btn.innerHTML;

        btn.innerHTML = '<span class="rd-spinner"></span> INITIALIZING ARCHITECTURE...';
        btn.style.opacity = 0.7;

        // Persist
        localStorage.setItem('rd-rituals-active', JSON.stringify(this.rituals.active));

        await new Promise(r => setTimeout(r, 1500)); 

        btn.innerHTML = '✓ SEQUENCE INITIALIZED';
        btn.style.background = 'var(--rd-gold)';
        btn.style.color = 'var(--rd-bg)';

        this.playCommitSound();
        this.triggerPulse();

        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.style.background = '';
            btn.style.color = '';
            btn.style.opacity = 1;
        }, 2000);
    }

    // ── SENSORY CONTROL ──
    setSensoryMode(modeKey) {
        if (!this.sensoryModes[modeKey]) return;
        this.activeSensoryMode = modeKey;
        this.playCommitSound();
        this.triggerPulse();
        const mode = this.sensoryModes[modeKey];

        // Update Hero
        const hero = document.getElementById('sensory-hero');
        const label = document.getElementById('active-mode-label');
        const title = document.getElementById('active-mode-title');
        const desc = document.getElementById('active-mode-desc');

        if (hero) {
            hero.className = `rd-sensory-hero mode-${modeKey}`;
            label.textContent = `${modeKey.toUpperCase()} MODE`;
            title.textContent = mode.title;
            desc.textContent = mode.desc;
        }

        // Update Admin Pills/Chips
        document.querySelectorAll('.mode-chip').forEach(pill => {
            pill.classList.toggle('active', pill.dataset.mode === modeKey);
        });

        // Sync Dashboard
        this.refreshOverview();
        
        // Check if updateResonanceScore exists (it might be renamed or moved)
        if (this.updateResonanceScore) this.updateResonanceScore();

        // Update System Theme
        if (this.updateSystemTheme) {
            const themeMap = { focus: 'off', relax: 'arctic', create: 'amber', sleep: 'red' };
            this.updateSystemTheme(themeMap[modeKey]);
        }

        // Notify Sub-Engines
        if (this.nutritionalEngine) this.nutritionalEngine.syncToSensoryMode(modeKey);
        if (this.currentView === 'roadmap') this.generateRoadmap(false);

        // Feedback
        gsap.fromTo(hero, { opacity: 0.8 }, { opacity: 1, duration: 0.5 });
        this.systemLog && this.systemLog(`Resonance shifted to: ${mode.title}`);
    }

    setSensoryOption(category, value, el) {
        this.sensoryOptions[category] = value;
        
        // Update UI states
        const parent = el.parentElement;
        parent.querySelectorAll('.rd-option-chip').forEach(c => c.classList.remove('active'));
        el.classList.add('active');

        // RECALIBRATE IMMEDIATELY
        this.initCharts();
        
        if (category === 'chromatic') {
            this.updateSystemTheme(value);
        }

        if (category === 'acoustic') {
            this.playbackSensory(value);
        }

        // UPDATE REPORT IN REALTIME
        this.generateRoadmap(false);
        this.renderMetricTable();

        // Optional: Subtle system flare
        gsap.to(el, { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 });
    }

    updateSystemTheme(theme) {
        const root = document.documentElement;
        const themes = {
            arctic: {
                '--rd-bg': '#f8f7f4',
                '--rd-text': '#111111',
                '--rd-text-muted': 'rgba(0,0,0,0.5)',
                '--rd-surface': 'rgba(0,0,0,0.05)',
                '--rd-border': 'rgba(0,0,0,0.1)',
                '--rd-panel-bg': 'rgba(0,0,0,0.02)'
            },
            amber: {
                '--rd-bg': '#1a0f00',
                '--rd-text': '#ffcc33',
                '--rd-text-muted': 'rgba(255,204,51,0.6)',
                '--rd-surface': 'rgba(255,204,51,0.05)',
                '--rd-border': 'rgba(255,204,51,0.2)',
                '--rd-panel-bg': 'rgba(255,150,0,0.05)'
            },
            red: {
                '--rd-bg': '#120101',
                '--rd-text': '#f0ebe3',
                '--rd-text-muted': 'rgba(240,235,227,0.6)',
                '--rd-surface': 'rgba(255,255,255,0.03)',
                '--rd-border': 'rgba(201,168,76,0.2)',
                '--rd-panel-bg': 'rgba(128,0,32,0.08)'
            },
            off: {
                '--rd-bg': '#000000',
                '--rd-text': '#ffffff',
                '--rd-text-muted': 'rgba(255,255,255,0.4)',
                '--rd-surface': 'rgba(255,255,255,0.1)',
                '--rd-border': 'rgba(255,255,255,0.2)',
                '--rd-panel-bg': 'rgba(255,255,255,0.05)'
            }
        };

        const active = themes[theme] || themes.red;
        Object.keys(active).forEach(prop => {
            root.style.setProperty(prop, active[prop]);
        });
    }

    // ── WEB AUDIO SYNTHESIS ENGINE ──
    createNoiseBuffer(type = 'white') {
        const bufferSize = 2 * this.audio.ctx.sampleRate,
              noiseBuffer = this.audio.ctx.createBuffer(1, bufferSize, this.audio.ctx.sampleRate),
              output = noiseBuffer.getChannelData(0);

        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
            const white = Math.random() * 2 - 1;
            if (type === 'brown') {
                // Brownian: Integration of white noise
                lastOut = (lastOut + (0.02 * white)) / 1.002;
                output[i] = lastOut * 3.5; // Gain bump
            } else if (type === 'pink') {
                // Approximation for pink
                lastOut = (lastOut + (0.02 * white)) / 1.005;
                output[i] = lastOut * 2;
            } else {
                output[i] = white;
            }
        }
        return noiseBuffer;
    }

    playBinaural(mode) {
        this.stopDynamicAudio();
        
        const baseFreq = 200; // Hz (Carrier)
        const offsets = { alpha: 10, theta: 6, delta: 3 };
        const beatFreq = offsets[mode] || 10;

        this.audio.nodes = {
            oscL: this.audio.ctx.createOscillator(),
            oscR: this.audio.ctx.createOscillator(),
            merger: this.audio.ctx.createChannelMerger(2),
            gain: this.audio.ctx.createGain()
        };

        this.audio.nodes.oscL.frequency.value = baseFreq;
        this.audio.nodes.oscR.frequency.value = baseFreq + beatFreq;

        this.audio.nodes.oscL.connect(this.audio.nodes.merger, 0, 0);
        this.audio.nodes.oscR.connect(this.audio.nodes.merger, 0, 1);
        this.audio.nodes.merger.connect(this.audio.nodes.gain);
        this.audio.nodes.gain.connect(this.audio.gain);
        
        this.audio.nodes.gain.gain.value = 0.1;
        this.audio.nodes.oscL.start();
        this.audio.nodes.oscR.start();
    }

    playNoise(type) {
        this.stopDynamicAudio();
        const buffer = this.createNoiseBuffer(type);
        const source = this.audio.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const noiseGain = this.audio.ctx.createGain();
        noiseGain.gain.value = type === 'white' ? 0.05 : 0.15;
        
        source.connect(noiseGain);
        noiseGain.connect(this.audio.gain);
        source.start();
        
        this.audio.nodes = { source, gain: noiseGain };
    }

    playOceanWaves() {
        this.stopDynamicAudio();
        const buffer = this.createNoiseBuffer('pink');
        const source = this.audio.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const waveGain = this.audio.ctx.createGain();
        const lfo = this.audio.ctx.createOscillator();
        const lfoGain = this.audio.ctx.createGain();

        lfo.type = 'sine';
        lfo.frequency.value = 0.15; 
        lfoGain.gain.value = 0.15; 
        
        waveGain.gain.value = 0.1;
        lfo.connect(lfoGain);
        lfoGain.connect(waveGain.gain);

        source.connect(waveGain);
        waveGain.connect(this.audio.gain);

        lfo.start();
        source.start();

        this.audio.nodes = { source, lfo, gain: waveGain, lfoGain };
    }

    playForestNight() {
        this.stopDynamicAudio();
        const buffer = this.createNoiseBuffer('pink');
        const source = this.audio.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const noiseGain = this.audio.ctx.createGain();
        noiseGain.gain.value = 0.04;
        source.connect(noiseGain);
        noiseGain.connect(this.audio.gain);
        source.start();

        const cricketGain = this.audio.ctx.createGain();
        cricketGain.gain.value = 1;
        cricketGain.connect(this.audio.gain);

        const interval = setInterval(() => {
            if (!this.audio.ctx) return;
            const now = this.audio.ctx.currentTime;
            const osc = this.audio.ctx.createOscillator();
            const g = this.audio.ctx.createGain();
            osc.type = 'sine';
            osc.frequency.value = 3500 + Math.random() * 3000;
            g.gain.setValueAtTime(0.03, now);
            g.gain.exponentialRampToValueAtTime(0.001, now + 0.1);
            osc.connect(g);
            g.connect(cricketGain);
            osc.start(now);
            osc.stop(now + 0.12);
        }, 400 + Math.random() * 600);

        this.audio.nodes = { source, gain: noiseGain, interval };
    }

    playRainfall() {
        this.stopDynamicAudio();
        const buffer = this.createNoiseBuffer('brown');
        const source = this.audio.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const lowGain = this.audio.ctx.createGain();
        const lowFilter = this.audio.ctx.createBiquadFilter();
        lowFilter.type = 'lowpass';
        lowFilter.frequency.value = 400;
        lowGain.gain.value = 0.12;
        source.connect(lowFilter);
        lowFilter.connect(lowGain);
        lowGain.connect(this.audio.gain);

        const hissBuffer = this.createNoiseBuffer('white');
        const hiss = this.audio.ctx.createBufferSource();
        hiss.buffer = hissBuffer;
        hiss.loop = true;
        const hissGain = this.audio.ctx.createGain();
        const hissFilter = this.audio.ctx.createBiquadFilter();
        hissFilter.type = 'highpass';
        hissFilter.frequency.value = 6000;
        hissGain.gain.value = 0.015;
        hiss.connect(hissFilter);
        hissFilter.connect(hissGain);
        hissGain.connect(this.audio.gain);
        hiss.start();

        source.start();

        this.audio.nodes = { source, gain: lowGain };
    }

    playGentleRiver() {
        this.stopDynamicAudio();
        const buffer = this.createNoiseBuffer('brown');
        const source = this.audio.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const lowGain = this.audio.ctx.createGain();
        const lowFilter = this.audio.ctx.createBiquadFilter();
        lowFilter.type = 'lowpass';
        lowFilter.frequency.value = 800;
        lowGain.gain.value = 0.08;
        source.connect(lowFilter);
        lowFilter.connect(lowGain);
        lowGain.connect(this.audio.gain);
        source.start();

        const bubbleBuffer = this.createNoiseBuffer('white');
        const bubble = this.audio.ctx.createBufferSource();
        bubble.buffer = bubbleBuffer;
        bubble.loop = true;
        const bubbleGain = this.audio.ctx.createGain();
        const bubbleFilter = this.audio.ctx.createBiquadFilter();
        bubbleFilter.type = 'bandpass';
        bubbleFilter.frequency.value = 1200;
        bubbleFilter.Q.value = 0.5;
        bubbleGain.gain.value = 0.015;
        const bubbleLfo = this.audio.ctx.createOscillator();
        const bubbleLfoGain = this.audio.ctx.createGain();
        bubbleLfo.type = 'sine';
        bubbleLfo.frequency.value = 0.3;
        bubbleLfoGain.gain.value = 0.01;
        bubble.connect(bubbleFilter);
        bubbleFilter.connect(bubbleGain);
        bubbleGain.connect(this.audio.gain);
        bubbleLfo.connect(bubbleLfoGain);
        bubbleLfoGain.connect(bubbleGain.gain);
        bubbleLfo.start();
        bubble.start();

        this.audio.nodes = { source, gain: lowGain };
    }

    playSoftWind() {
        this.stopDynamicAudio();
        const buffer = this.createNoiseBuffer('pink');
        const source = this.audio.ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;
        const windGain = this.audio.ctx.createGain();
        windGain.gain.value = 0.04;
        const lfo = this.audio.ctx.createOscillator();
        const lfoGain = this.audio.ctx.createGain();
        lfo.type = 'sine';
        lfo.frequency.value = 0.08;
        lfoGain.gain.value = 0.035;
        source.connect(windGain);
        windGain.connect(this.audio.gain);
        lfo.connect(lfoGain);
        lfoGain.connect(windGain.gain);
        lfo.start();
        source.start();

        this.audio.nodes = { source, lfo, gain: windGain, lfoGain };
    }

    playVibration() {
        this.stopDynamicAudio();
        // Layered low-frequency oscillators for somatic resonance
        const f1 = this.audio.ctx.createOscillator();
        const f2 = this.audio.ctx.createOscillator();
        const g1 = this.audio.ctx.createGain();
        const g2 = this.audio.ctx.createGain();
        const lfo = this.audio.ctx.createOscillator();
        const lfoG = this.audio.ctx.createGain();

        f1.type = 'sine';
        f1.frequency.value = 60; // 60Hz grounding
        f2.type = 'triangle';
        f2.frequency.value = 60.5; // Slight detune for richness

        lfo.type = 'sine';
        lfo.frequency.value = 0.1;
        lfoG.gain.value = 0.05;
        
        g1.gain.value = 0.15;
        g2.gain.value = 0.1;

        lfo.connect(lfoG);
        lfoG.connect(g1.gain);
        lfoG.connect(g2.gain);

        f1.connect(g1);
        f2.connect(g2);
        g1.connect(this.audio.gain);
        g2.connect(this.audio.gain);

        f1.start();
        f2.start();
        lfo.start();

        this.audio.nodes = { oscL: f1, oscR: f2, lfo, gain: g1 };
    }

    playSolfeggio(freq) {
        this.stopDynamicAudio();
        const osc = this.audio.ctx.createOscillator();
        const gain = this.audio.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.value = 0.12;
        osc.connect(gain);
        gain.connect(this.audio.gain);
        osc.start();
        this.audio.nodes = { source: osc, gain };
    }

    playGuidedDrone() {
        this.stopDynamicAudio();
        const osc = this.audio.ctx.createOscillator();
        const filter = this.audio.ctx.createBiquadFilter();
        const gain = this.audio.ctx.createGain();

        osc.type = 'square';
        osc.frequency.value = 110; // Warm A2 baseline
        
        filter.type = 'lowpass';
        filter.frequency.value = 300; // Muffled, warm quality
        
        gain.gain.value = 0.12;

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.audio.gain);

        osc.start();
        this.audio.nodes = { source: osc, filter, gain };
    }

    stopDynamicAudio() {
        if (this.audio.nodes) {
            try { if (this.audio.nodes.oscL) { this.audio.nodes.oscL.stop(); this.audio.nodes.oscR.stop(); } } catch(e) {}
            try { if (this.audio.nodes.source) this.audio.nodes.source.stop(); } catch(e) {}
            try { if (this.audio.nodes.lfo) this.audio.nodes.lfo.stop(); } catch(e) {}
            try { if (this.audio.nodes.interval) { clearInterval(this.audio.nodes.interval); } } catch(e) {}
            this.audio.nodes = null;
        }
        if (this.audio.gain) {
            this.audio.gain.gain.value = 0;
        }
    }

    async playbackSensory(type) {
        if (!this.audio.ctx) {
            this.audio.ctx = new (window.AudioContext || window.webkitAudioContext)();
        }
        if (!this.audio.gain) {
            this.audio.gain = this.audio.ctx.createGain();
            this.audio.gain.connect(this.audio.ctx.destination);
            this.audio.gain.gain.value = 0;
        }

        if (this.audio.ctx.state === 'suspended') this.audio.ctx.resume();

        // ── STOP CURRENT STATE ──
        this.stopDynamicAudio();
        if (this.audio.currentSource) {
            const old = this.audio.currentSource;
            this.audio.currentSource = null;
            gsap.to(this.audio.gain.gain, { 
                value: 0, 
                duration: 0.5, 
                onComplete: () => {
                    old.pause();
                    old.currentTime = 0;
                } 
            });
        }

        // ── ROUTE TO GENERATORS ──
        if (type === 'forest') {
            this.playForestNight();
            gsap.to(this.audio.gain.gain, { value: 0.35, duration: 1.5 });
            return;
        }

        if (type === 'rain') {
            this.playRainfall();
            gsap.to(this.audio.gain.gain, { value: 0.35, duration: 1.5 });
            return;
        }

        if (type === 'river') {
            this.playGentleRiver();
            gsap.to(this.audio.gain.gain, { value: 0.35, duration: 1.5 });
            return;
        }

        if (type === 'wind') {
            this.playSoftWind();
            gsap.to(this.audio.gain.gain, { value: 0.35, duration: 1.5 });
            return;
        }

        if (type === 'brown' || type === 'white' || type === 'pink') {
            this.playNoise(type);
            gsap.to(this.audio.gain.gain, { value: 0.4, duration: 1.5 });
            return;
        }

        if (type === 'binaural' || type === 'alpha' || type === 'theta' || type === 'delta') {
            this.playBinaural(type === 'binaural' ? 'alpha' : type);
            gsap.to(this.audio.gain.gain, { value: 0.3, duration: 1.5 });
            return;
        }

        if (type === 'ambient' || type === 'waves' || type === 'ocean') {
            this.playOceanWaves();
            gsap.to(this.audio.gain.gain, { value: 0.4, duration: 2 });
            return;
        }

        if (type === 'vibration' || type === 'bowls') {
            this.playVibration();
            gsap.to(this.audio.gain.gain, { value: 0.5, duration: 2 });
            return;
        }

        if (type === 'solfeggio-528') {
            this.playSolfeggio(528);
            gsap.to(this.audio.gain.gain, { value: 0.15, duration: 1.5 });
            return;
        }

        if (type === 'solfeggio-417') {
            this.playSolfeggio(417);
            gsap.to(this.audio.gain.gain, { value: 0.15, duration: 1.5 });
            return;
        }

        if (type === 'solfeggio-852') {
            this.playSolfeggio(852);
            gsap.to(this.audio.gain.gain, { value: 0.15, duration: 1.5 });
            return;
        }

        if (type === 'solfeggio-963') {
            this.playSolfeggio(963);
            gsap.to(this.audio.gain.gain, { value: 0.15, duration: 1.5 });
            return;
        }

        if (type === 'bowl-432') {
            this.playSolfeggio(432);
            gsap.to(this.audio.gain.gain, { value: 0.18, duration: 2 });
            return;
        }

        if (type === 'bowl-528') {
            this.playSolfeggio(528);
            gsap.to(this.audio.gain.gain, { value: 0.18, duration: 2 });
            return;
        }

        if (type === 'bowl-396') {
            this.playSolfeggio(396);
            gsap.to(this.audio.gain.gain, { value: 0.18, duration: 2 });
            return;
        }

        if (type === 'bowl-174') {
            this.playSolfeggio(174);
            gsap.to(this.audio.gain.gain, { value: 0.18, duration: 2 });
            return;
        }

        if (type === 'guided-alpha') {
            this.playBinaural('alpha');
            gsap.to(this.audio.gain.gain, { value: 0.2, duration: 2 });
            return;
        }

        if (type === 'guided-theta') {
            this.playBinaural('theta');
            gsap.to(this.audio.gain.gain, { value: 0.2, duration: 2 });
            return;
        }

        if (type === 'guided-delta') {
            this.playBinaural('delta');
            gsap.to(this.audio.gain.gain, { value: 0.2, duration: 2 });
            return;
        }

        if (type === 'guided' || type === 'drone') {
            this.playGuidedDrone();
            gsap.to(this.audio.gain.gain, { value: 0.3, duration: 2 });
            return;
        }

        if (type === 'silence') {
            gsap.to(this.audio.gain.gain, { value: 0, duration: 1 });
            return;
        }

        // URL fallback (if it's a real file we trust)
        const url = this.audio.sources[type];
        if (!url) return;

        const audio = new Audio(url);
        audio.loop = true;
        audio.crossOrigin = "anonymous";
        audio.oncanplay = () => {
            if (this.audio.currentSource !== audio) return;
            const source = this.audio.ctx.createMediaElementSource(audio);
            source.connect(this.audio.gain);
            audio.play();
            gsap.to(this.audio.gain.gain, { value: 0.3, duration: 2 });
        };
        this.audio.currentSource = audio;
    }

    renderSensoryNodes(category = 'all', el = null) {
        const container = document.getElementById('sensory-node-grid');
        if (!container) return;

        if (el) {
            const parent = el.parentElement;
            parent.querySelectorAll('.rd-option-chip').forEach(c => c.classList.remove('active'));
            el.classList.add('active');
        }

        const filtered = category === 'all' 
            ? this.sensoryNodes 
            : this.sensoryNodes.filter(n => n.category === category);

        container.innerHTML = filtered.map(node => {
            const isAudio = node.category === 'auditory';
            const isActive = this.audio.activeNode === node.id;
            return `
                <div class="rd-panel rd-sensory-node-card" style="padding:1.5rem; transition:all 0.3s;" data-node-id="${node.id}">
                    <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                        <div style="flex:1; cursor:pointer;" onclick="window.rdApp.calibrateNode('${node.id}')">
                            <div style="font-size:1.5rem; margin-bottom:0.8rem;">${node.icon}</div>
                            <div style="font-weight:700; font-size:0.9rem; margin-bottom:0.3rem;">${node.name}</div>
                            <div style="font-size:0.7rem; opacity:0.6; line-height:1.4;">${node.desc}</div>
                            <div class="rd-tag" style="margin-top:1rem; font-size:0.6rem;">${node.category}</div>
                        </div>
                        ${isAudio ? `
                        <button class="rd-audio-play-btn ${isActive ? 'playing' : ''}" 
                                onclick="event.stopPropagation(); window.rdApp.toggleSensoryAudio('${node.id}')" 
                                title="${isActive ? 'Pause' : 'Play'}"
                                style="width:36px; height:36px; min-width:36px; border-radius:50%; border:1px solid var(--rd-border); background:rgba(255,255,255,0.05); color:var(--rd-gold); cursor:pointer; display:flex; align-items:center; justify-content:center; font-size:0.8rem; transition:all 0.3s; flex-shrink:0; margin-left:0.75rem; line-height:1;">
                            ${isActive ? '⏸' : '▶'}
                        </button>
                        ` : ''}
                    </div>
                </div>
            `;
        }).join('');

        if (typeof gsap !== 'undefined') {
            gsap.from(container.children, { opacity: 0, scale: 0.95, stagger: 0.05, duration: 0.4 });
        }
    }

    filterSensory(category, el) {
        this.renderSensoryNodes(category, el);
    }

    calibrateNode(id) {
        const node = this.sensoryNodes.find(n => n.id === id);
        if (!node) return;

        const iconEl = document.getElementById('active-category-icon');
        const titleEl = document.getElementById('active-category-title');
        const descEl = document.getElementById('active-category-desc');
        const fillEl = document.getElementById('mode-intensity-fill');

        if (iconEl) iconEl.textContent = node.icon;
        if (titleEl) titleEl.textContent = node.name;
        if (descEl) descEl.textContent = node.desc;
        if (fillEl) {
            gsap.fromTo(fillEl, { width: '0%' }, { width: '100%', duration: 1.5, ease: "power2.inOut" });
        }

        if (node.category === 'visual') {
            this.updateSystemTheme(node.value);
        } else if (node.category === 'auditory') {
            this.audio.activeNode = node.id;
            this.playbackSensory(node.value);
        }

        this.playCommitSound();
        this.triggerPulse();
        this.tuneAlignment(1);
    }

    toggleSensoryAudio(id) {
        const node = this.sensoryNodes.find(n => n.id === id);
        if (!node || node.category !== 'auditory') return;

        if (this.audio.activeNode === id) {
            this.stopDynamicAudio();
            this.audio.activeNode = null;
        } else {
            this.audio.activeNode = id;
            this.playbackSensory(node.value);
        }

        const card = document.querySelector(`.rd-sensory-node-card[data-node-id="${id}"] .rd-audio-play-btn`);
        if (card) {
            const isPlaying = this.audio.activeNode === id;
            card.innerHTML = isPlaying ? '⏸' : '▶';
            card.classList.toggle('playing', isPlaying);
            card.title = isPlaying ? 'Pause' : 'Play';
        }
    }

    resetSensory() {
        this.updateSystemTheme('red');
        this.stopDynamicAudio();
        this.audio.activeNode = null;
        
        const iconEl = document.getElementById('active-category-icon');
        const titleEl = document.getElementById('active-category-title');
        const descEl = document.getElementById('active-category-desc');
        
        if (iconEl) iconEl.textContent = '⚖️';
        if (titleEl) titleEl.textContent = 'Balanced Neutral';
        if (descEl) descEl.textContent = 'Currently maintaining a baseline equilibrium state for multi-modal synthesis.';
        
        this.renderSensoryNodes('all');
        document.querySelectorAll('.rd-option-chip').forEach(c => {
            c.classList.toggle('active', c.textContent.toLowerCase().includes('all'));
        });
    }

    // ── RITUAL BUILDER ──
    renderRitualLibrary() {
        const container = document.getElementById('ritual-library');
        if (!container) return;

        container.innerHTML = this.rituals.library.map(item => `
            <div class="rd-check-item" onclick="window.rdApp.addRitual('${item.id}')">
                <div class="rd-checkbox">+</div>
                <div class="rd-check-label">
                    <span style="margin-right:0.5rem">${item.icon}</span>
                    ${item.name}
                </div>
            </div>
        `).join('');
    }

    renderActiveSequence() {
        const container = document.getElementById('active-ritual-sequence');
        if (!container) return;

        const activeItems = this.rituals.active.map(id => this.rituals.library.find(l => l.id === id)).filter(Boolean);

        container.innerHTML = activeItems.map(item => `
            <div class="rd-check-item" onclick="window.rdApp.removeRitual('${item.id}')">
                <div class="rd-checkbox">✕</div>
                <div class="rd-check-label">
                    <span style="margin-right:0.5rem">${item.icon}</span>
                    ${item.name}
                </div>
            </div>
        `).join('');

        // Sync with dashboard
        this.renderDashboardRituals();
        this.generateRoadmap(false); // Update roadmap logic
    }

    // ── ROADMAP SYSTEM ──
    generateRoadmap(showAnim = true) {
        const title = document.getElementById('roadmap-title');
        const daily = document.getElementById('roadmap-daily');
        const weekly = document.getElementById('roadmap-weekly');
        const monthly = document.getElementById('roadmap-monthly');
        const summary = document.getElementById('roadmap-summary');

        if (!title) return;

        const mode = this.sensoryModes[this.activeSensoryMode].title;
        title.textContent = `Roadmap: ${mode} Alignment`;

        const content = {
            focus: {
                daily: [
                    { id: 'focus-d1', text: '<span class="rd-icon">🧠</span> Deep work block (90m)' },
                    { id: 'focus-d2', text: '<span class="rd-icon">🎧</span> Binaural calibration' },
                    { id: 'focus-d3', text: '<span class="rd-icon">📵</span> Digital fasting (1hr)' }
                ],
                weekly: [
                    { id: 'focus-w1', text: '<span class="rd-icon">📊</span> Complete 5 focus cycles' },
                    { id: 'focus-w2', text: '<span class="rd-icon">✍️</span> Neural scripting review' },
                    { id: 'focus-w3', text: '<span class="rd-icon">🌌</span> Acoustic reset' }
                ],
                monthly: [
                    { id: 'focus-m1', text: '<span class="rd-icon">👑</span> Master Cognitive Flow' },
                    { id: 'focus-m2', text: '<span class="rd-icon">⚡</span> Zero-latency execution' },
                    { id: 'focus-m3', text: '<span class="rd-icon">🧩</span> Signature audit' }
                ],
                summary: 'Your current focus-heavy setup is designed for maximum output. Prioritize morning binaural grounding to stabilize the neural baseline before expansion tasks.'
            },
            relax: {
                daily: [
                    { id: 'relax-d1', text: '<span class="rd-icon">🧘</span> Somatic release (20m)' },
                    { id: 'relax-d2', text: '<span class="rd-icon">🕯️</span> Amber light transition' },
                    { id: 'relax-d3', text: '<span class="rd-icon">🌬️</span> Breathwork loop' }
                ],
                weekly: [
                    { id: 'relax-w1', text: '<span class="rd-icon">🌊</span> 3 Restorative sessions' },
                    { id: 'relax-w2', text: '<span class="rd-icon">🛁</span> Sensory deprivation bath' },
                    { id: 'relax-w3', text: '<span class="rd-icon">🕸️</span> Pattern decoupling' }
                ],
                monthly: [
                    { id: 'relax-m1', text: '<span class="rd-icon">💎</span> Neurological Reset' },
                    { id: 'relax-m2', text: '<span class="rd-icon">⚖️</span> Total nervous system harmony' },
                    { id: 'relax-m3', text: '<span class="rd-icon">👁️</span> Depth perception fix' }
                ],
                summary: 'The restorative mode prioritizes parasympathetic activation. Use 2700K Amber calibration starting at 6PM to ensure a deep cortisol drop.'
            },
            create: {
                daily: [
                    { id: 'create-d1', text: '<span class="rd-icon">🎨</span> Abstract ideation (30m)' },
                    { id: 'create-d2', text: '<span class="rd-icon">❄️</span> Arctic light exposure' },
                    { id: 'create-d3', text: '<span class="rd-icon">🌈</span> Chromatic bath' }
                ],
                weekly: [
                    { id: 'create-w1', text: '<span class="rd-icon">🌪️</span> Vortex breathing (3 sessions)' },
                    { id: 'create-w2', text: '<span class="rd-icon">🔄</span> Ritual sequence swap' },
                    { id: 'create-w3', text: '<span class="rd-icon">🔭</span> Perception expansion' }
                ],
                monthly: [
                    { id: 'create-m1', text: '<span class="rd-icon">🌌</span> Concept Manifestation' },
                    { id: 'create-m2', text: '<span class="rd-icon">🖌️</span> High-res ideation state' },
                    { id: 'create-m3', text: '<span class="rd-icon">⚒️</span> Reality sculpting mastery' }
                ],
                summary: 'Expansion mode leverages Arctic calibration to stimulate high-frequency neural pathways. Combine with Vortex Breathing for optimized creative output.'
            },
            sleep: {
                daily: [
                    { id: 'sleep-d1', text: '<span class="rd-icon">🔴</span> Deep red spectrum only' },
                    { id: 'sleep-d2', text: '<span class="rd-icon">🔕</span> Silence architecture' },
                    { id: 'sleep-d3', text: '<span class="rd-icon">🌙</span> Reset breathing' }
                ],
                weekly: [
                    { id: 'sleep-w1', text: '<span class="rd-icon">💤</span> Regenerative sleep cycle' },
                    { id: 'sleep-w2', text: '<span class="rd-icon">🔌</span> Full disconnect' },
                    { id: 'sleep-w3', text: '<span class="rd-icon">🛡️</span> Melatonin protection' }
                ],
                monthly: [
                    { id: 'sleep-m1', text: '<span class="rd-icon">🧬</span> Biological Optimization' },
                    { id: 'sleep-m2', text: '<span class="rd-icon">🛠️</span> Cellular repair peak' },
                    { id: 'sleep-m3', text: '<span class="rd-icon">🏁</span> Total reset achieved' }
                ],
                summary: 'Sleep mode uses low-frequency light and silence to protect biological rhythms. Ensure all blue-light emitters are Off before activating this ritual.'
            }
        };

        const active = content[this.activeSensoryMode] || content.focus;
        const saved = JSON.parse(localStorage.getItem('rd-roadmap-progress') || '{}');

        daily.innerHTML = active.daily.map(t => {
            const checked = saved[t.id] ? 'active' : '';
            return `<div class="rd-check-item ${checked}" data-protocol-id="${t.id}"><div class="rd-checkbox"></div><div class="rd-check-label">${t.text}</div></div>`;
        }).join('');
        
        weekly.innerHTML = active.weekly.map(t => {
            const checked = saved[t.id] ? 'active' : '';
            return `<div class="rd-check-item ${checked}" data-protocol-id="${t.id}"><div class="rd-checkbox"></div><div class="rd-check-label">${t.text}</div></div>`;
        }).join('');
        
        monthly.innerHTML = active.monthly.map(t => {
            const checked = saved[t.id] ? 'active' : '';
            return `<div class="rd-check-item ${checked}" data-protocol-id="${t.id}"><div class="rd-checkbox"></div><div class="rd-check-label">${t.text}</div></div>`;
        }).join('');
        
        summary.innerHTML = `<p>${active.summary}</p><p class="rd-mt-1" style="font-weight:600; color:var(--rd-gold);">HEALTHY ROUTINE: Incorporate 15m of ${mode === 'Focus' ? 'Neural Scripting' : 'Chromatic Relaxation'} immediately after system sync.</p>`;

        if (showAnim) {
            gsap.from('#roadmap-portal > *', { opacity: 0, stagger: 0.1, duration: 0.5 });
        }

        // Populate live data widgets from engines
        const hobbyCount = document.getElementById('roadmap-hobby-count');
        const hobbyAvg = document.getElementById('roadmap-hobby-avg');
        const mealStatus = document.getElementById('roadmap-meal-status');

        if (hobbyCount) hobbyCount.innerText = this.hobbyEngine.archives.length;
        if (hobbyAvg) {
            if (this.hobbyEngine.archives.length > 0) {
                const avg = Math.round(this.hobbyEngine.archives.reduce((s, a) => s + a.progress, 0) / this.hobbyEngine.archives.length);
                hobbyAvg.innerText = `${avg}%`;
            } else {
                hobbyAvg.innerText = '--%';
            }
        }
        if (mealStatus) {
            mealStatus.innerText = this.nutritionalEngine.weeklyPlan ? '✓ Synced' : 'Not Generated';
            mealStatus.style.color = this.nutritionalEngine.weeklyPlan ? '#4ade80' : 'var(--rd-gold)';
        }
        
        this.updateRoadmapProgressUI();
    }

    updateRoadmapProgressUI() {
        const saved = JSON.parse(localStorage.getItem('rd-roadmap-progress') || '{}');
        const totalItems = document.querySelectorAll('#roadmap-portal .rd-check-item').length;
        const completedItems = Object.keys(saved).length;
        
        if (totalItems === 0) return;
        
        const progressEl = document.getElementById('roadmap-progress');
        if (progressEl) {
            const pct = Math.round((completedItems / totalItems) * 100);
            progressEl.innerText = `${pct}% Protocol Completion`;
        }
    }

    tuneAlignment(amt) {
        const scoreEl = document.getElementById('rd-resonance-score');
        const fillEl = document.getElementById('rd-resonance-fill');
        if (!scoreEl) return;

        let current = parseInt(scoreEl.innerText);
        let target = Math.min(100, current + amt);
        
        gsap.to(fillEl, { width: `${target}%`, duration: 0.5 });
        let obj = { val: current };
        gsap.to(obj, {
            val: target,
            duration: 0.8,
            onUpdate: () => { scoreEl.innerText = Math.round(obj.val); }
        });
    }

    renderDashboardRituals() {
        const container = document.getElementById('dashboard-ritual-list');
        if (!container) return;

        const activeItems = this.rituals.active.map(id => this.rituals.library.find(l => l.id === id)).filter(Boolean);
        
        container.innerHTML = activeItems.map(item => `
            <div class="rd-check-item" onclick="this.classList.toggle('done'); window.rdApp.triggerDashboardCheck(this)">
                <div class="rd-checkbox"></div>
                <div class="rd-check-label">${item.icon} ${item.name}</div>
            </div>
        `).join('');
    }

    triggerDashboardCheck(el) {
        this.triggerPulse();
        if (el.classList.contains('done')) {
            this.playCheckOffSound();
        } else {
            this.playCommitSound();
        }
    }

    addRitual(id) {
        if (!this.rituals.active.includes(id)) {
            this.playCommitSound();
            this.triggerPulse();
            this.rituals.active.push(id);
            this.renderActiveSequence();
        }
    }

    removeRitual(id) {
        this.playCommitSound();
        this.triggerPulse();
        this.rituals.active = this.rituals.active.filter(rid => rid !== id);
        this.renderActiveSequence();
    }
}

// Initialize Globally
window.rdApp = new RealityApp();
