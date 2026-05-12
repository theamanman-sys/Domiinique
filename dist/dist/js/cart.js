/**
 * Domiinique Unified Cart System
 * Handles: Cart State, UI Badges, Toasts, and Modals
 */

(function() {
    const CART_KEY = 'domiinique-cart';

    const domCart = {
        items: JSON.parse(localStorage.getItem(CART_KEY) || '[]'),

        save() {
            localStorage.setItem(CART_KEY, JSON.stringify(this.items));
            this.updateBadges();
        },

        getItems() {
            return this.items;
        },

        addItem(arg1, arg2, arg3, arg4) {
            let item;
            
            if (arg1 instanceof HTMLElement) {
                // If passed a DOM element, extract attributes from dataset
                item = {
                    id: arg1.dataset.id || arg1.dataset.name || Date.now().toString(),
                    title: arg1.dataset.title || arg1.dataset.name,
                    price: parseFloat((arg1.dataset.price || '0').toString().replace(/,/g, '')) || 0,
                    image: arg1.dataset.img || arg1.dataset.image || '',
                    qty: 1,
                    author: arg1.dataset.author || arg1.dataset.cat || '',
                    desc: arg1.dataset.desc || arg1.dataset.description || ''
                };
            } else if (typeof arg1 === 'object' && arg1 !== null) {
                // Handle raw JavaScript object input (check for .dataset too)
                const d = arg1.dataset || arg1;
                const title = d.title || d.name || d.label || 'Untitled';
                const id = (d.id && d.id !== 'undefined') ? d.id : title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                
                item = {
                    id: id,
                    title: title,
                    price: parseFloat((d.price || '0').toString().replace(/,/g, '')) || 0,
                    image: d.image || d.img || '',
                    qty: parseInt(d.qty || 1),
                    author: d.author || d.cat || '',
                    desc: d.desc || d.description || ''
                };
            } else {
                // Handle individual arguments
                item = {
                    id: arg1 || Date.now().toString(),
                    title: arg2,
                    price: parseFloat(arg3) || 0,
                    image: arg4 || '',
                    qty: 1,
                    author: '',
                    desc: ''
                };
            }

            const existing = this.items.find(i => i.id === item.id || i.title === item.title);
            if (existing) {
                existing.qty = (existing.qty || 1) + (item.qty || 1);
            } else {
                this.items.push(item);
            }

            this.save();
            this.showToast(`"${item.title}" integrated.`);
            return item;
        },

        removeItem(id) {
            this.items = this.items.filter(i => {
                const matchId = i.id && i.id === id;
                const matchTitle = i.title && i.title === id;
                return !matchId && !matchTitle;
            });
            this.save();
        },

        adjustQuantity(id, delta) {
            const idx = this.items.findIndex(i => (i.id === id || i.title === id || i.name === id));
            if (idx > -1) {
                const newQty = (this.items[idx].qty || 1) + delta;
                if (newQty <= 0) {
                    this.items.splice(idx, 1);
                } else {
                    this.items[idx].qty = newQty;
                }
                this.save();
            }
        },

        clear() {
            this.items = [];
            this.save();
        },

        getTotalQty() {
            return this.items.reduce((sum, item) => sum + (item.qty || 1), 0);
        },

        updateBadges() {
            const count = this.getTotalQty();
            document.querySelectorAll('.nav-cart-badge, .cart-count, #cart-count-display').forEach(el => {
                el.textContent = count;
                el.style.display = count > 0 ? 'inline-flex' : 'none';
                el.classList.toggle('on', count > 0);
            });
        },

        showToast(msg) {
            let toast = document.getElementById('cart-toast');
            let msgEl = document.getElementById('toast-msg');
            
            if (!toast) {
                // Create toast if it doesn't exist
                toast = document.createElement('div');
                toast.id = 'cart-toast';
                toast.className = 'cart-toast';
                toast.innerHTML = '<span id="toast-msg"></span>';
                document.body.appendChild(toast);
                msgEl = document.getElementById('toast-msg');
            }

            msgEl.textContent = msg;
            toast.classList.add('show');
            clearTimeout(toast._tid);
            toast._tid = setTimeout(() => toast.classList.remove('show'), 3000);
        }
    };

    // Modals are now handled globally by main.js to ensure consistency across the site.
    // The cart system remains focused on state management and notifications.

    // Legacy support for shop.html direct calls
    window.addToCartFromCard = function(btn, name, price, img) {
        domCart.addItem({ title: name, price: price, image: img });
        if (btn) {
            btn.textContent = '✓';
            btn.classList.add('added');
            setTimeout(() => {
                btn.textContent = btn.dataset.originalText || 'Add';
                btn.classList.remove('added');
            }, 1800);
        }
    };

    // Legacy support for packages.html
    window.addPkgToCart = function(btn, name, price) {
        domCart.addItem({ title: name, price: price, type: 'package' });
        if (btn) {
            const original = btn.textContent;
            btn.textContent = '✓ Added';
            btn.classList.add('added');
            setTimeout(() => {
                btn.textContent = original;
                btn.classList.remove('added');
            }, 2200);
        }
    };

    // Export to window
    window.domCart = domCart;
    window.updateAllBadges = () => domCart.updateBadges();
    window.addToCart = (item) => domCart.addItem(item);

    // Initialize badges on load
    document.addEventListener('DOMContentLoaded', () => domCart.updateBadges());

})();
