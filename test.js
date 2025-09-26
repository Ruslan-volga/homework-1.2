const express = require('express');
const app = express();

// Самый простой маршрут ПЕРВЫМ делом
app.get('/debug', (req, res) => {
    console.log('DEBUG CALLED');
    res.json({ message: 'DEBUG WORKS!', timestamp: new Date().toISOString() });
});

app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log('Test server started on port', PORT);
    console.log('Debug: http://localhost:3000/debug');
});
