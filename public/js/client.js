class BookChat {
    constructor() {
        console.log('🔄 Инициализация чата...');
        
        this.socket = io();
        this.currentUser = null;
        this.isConnected = false;
        this.currentRoom = 'general';
        this.rooms = [];
        
        this.initializeElements();
        this.setupEventListeners();
        this.setupSocketHandlers();
        
        console.log('✅ Чат инициализирован');
    }
    
    initializeElements() {
        console.log('🔍 Поиск элементов DOM...');
        
        this.elements = {
            userSetup: document.getElementById('userSetup'),
            usernameInput: document.getElementById('usernameInput'),
            joinButton: document.getElementById('joinButton'),
            chatContent: document.getElementById('chatContent'),
            messagesContainer: document.getElementById('messagesContainer'),
            messageInput: document.getElementById('messageInput'),
            sendButton: document.getElementById('sendButton'),
            userCount: document.getElementById('userCount'),
            roomsList: document.getElementById('roomsList'),
            refreshRooms: document.getElementById('refreshRooms'),
            newRoomInput: document.getElementById('newRoomInput'),
            createRoomBtn: document.getElementById('createRoomBtn'),
            roomSelector: document.getElementById('roomSelector'),
            currentRoom: document.getElementById('currentRoom'),
            roomUsers: document.getElementById('roomUsers')
        };
        
        if (!this.elements.joinButton) {
            console.error('❌ КРИТИЧЕСКАЯ ОШИБКА: Не найдена кнопка "Присоединиться"');
            return;
        }
        
        console.log('✅ Основные элементы найдены');
        this.setMessageInputState(false);
    }
    
    setupEventListeners() {
        console.log('🎯 Настройка обработчиков событий...');
        
        this.elements.joinButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.joinChat();
        });
        
        this.elements.usernameInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.joinChat();
        });
        
        this.elements.sendButton.addEventListener('click', (event) => {
            event.preventDefault();
            this.sendMessage();
        });
        
        this.elements.messageInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
        
        if (this.elements.createRoomBtn) {
            this.elements.createRoomBtn.addEventListener('click', (event) => {
                event.preventDefault();
                this.createRoom();
            });
        }
        
        if (this.elements.newRoomInput) {
            this.elements.newRoomInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.createRoom();
            });
        }
        
        if (this.elements.refreshRooms) {
            this.elements.refreshRooms.addEventListener('click', () => {
                this.socket.emit('getRooms');
            });
        }
        
        const messageTypeRadios = document.querySelectorAll('input[name="messageType"]');
        messageTypeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.onMessageTypeChange(e.target.value);
            });
        });
        
        if (this.elements.roomSelector) {
            this.elements.roomSelector.addEventListener('change', (e) => {
                this.joinRoom(e.target.value);
            });
        }
    }
    
    setupSocketHandlers() {
        console.log('📡 Настройка обработчиков Socket.IO...');
        
        this.socket.on('connect', () => {
            console.log('✅ Подключено к серверу');
            this.displaySystemMessage('Подключено к серверу');
        });
        
        this.socket.on('loginSuccess', (data) => {
            console.log('✅ Успешный вход пользователя:', data);
            this.handleLoginSuccess(data);
        });
        
        this.socket.on('messageHistory', (messages) => {
            console.log('📨 Получена история сообщений:', messages.length);
            this.elements.messagesContainer.innerHTML = '';
            messages.forEach(message => this.displayMessage(message));
            this.scrollToBottom();
        });
        
        this.socket.on('newMessage', (message) => {
            console.log('💬 Новое сообщение:', message);
            this.displayMessage(message);
            this.scrollToBottom();
        });
        
        this.socket.on('roomList', (rooms) => {
            console.log('📋 Получен список комнат:', rooms);
            this.rooms = rooms;
            this.updateRoomsList();
            this.updateRoomSelector();
        });
        
        this.socket.on('currentRoomUpdate', (data) => {
            console.log('🚪 Обновлена текущая комната:', data);
            this.currentRoom = data.roomName;
            this.elements.currentRoom.textContent = `Комната: ${data.roomName}`;
            if (this.elements.roomUsers) {
                this.elements.roomUsers.textContent = `Участников: ${data.userCount}`;
            }
        });
        
        this.socket.on('error', (errorMessage) => {
            console.error('❌ Ошибка от сервера:', errorMessage);
            this.displaySystemMessage(`Ошибка: ${errorMessage}`, true);
        });
        
        this.socket.on('userCountUpdate', (count) => {
            console.log('👥 Обновление количества пользователей:', count);
            this.elements.userCount.textContent = `${count} участников`;
        });
    }
    
    joinChat() {
        console.log('🔐 Попытка входа в чат...');
        
        const username = this.elements.usernameInput.value.trim();
        
        if (!username) {
            alert('Пожалуйста, введите ваше имя');
            return;
        }
        
        this.elements.joinButton.disabled = true;
        this.elements.joinButton.textContent = 'Подключение...';
        
        this.elements.userSetup.classList.add('hidden');
        this.elements.chatContent.classList.remove('hidden');
        
        this.socket.emit('setUsername', username);
        
        setTimeout(() => {
            if (!this.isConnected) {
                this.elements.joinButton.disabled = false;
                this.elements.joinButton.textContent = 'Присоединиться';
                alert('Не удалось подключиться к серверу. Попробуйте еще раз.');
            }
        }, 5000);
    }
    
    handleLoginSuccess(data) {
        console.log('🎉 Обработка успешного входа');
        
        this.isConnected = true;
        this.currentUser = data.username;
        
        this.setMessageInputState(true);
        this.elements.messageInput.focus();
        
        this.displaySystemMessage(`Добро пожаловать, ${data.username}! Вы в комнате: ${data.room}`);
    }
    
    createRoom() {
        if (!this.elements.newRoomInput) return;
        
        const roomName = this.elements.newRoomInput.value.trim();
        
        if (!roomName) {
            alert('Введите название комнаты');
            return;
        }
        
        this.socket.emit('createRoom', roomName);
        this.elements.newRoomInput.value = '';
    }
    
    sendMessage() {
        if (!this.isConnected) {
            alert('Сначала присоединитесь к чату!');
            return;
        }
        
        const text = this.elements.messageInput.value.trim();
        if (!text) {
            alert('Введите текст сообщения');
            return;
        }
        
        const messageType = document.querySelector('input[name="messageType"]:checked').value;
        
        switch (messageType) {
            case 'all':
                this.socket.emit('sendToAll', { text: text });
                break;
            case 'self':
                this.socket.emit('sendToSelf', { text: text });
                break;
            case 'room':
                this.socket.emit('sendToRoom', { text: text });
                break;
        }
        
        this.elements.messageInput.value = '';
    }
    
    updateRoomsList() {
        if (!this.elements.roomsList) return;
        
        this.elements.roomsList.innerHTML = '';
        
        this.rooms.forEach(room => {
            const roomElement = document.createElement('div');
            roomElement.className = `room-item ${room.name === this.currentRoom ? 'active' : ''}`;
            roomElement.innerHTML = `
                <div class="room-name">${this.escapeHtml(room.name)}</div>
                <div class="room-info">
                    <span>${room.userCount} участ.</span>
                    ${room.isGeneral ? '<span>🔒</span>' : ''}
                </div>
            `;
            
            roomElement.addEventListener('click', () => {
                if (room.name !== this.currentRoom) {
                    this.joinRoom(room.name);
                }
            });
            
            this.elements.roomsList.appendChild(roomElement);
        });
    }
    
    updateRoomSelector() {
        if (!this.elements.roomSelector) return;
        
        this.elements.roomSelector.innerHTML = '';
        
        this.rooms.forEach(room => {
            const option = document.createElement('option');
            option.value = room.name;
            option.textContent = room.name + (room.isGeneral ? ' (общая)' : '');
            option.selected = room.name === this.currentRoom;
            this.elements.roomSelector.appendChild(option);
        });
    }
    
    onMessageTypeChange(type) {
        if (this.elements.roomSelector) {
            this.elements.roomSelector.disabled = type !== 'room';
        }
    }
    
    joinRoom(roomName) {
        console.log('🎯 Присоединение к комнате:', roomName);
        this.socket.emit('joinRoom', roomName);
    }
    
    displayMessage(message) {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type || ''}`;
        
        const isOwnMessage = message.sender === this.currentUser;
        if (isOwnMessage) {
            messageElement.classList.add('own');
        }
        
        const time = new Date(message.timestamp).toLocaleTimeString('ru-RU', {
            hour: '2-digit', 
            minute: '2-digit'
        });
        
        messageElement.innerHTML = `
            <div class="message-header">
                <span class="message-sender">${this.escapeHtml(message.sender)}</span>
                <span class="message-time">${time}</span>
            </div>
            <div class="message-content">${this.escapeHtml(message.text)}</div>
            ${message.room && message.room !== 'all' ? `<div class="message-room-indicator">Комната: ${message.room}</div>` : ''}
        `;
        
        if (this.elements.messagesContainer) {
            this.elements.messagesContainer.appendChild(messageElement);
        }
    }
    
    displaySystemMessage(text, isError = false) {
        const message = {
            sender: 'Система',
            text: text,
            timestamp: new Date().toISOString(),
            type: 'system'
        };
        this.displayMessage(message);
        
        if (isError) {
            const lastMessage = this.elements.messagesContainer.lastChild;
            if (lastMessage) {
                lastMessage.style.background = '#ffebee';
                lastMessage.style.borderLeft = '4px solid #f44336';
            }
        }
    }
    
    setMessageInputState(enabled) {
        this.elements.messageInput.disabled = !enabled;
        this.elements.sendButton.disabled = !enabled;
        
        if (enabled) {
            this.elements.messageInput.placeholder = "Введите ваше сообщение...";
            this.elements.sendButton.textContent = "Отправить";
        } else {
            this.elements.messageInput.placeholder = "Сначала присоединитесь к чату...";
            this.elements.sendButton.textContent = "Отключено";
        }
    }
    
    scrollToBottom() {
        setTimeout(() => {
            if (this.elements.messagesContainer) {
                this.elements.messagesContainer.scrollTop = this.elements.messagesContainer.scrollHeight;
            }
        }, 100);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('📄 DOM полностью загружен');
    window.chat = new BookChat();
});