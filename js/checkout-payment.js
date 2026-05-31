/* ============================================================
   DOMIINIQUE — checkout-payment.js
   WhatsApp Payment Gateway + Order Management
   ============================================================ */

(function() {
    var ORDERS_KEY = 'domiinique-orders';
    var CART_KEY   = 'domiinique-cart';
    var WA_NUMBER  = '251992013589';

    function getCart() {
        try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); } catch(e) { return []; }
    }
    function getOrders() {
        try { return JSON.parse(localStorage.getItem(ORDERS_KEY) || '[]'); } catch(e) { return []; }
    }
    function saveOrders(arr) {
        localStorage.setItem(ORDERS_KEY, JSON.stringify(arr));
    }
    function genOrderId() {
        return 'DOM-' + Date.now().toString(36).toUpperCase().slice(-6);
    }
    function formatPrice(n) {
        return Number(n).toLocaleString() + ' Birr';
    }

    window.domPayment = {

        /**
         * Build a human-readable order summary from the cart.
         */
        buildSummary: function() {
            var items = getCart();
            if (!items.length) return null;

            var lines = items.map(function(item) {
                var qty = item.qty || 1;
                var price = parseFloat(item.price) || 0;
                return qty + '× ' + item.title + ' — ' + formatPrice(price * qty);
            });
            var total = items.reduce(function(s, i) { return s + (parseFloat(i.price) || 0) * (i.qty || 1); }, 0);
            return {lines: lines, total: total, items: items};
        },

        /**
         * Create and save an order to localStorage.
         * Returns the new order object.
         */
        createOrder: function(paymentNote, screenshotDataUrl) {
            var summary = this.buildSummary();
            if (!summary) return null;

            var session = null;
            try { session = JSON.parse(sessionStorage.getItem('domiinique-session')); } catch(e) {}

            var order = {
                id:          genOrderId(),
                date:        new Date().toISOString(),
                user:        session ? session.username : 'guest',
                userName:    session ? session.name : 'Guest',
                items:       summary.items,
                total:       summary.total,
                status:      'pending',
                payment:     paymentNote || 'WhatsApp/Telebirr',
                screenshot:  screenshotDataUrl || null
            };

            var orders = getOrders();
            orders.unshift(order);
            saveOrders(orders);
            return order;
        },

        /**
         * Open WhatsApp with a pre-filled order message.
         */
        sendViaWhatsApp: function(order) {
            if (!order) return;
            var lines = order.items.map(function(i) {
                return (i.qty || 1) + '× ' + i.title + ' — ' + formatPrice((parseFloat(i.price) || 0) * (i.qty || 1));
            });
            var msg = '🛒 *Domiinique ORDER*\n'
                    + '───────────────────\n'
                    + 'Order ID: ' + order.id + '\n'
                    + 'Date: ' + new Date(order.date).toLocaleDateString() + '\n'
                    + 'Customer: ' + order.userName + '\n\n'
                    + '*Items:*\n' + lines.join('\n') + '\n\n'
                    + '*Total: ' + formatPrice(order.total) + '*\n\n'
                    + 'Payment: ' + order.payment + '\n'
                    + '(Screenshot attached separately)';

            var url = 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg);
            window.open(url, '_blank');
        },

        /**
         * Clear the cart after successful order.
         */
        clearCart: function() {
            localStorage.removeItem(CART_KEY);
            if (window.updateAllBadges) window.updateAllBadges();
        }
    };
})();
