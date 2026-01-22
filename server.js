const WebSocket = require('ws');
const http = require('http');

const server = http.createServer();
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
    console.log('✅ Browser Client ချိတ်ဆက်လာပါပြီ!');
    ws.send('🌟 Server ကြိုဆိုပါတယ်! နာမည်ပို့ပါ:');
    
    ws.on('message', (message) => {
        console.log('👤 Client:', message);
        ws.send(`🎉 Hello ${message}! 😊`);
    });
});

server.listen(3000, () => {
    console.log('🚀 WebSocket Server: Port 3000');
});
