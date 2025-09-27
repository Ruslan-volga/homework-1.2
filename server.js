const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Simple in-memory storage
let messages = [];
let onlineUsers = new Map();
let userCount = 0;
const rooms = new Map();

// Default rooms
rooms.set('general', new Set());
rooms.set('обсуждение', new Set());
rooms.set('персонажи', new Set());

// Welcome message
messages.push({
    id: '1',
    sender: 'Система',
    text: 'Добро пожаловать в обсуждение книги "Преступление и наказание"!',
    timestamp: new Date().toISOString(),
    type: 'system',
    room: 'general'
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

io.on('connection', (socket) => {
    console.log('✅ Новое соединение:', socket.id);
    
    userCount++;
    io.emit('userCountUpdate', userCount);
    
    // Send message history immediately
    socket.emit('messageHistory', messages);
    socket.emit('roomList', getRoomList());

    // USER LOGIN HANDLING
    socket.on('setUsername', (username) => {
        console.log('👤 Пользователь пытается войти:', username);
        
        if (!username || username.trim() === '') {
            socket.emit('error', 'Имя пользователя не может быть пустым');
            return;
        }
        
        const cleanUsername = username.trim();
        onlineUsers.set(socket.id, cleanUsername);
        socket.username = cleanUsername;
        
        // Add to general room
        socket.join('general');
        rooms.get('general').add(socket.id);
        socket.currentRoom = 'general';
        
        // Login message
        const message = {
            id: Date.now().toString(),
            sender: 'Система',
            text: `${cleanUsername} присоединился к чату`,
            timestamp: new Date().toISOString(),
            type: 'system',
            room: 'general'
        };
        
        messages.push(message);
        
        // Send to everyone
        io.emit('newMessage', message);
        io.emit('userCountUpdate', userCount);
        io.emit('roomList', getRoomList());
        
        // Send confirmation to user
        socket.emit('loginSuccess', {
            username: cleanUsername,
            room: 'general',
            userCount: userCount
        });
        
        console.log('✅ Пользователь успешно вошел:', cleanUsername);
    });
    
    // CREATE ROOM
    socket.on('createRoom', (roomName) => {
        if (!roomName || roomName.trim() === '') {
            socket.emit('error', 'Название комнаты не может быть пустым');
            return;
        }
        
        const cleanRoomName = roomName.trim();
        
        if (rooms.has(cleanRoomName)) {
            socket.emit('error', `Комната "${cleanRoomName}" уже существует`);
            return;
        }
        
        rooms.set(cleanRoomName, new Set());
        console.log('🆕 Создана комната:', cleanRoomName);
        
        io.emit('roomList', getRoomList());
        socket.emit('joinRoom', cleanRoomName);
    });
    
    // JOIN ROOM
    socket.on('joinRoom', (roomName) => {
        if (!rooms.has(roomName)) {
            socket.emit('error', `Комната "${roomName}" не существует`);
            return;
        }
        
        if (socket.currentRoom) {
            socket.leave(socket.currentRoom);
            rooms.get(socket.currentRoom).delete(socket.id);
        }
        
        socket.join(roomName);
        socket.currentRoom = roomName;
        rooms.get(roomName).add(socket.id);
        
        socket.emit('currentRoomUpdate', {
            roomName: roomName,
            userCount: rooms.get(roomName).size
        });
        
        io.emit('roomList', getRoomList());
    });
    
    // SEND MESSAGES
    socket.on('sendToAll', (data) => {
        if (!socket.username) return;
        
        const message = {
            id: Date.now().toString(),
            sender: socket.username,
            text: data.text,
            timestamp: new Date().toISOString(),
            type: 'global',
            room: 'all'
        };
        
        console.log('📤 Отправка сообщения всем клиентам:', message);
        messages.push(message);
        io.emit('newMessage', message);
    });
    
    socket.on('sendToRoom', (data) => {
        if (!socket.username || !socket.currentRoom) return;
        
        const message = {
            id: Date.now().toString(),
            sender: socket.username,
            text: data.text,
            timestamp: new Date().toISOString(),
            type: 'room',
            room: socket.currentRoom
        };
        
        messages.push(message);
        io.to(socket.currentRoom).emit('newMessage', message);
    });
    
    socket.on('sendToSelf', (data) => {
        const message = {
            id: Date.now().toString(),
            sender: 'Вы',
            text: data.text,
            timestamp: new Date().toISOString(),
            type: 'self',
            room: 'self'
        };
        
        socket.emit('newMessage', message);
    });
    
    socket.on('disconnect', () => {
        userCount--;
        const username = onlineUsers.get(socket.id) || 'Аноним';
        
        if (socket.currentRoom) {
            rooms.get(socket.currentRoom).delete(socket.id);
        }
        
        onlineUsers.delete(socket.id);
        
        const message = {
            id: Date.now().toString(),
            sender: 'Система',
            text: `${username} покинул чат`,
            timestamp: new Date().toISOString(),
            type: 'system',
            room: 'general'
        };
        
        messages.push(message);
        io.emit('newMessage', message);
        io.emit('userCountUpdate', userCount);
        io.emit('roomList', getRoomList());
    });
});

function getRoomList() {
    return Array.from(rooms.entries()).map(([name, users]) => ({
        name: name,
        userCount: users.size,
        isGeneral: name === 'general'
    }));
}

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    console.log('📁 Комнаты:', Array.from(rooms.keys()));
});