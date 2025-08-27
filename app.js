const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Настройка EJS
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Создаем папку data если ее нет
if (!fs.existsSync('./data')) {
    fs.mkdirSync('./data');
}

// Функции для работы с данными
const readBooks = () => {
    try {
        if (!fs.existsSync('./data/books.json')) {
            // Создаем начальные данные
            const initialData = [
                {
                    "id": 1,
                    "title": "Война и мир",
                    "author": "Лев Толстой",
                    "year": 1869,
                    "description": "Роман-эпопея, описывающий русское общество в эпоху войн против Наполеона"
                },
                {
                    "id": 2,
                    "title": "Преступление и наказание", 
                    "author": "Фёдор Достоевский",
                    "year": 1866,
                    "description": "Психологический роман о студенте, совершившем убийство"
                }
            ];
            fs.writeFileSync('./data/books.json', JSON.stringify(initialData, null, 2));
            return initialData;
        }
        
        const data = fs.readFileSync('./data/books.json', 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Ошибка чтения файла:', error);
        return [];
    }
};

const writeBooks = (books) => {
    try {
        fs.writeFileSync('./data/books.json', JSON.stringify(books, null, 2));
    } catch (error) {
        console.error('Ошибка записи файла:', error);
    }
};

// ================== BASIC ROUTES ==================

// Главная страница - список всех книг
app.get('/', (req, res) => {
    const books = readBooks();
    res.render('index', { books, title: 'Все книги' });
});

// Просмотр информации о конкретной книге
app.get('/book/:id', (req, res) => {
    const books = readBooks();
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) {
        return res.status(404).render('error', { 
            title: 'Ошибка 404',
            message: 'Книга не найдена' 
        });
    }
    res.render('view', { book, title: book.title });
});

// Страница создания книги
app.get('/create', (req, res) => {
    res.render('create', { title: 'Добавить книгу' });
});

// Обработка создания книги
app.post('/create', (req, res) => {
    const books = readBooks();
    const newBook = {
        id: Date.now(),
        title: req.body.title,
        author: req.body.author,
        year: parseInt(req.body.year),
        description: req.body.description || ''
    };
    books.push(newBook);
    writeBooks(books);
    res.redirect('/');
});

// Страница редактирования книги
app.get('/update/:id', (req, res) => {
    const books = readBooks();
    const book = books.find(b => b.id === parseInt(req.params.id));
    if (!book) {
        return res.status(404).render('error', { 
            title: 'Ошибка 404',
            message: 'Книга не найдена' 
        });
    }
    res.render('update', { book, title: 'Редактировать: ' + book.title });
});

// Обработка редактирования книги
app.post('/update/:id', (req, res) => {
    const books = readBooks();
    const index = books.findIndex(b => b.id === parseInt(req.params.id));
    
    if (index === -1) {
        return res.status(404).render('error', { 
            title: 'Ошибка 404',
            message: 'Книга не найдена' 
        });
    }
    
    books[index] = {
        ...books[index],
        title: req.body.title,
        author: req.body.author,
        year: parseInt(req.body.year),
        description: req.body.description || ''
    };
    
    writeBooks(books);
    res.redirect(`/book/${req.params.id}`);
});

// Удаление книги
app.post('/delete/:id', (req, res) => {
    const books = readBooks();
    const filteredBooks = books.filter(b => b.id !== parseInt(req.params.id));
    writeBooks(filteredBooks);
    res.redirect('/');
});

// Страница ошибки
app.use((req, res) => {
    res.status(404).render('error', { 
        title: 'Ошибка 404',
        message: 'Страница не найдена' 
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log('====================================');
    console.log('🚀 Сервер запущен!');
    console.log(`📍 Адрес: http://localhost:${PORT}`);
    console.log('====================================');
});