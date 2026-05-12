        var CURR_COLORS = {ETB:'#c9a84c',USD:'#4488ff',EUR:'#ff4488',NOW:'#ffcc00'};

document.getElementById('currency-selector').addEventListener('change',function(e){
    e.target.style.color = CURR_COLORS[e.target.value]||'#c9a84c';
    renderCheckout();
});

function renderCheckout(){
    var container=document.getElementById('cart-items-container');
    var totalEl=document.getElementById('total-amount');
    var countEl=document.getElementById('cart-item-count');
    var currency=document.getElementById('currency-selector').value;
    var items=window.domCart?window.domCart.getItems():[];
    var rates={ETB:1,USD:0.008,EUR:0.0075,NOW:0.1};
    var rate=rates[currency]||1;

    if(!items||items.length===0){
        container.innerHTML='<p style="text-align:center;opacity:.45;padding:2rem 0;font-size:.88rem;">Your cart is empty &mdash; <a href="shop.html" style="color:var(--accent)">visit the Shop</a> or <a href="books.html" style="color:var(--accent)">browse Books</a>.</p>';
        totalEl.textContent='0 '+currency;
        if(countEl)countEl.textContent='';
        return;
    }

    var total=0;
    var totalQty=0;
    container.innerHTML=items.map(function(item){
        var qty=item.qty||1;
        var linePrice=item.price*qty*rate;
        total+=item.price*qty;
        totalQty+=qty;
        var thumb=item.image?'<img src="'+item.image+'" style="width:48px;height:62px;object-fit:cover;border-radius:4px;flex-shrink:0;" onerror="this.style.opacity=0">':'<div style="width:48px;height:62px;background:var(--bg2);border-radius:4px;flex-shrink:0;display:flex;align-items:center;justify-content:center;font-size:1.4rem;">&#10024;</div>';
        var meta = item.author ? '<div style="font-size:.6rem;color:var(--fg-sub);letter-spacing:.15em;text-transform:uppercase;">'+item.author+'</div>' : '';
        var description = item.desc ? '<div style="font-size:.7rem;color:var(--fg-sub);opacity:.7;margin-top:.2rem;display:-webkit-box;-webkit-line-clamp:1;-webkit-box-orient:vertical;overflow:hidden;">'+item.desc+'</div>' : '';
        
        return '<div style="display:flex;align-items:center;gap:1rem;padding:.9rem 0;border-bottom:1px solid var(--border-soft);">'
            +thumb
            +'<div style="flex:1;min-width:0;">'
            +'<div style="font-family:var(--f-serif);font-size:.95rem;color:var(--fg);margin-bottom:.1rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+item.title+'</div>'
            +meta
            +description
            +'</div>'
            +'<div style="display:flex;align-items:center;gap:.5rem;flex-shrink:0;">'
            +'<button onclick="adjQty(\''+item.id+'\',-1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--glass);color:var(--fg);cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center;">&#8722;</button>'
            +'<span style="font-size:.85rem;min-width:18px;text-align:center;">'+qty+'</span>'
            +'<button onclick="adjQty(\''+item.id+'\',1)" style="width:28px;height:28px;border-radius:50%;border:1px solid var(--border);background:var(--glass);color:var(--fg);cursor:pointer;font-size:.85rem;display:flex;align-items:center;justify-content:center;">+</button>'
            +'</div>'
            +'<span style="font-size:.9rem;color:var(--accent2);min-width:80px;text-align:right;flex-shrink:0;">'+Math.round(linePrice)+' '+currency+'</span>'
            +'<button onclick="rmItem(\''+item.id+'\')" style="background:none;border:none;color:rgba(240,100,100,.55);cursor:pointer;font-size:1.3rem;line-height:1;flex-shrink:0;">&#215;</button>'
            +'</div>';
    }).join('');

    totalEl.textContent=Math.round(total*rate)+' '+currency;
    totalEl.style.color=CURR_COLORS[currency]||'#c9a84c';
    if(countEl)countEl.textContent=totalQty+' item'+(totalQty!==1?'s':'')+' in your cart';
}

window.adjQty = function(id,delta){
    if(window.domCart) window.domCart.adjustQuantity(id,delta);
    renderCheckout();
};
window.rmItem = function(id){
    if(window.domCart)window.domCart.removeItem(id);
    renderCheckout();
};

