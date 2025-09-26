const http = require('http');

const server = http.createServer((req, res) => {
    console.log('✅ Request received:', req.method, req.url);
    
    if (req.url === '/debug') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ 
            message: 'SIMPLE SERVER WORKS!', 
            timestamp: new Date().toISOString() 
        }));
        return;
    }
    
    res.writeHead(404);
    res.end('Not found: ' + req.url);
});

const PORT = 3000;
server.listen(PORT, () => {
    console.log('🚀 Simple HTTP server running on http://localhost:' + PORT);
    console.log('📋 Test with: curl http://localhost:3000/debug');
});

// Обработка ошибок
server.on('error', (err) => {
    console.error('❌ Server error:', err.message);
});
