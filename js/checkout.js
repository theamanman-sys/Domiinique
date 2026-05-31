/**
 * DOMIINIQUE Unified Cart Bridge
 * Provides legacy NOW_CART API mapped to the domCart system.
 * Ensures backward compatibility with dist/ and older pages.
 */

(function() {
    var CART_KEY = 'domiinique-cart';

    function getDomCart() {
        return window.domCart || {
            getItems: function() {
                try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch(e) { return []; }
            },
            addItem: function(item) {
                var items = this.getItems();
                items.push(item);
                localStorage.setItem(CART_KEY, JSON.stringify(items));
            },
            updateBadges: function() {
                var count = this.getItems().reduce(function(s, i) { return s + (i.qty || 1); }, 0);
                document.querySelectorAll('.nav-cart-badge, .cart-count').forEach(function(el) {
                    el.textContent = count;
                    el.style.display = count > 0 ? 'inline-flex' : 'none';
                });
            },
            showToast: function(msg) {
                var toast = document.getElementById('cart-toast');
                var msgEl = document.getElementById('toast-msg');
                if (!toast) {
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
                toast._tid = setTimeout(function() { toast.classList.remove('show'); }, 3000);
            }
        };
    }

    var _total = 0;

    window.NOW_CART = {
        get items() { return getDomCart().getItems(); },
        set items(val) { localStorage.setItem(CART_KEY, JSON.stringify(val)); },
        currency: 'ETB',
        get total() {
            return this.items.reduce(function(sum, item) {
                var price = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : (item.price || 0);
                return sum + price * (item.qty || 1);
            }, 0);
        }
    };

    window.addToNowCart = function(id, title, price, defaultProvider) {
        var cart = getDomCart();
        var numericPrice = typeof price === 'string' ? parseFloat(price.replace(/,/g, '')) : (price || 0);

        cart.addItem({
            id: id || Date.now().toString(),
            title: title,
            price: numericPrice,
            qty: 1
        });

        cart.updateBadges();
        cart.showToast('"' + title + '" integrated.');

        if (typeof openCheckoutModal === 'function') {
            setTimeout(function() { openCheckoutModal(defaultProvider); }, 400);
        }
    };

    // Checkout Modal Injection (legacy support for dist/index.html)
    function injectCheckoutModal() {
        if (document.getElementById('checkout-overlay')) return;

        var html = `
        <div id="checkout-overlay" class="modal-overlay" style="display:none; position:fixed; inset:0; background:rgba(13,11,9,0.85); backdrop-filter:blur(15px); z-index:9999; align-items:center; justify-content:center; opacity:0; transition: opacity 0.4s;">
            <div class="checkout-box" style="background:var(--bg2); border:1px solid var(--border); padding:3rem; max-width:500px; width:90%; position:relative; transform:translateY(20px); transition: transform 0.4s;">
                <button class="modal__close" onclick="closeCheckoutModal()" style="position:absolute; top:1rem; right:1rem; background:none; border:none; color:var(--accent); font-size:1.5rem; cursor:pointer;">✕</button>
                <div class="t-eyebrow t-center">N:OW Ecosystem Checkout</div>
                <h2 class="t-h2 t-center" style="margin-bottom:2rem;">Secure Payment</h2>
                
                <div id="checkout-items" style="margin-bottom:2rem; border-bottom:1px solid var(--border-soft); padding-bottom:1rem;"></div>
                
                <div style="display:flex; justify-content:space-between; margin-bottom:2rem; color:var(--accent);">
                    <span>Total:</span>
                    <strong id="checkout-total">0 ETB</strong>
                </div>

                <p style="font-size:0.8rem; color:var(--fg-sub); opacity:0.6; margin-bottom:1rem; text-align:center;">Select Payment Gateway</p>
                
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:1rem; margin-bottom:1rem;">
                    <button onclick="window.location.href='checkout.html'" class="btn-primary" style="background:transparent; border:1px solid #00A6DF; color:#00A6DF; padding:1rem; width:100%;">Full Checkout</button>
                    <button onclick="processPayment('whatsapp')" class="btn-primary" style="background:transparent; border:1px solid #25d366; color:#25d366; padding:1rem; width:100%;">WhatsApp Order</button>
                </div>
            </div>
        </div>
        `;
        document.body.insertAdjacentHTML('beforeend', html);
    }

    window.openCheckoutModal = function(providerHint) {
        var overlay = document.getElementById('checkout-overlay');
        if (!overlay) {
            injectCheckoutModal();
            overlay = document.getElementById('checkout-overlay');
        }

        var itemsContainer = document.getElementById('checkout-items');
        var items = window.NOW_CART.items;
        itemsContainer.innerHTML = items.map(function(item) {
            var price = typeof item.price === 'string' ? parseFloat(item.price.replace(/,/g, '')) : (item.price || 0);
            return '<div style="display:flex; justify-content:space-between; margin-bottom:0.5rem; color:var(--fg-sub); font-size:0.95rem;">'
                + '<span>' + item.title + '</span>'
                + '<span>' + price + ' ETB</span></div>';
        }).join('');

        document.getElementById('checkout-total').innerText = window.NOW_CART.total + ' ETB';

        overlay.style.display = 'flex';
        void overlay.offsetWidth;
        overlay.style.opacity = '1';
        overlay.querySelector('.checkout-box').style.transform = 'translateY(0)';
    };

    window.closeCheckoutModal = function() {
        var overlay = document.getElementById('checkout-overlay');
        if (overlay) {
            overlay.style.opacity = '0';
            overlay.querySelector('.checkout-box').style.transform = 'translateY(20px)';
            setTimeout(function() { overlay.style.display = 'none'; }, 400);
        }
    };

    window.processPayment = function(gateway) {
        if (gateway === 'whatsapp') {
            var items = window.NOW_CART.items;
            var msg = 'New Domiinique Order:\n';
            items.forEach(function(item) {
                msg += '- ' + item.title + '\n';
            });
            msg += '\nTotal: ' + window.NOW_CART.total + ' ETB';
            window.open('https://wa.me/251992013589?text=' + encodeURIComponent(msg), '_blank');
        } else {
            window.location.href = 'checkout.html';
        }
    };

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', injectCheckoutModal);
    } else {
        injectCheckoutModal();
    }
})();
