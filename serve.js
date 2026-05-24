const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const ROOT = __dirname;

const MIME = {
  '.html': 'text/html',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain',
  '.php': 'text/plain',
  '.htaccess': 'text/plain',
};

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split('?')[0].split('#')[0]);
  if (url === '/') url = '/index.html';
  const fp = path.join(ROOT, url);
  const ext = path.extname(fp).toLowerCase();

  fs.readFile(fp, (err, data) => {
    if (err) {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
      return;
    }
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
}).listen(PORT, () => {
  console.log(`Serving at http://127.0.0.1:${PORT}`);
});