// -- WhatsApp Order --
window.sendWhatsAppOrder = function() {
    var items = window.domCart ? window.domCart.getItems() : [];
    if (!items || !items.length) { alert('Your cart is empty.'); return; }
    var total = items.reduce(function(s,i){ return s + (parseFloat(i.price)||0)*(i.qty||1); }, 0);
    window.sendWhatsAppOrderOriginalItems(items, total);
}

window.sendWhatsAppOrderOriginalItems = function(items, total) {
    if (!items || !items.length) return;
    var lines = items.map(function(i) { 
        var meta = i.author ? ' (' + i.author + ')' : '';
        return (i.qty||1) + '\u00d7 ' + i.title + meta + ' \u2014 ' + (((parseFloat(i.price)||0)*(i.qty||1)).toLocaleString()) + ' Birr'; 
    });
    var msg = '\ud83d\uded2 *DOMIINIQUE ORDER*\n\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\u2500\n' + lines.join('\n') + '\n\n*Total: ' + total.toLocaleString() + ' Birr*\n\n*Payment:* Telebirr to +251992013589\n(Screenshot attached or uploaded via website)';
    window.open('https://wa.me/251992013589?text=' + encodeURIComponent(msg), '_blank');
}

// -- Preview screenshot --
var _screenshotFile = null;
window.previewScreenshot = function(input) {
    var file = input.files[0];
    if (!file) {
        _screenshotFile = null;
        document.getElementById('screenshot-preview').innerHTML = '';
        return;
    }
    
    if (file.size > 4194304) {
        alert("Image exceeds 4MB limit. Please choose a smaller file.");
        input.value = "";
        _screenshotFile = null;
        document.getElementById('screenshot-preview').innerHTML = '';
        return;
    }

    _screenshotFile = file;
    var reader = new FileReader();
    reader.onload = function(e) {
        document.getElementById('screenshot-preview').innerHTML = '<img src="' + e.target.result + '" style="max-width:200px;max-height:140px;border-radius:6px;margin-top:.4rem;box-shadow:0 4px 10px rgba(0,0,0,0.5);"><br><span style="font-size:0.6rem;color:#5ddb8e;margin-top:0.3rem;display:inline-block;">&#10003; Image Ready to Upload</span>';
    };
    reader.readAsDataURL(file);
}

