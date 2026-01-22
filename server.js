// Node.js Server Example (Cloudflare Pages မှာ run လို့မရပေမယ့် demo)
const http = require('http');

const server = http.createServer((req, res) => {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('🚀 Server.js running on Node.js!\nDeployed from Github\nCloudflare Pages: Static Frontend');
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
