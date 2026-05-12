async function test() {
    var _screenshotFile = {};
    var orderId = '123';
    var screenshotUrl = null;
    var previewEl = {};
    var setStatus = function(){};
    var serverTimestamp = function(){};
    var setDoc = async function(){};
    var doc = function(){};
    var db = {};
    var session = {};
    var items = [];
    var total = 0;
    var btnEl = {};
    var renderCheckout = function(){};

    if (_screenshotFile) {
        screenshotUrl = await new Promise(function(resolve) {
            var file = _screenshotFile;
            var ext  = 'jpg';
            var storagePath = 'orders/' + orderId + '_screenshot.' + ext;
            
            setStatus('Uploading screenshot... 0%', '#333');
            var reader = {onload: null, onerror: null, readAsArrayBuffer: function(){}};
            reader.onload = function(e) {
                var arrayBuf = e.target.result;
                var projectId = 'domiinique-site';
                var bucket = projectId + '.appspot.com';
                
                var uploadURL = 'https://firebasestorage.googleapis.com/v0/b/' + bucket + '/o?uploadType=media&name=' + encodeURIComponent(storagePath);
                
                var xhr = {upload: {}, open: function(){}, setRequestHeader: function(){}, send: function(){}};
                xhr.upload.onprogress = function(pe) {
                    if (pe.lengthComputable) {
                        var pct = Math.round((pe.loaded / pe.total) * 100);
                        if(pct > 100) pct = 100;
                        setStatus('📤 Uploading screenshot... ' + pct + '%', '#333');
                    }
                };
                
                xhr.onload = function() {
                    if (xhr.status >= 200 && xhr.status < 300) {
                        var res = JSON.parse(xhr.responseText);
                        var downloadTokens = res.downloadTokens || '';
                        var finalUrl = 'https://firebasestorage.googleapis.com/v0/b/' + bucket + '/o/' + encodeURIComponent(storagePath) + '?alt=media&token=' + downloadTokens;
                        setStatus('Screenshot uploaded! Recording order...', '#1a472a');
                        resolve(finalUrl);
                    } else {
                        console.warn('Upload failed:', xhr.status, xhr.responseText);
                        resolve(null);
                    }
                };
                xhr.onerror = function() { console.warn('XHR error'); resolve(null); };
                xhr.send(arrayBuf);
            };
            reader.onerror = function() { resolve(null); };
            reader.readAsArrayBuffer(file);
        });
    }

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
    } catch(e) {}
}