// -- Submit order --
window.submitOrder = async function(btnEl) {
    var items = window.domCart ? window.domCart.getItems() : [];
    if (!items || !items.length) { alert('Your cart is empty. Add items before placing an order.'); return; }

    var total = items.reduce(function(s,i){ return s + (parseFloat(i.price)||0)*(i.qty||1); }, 0);
    var orderId = 'DOM-' + Math.random().toString(36).substr(2,7).toUpperCase();
    var session = null;
    try { session = JSON.parse(sessionStorage.getItem('domiinique-session')); } catch(e) {}

    var origText = btnEl ? btnEl.textContent : 'Confirm Order';
    if (btnEl) { btnEl.disabled = true; }

    function setStatus(text, color) {
        if (btnEl) {
            btnEl.textContent = text;
            btnEl.style.background = color || 'var(--accent)';
        }
    }

    var screenshotUrl = null;
    var previewEl = document.getElementById('screenshot-preview');

    // STEP 1: Upload screenshot (if present)
    if (_screenshotFile) {
        screenshotUrl = await new Promise(function(resolve) {
            var file = _screenshotFile;
            var ext  = file.name.split('.').pop().toLowerCase() || 'jpg';
            var storagePath = 'orders/' + orderId + '_screenshot.' + ext;

            var boundary = '------FirebaseBoundary' + Date.now();
            var metaJson = JSON.stringify({ name: storagePath, contentType: file.type });

            setStatus('Uploading screenshot... 0%', '#333');
            // Use pure XHR for upload with perfect progress events
            var reader = new FileReader();
            reader.onload = function(e) {
                var arrayBuf = e.target.result;
                var projectId = 'domiinique-site'; // The user's firebase project id from firebase-config.js
                var bucket = projectId + '.appspot.com';
                
                // REST API Upload URL
                var uploadURL = 'https://firebasestorage.googleapis.com/v0/b/' + bucket + '/o?name=' + encodeURIComponent(storagePath);
                
                var xhr = new XMLHttpRequest();
                xhr.open('POST', uploadURL, true);
                xhr.setRequestHeader('Content-Type', file.type);
                
                xhr.upload.onprogress = function(pe) {
                    if (pe.lengthComputable) {
                        var pct = Math.round((pe.loaded / pe.total) * 100);
                        if(pct > 100) pct = 100;
                        setStatus('📤 Uploading screenshot... ' + pct + '%', '#333');
                        if (previewEl) {
                            var bar = document.getElementById('upload-progress-bar');
                            if (!bar) {
                                var barWrap = document.createElement('div');
                                barWrap.style.cssText = 'background:rgba(255,255,255,.08);border-radius:4px;height:4px;margin-top:.5rem;overflow:hidden;';
                                bar = document.createElement('div');
                                bar.id = 'upload-progress-bar';
                                bar.style.cssText = 'height:100%;background:linear-gradient(90deg,#800020,#c9a84c);border-radius:4px;transition:width 0.1s linear;width:0%;';
                                barWrap.appendChild(bar);
                                previewEl.appendChild(barWrap);
                            }
                            bar.style.width = pct + '%';
                        }
                    }
                };
                
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        // Success! Parse the JSON response to reconstruct the download URL
                        var res = JSON.parse(xhr.responseText);
                        var downloadTokens = res.downloadTokens;
                        var finalUrl = 'https://firebasestorage.googleapis.com/v0/b/' + bucket + '/o/' + encodeURIComponent(storagePath) + '?alt=media&token=' + downloadTokens;
                        setStatus('Screenshot uploaded! Recording order...', '#1a472a');
                        resolve(finalUrl);
                    } else {
                        console.warn('Screenshot upload failed:', xhr.status, xhr.responseText);
                        if (previewEl) previewEl.innerHTML += '<br><span style="color:#ff8a8a;font-size:.62rem;">Upload server error: ' + xhr.status + '. Order will continue.</span>';
                        resolve(null);
                    }
                };
                
                xhr.onerror = function() {
                    console.warn('Screenshot upload XHR network error');
                    if (previewEl) previewEl.innerHTML += '<br><span style="color:#ff8a8a;font-size:.62rem;">Upload network error. Order will continue.</span>';
                    resolve(null);
                };
                
                xhr.send(arrayBuf);
            };
            reader.onerror = function() { resolve(null); };
            reader.readAsArrayBuffer(file);
        });
    }

    // STEP 2: Save to Firestore
    try {
        setStatus('Recording order #' + orderId + '...', '#0d2b1a');
        var order = {
            id: orderId,
            date: new Date().toISOString(),
            user: session ? session.username : 'guest',
            uid: session ? session.uid : null,
            userName: session ? session.name : 'Guest',
            items: items,
            total: total,
            status: 'pending',
            payment: 'Telebirr/WhatsApp',
            screenshotUrl: screenshotUrl || null,
            createdAt: serverTimestamp()
        };

        await setDoc(doc(db, 'orders', orderId), order);

        // STEP 3: Show success modal
        document.getElementById('success-order-id').textContent = orderId;
        var ssMsg = document.getElementById('success-screenshot-msg');
        if (screenshotUrl) {
            ssMsg.textContent = 'Payment screenshot saved to database.';
            ssMsg.style.display = 'block';
        } else if (_screenshotFile) {
            ssMsg.textContent = 'Order saved. Screenshot upload failed — please send via WhatsApp.';
            ssMsg.style.color = '#ffaa55';
            ssMsg.style.display = 'block';
        } else {
            ssMsg.style.display = 'none';
        }
        document.getElementById('order-success-modal').style.display = 'flex';

        // Clear cart
        if (window.domCart) window.domCart.clear();
        setTimeout(renderCheckout, 300);

        // Trigger WhatsApp after a moment
        setTimeout(() => {
            window.sendWhatsAppOrderOriginalItems(items, total);
        }, 1200);

    } catch(e) {
        console.error('Order save error:', e);
        alert('Failed to process order. Error: ' + (e.message || 'Unknown error') + '\nPlease try again or contact via WhatsApp.');
        if(btnEl) { btnEl.disabled = false; setStatus('Confirm Order & Record Payment', 'var(--accent)'); }
        return;
    }

    if(btnEl) { btnEl.disabled = false; setStatus('Confirm Order & Record Payment', 'var(--accent)'); }
}

document.addEventListener('DOMContentLoaded', renderCheckout);
