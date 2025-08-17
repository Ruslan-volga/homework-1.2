const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;


// Middleware для обработки JSON с правильной кодировкой
app.use(express.json({ type: 'application/json', charset: 'utf-8' }));
app.use(express.urlencoded({ extended: true, charset: 'utf-8' }));


// Временное хранилище данных (в реальном приложении следует использовать БД)
let books = [];

// Маршрут для авторизации пользователя
app.post('/api/user/login', (req, res) => {
  res.status(201).json({ id: 1, mail: "test@mail.ru" });
});

// Получить все книги
app.get('/api/books', (req, res) => {
  res.json(books);
});

// Получить книгу по ID
app.get('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const book = books.find(b => b.id === id);
  
  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ error: 'Книга не найдена' });
  }
});

// Создать новую книгу
app.post('/api/books', (req, res) => {
  const { title, description, authors, favorite, fileCover, fileName } = req.body;
  
  const newBook = {
    id: Date.now().toString(),
    title,
    description,
    authors,
    favorite,
    fileCover,
    fileName
  };
  
  books.push(newBook);
  res.status(201).json(newBook);
});

// Редактировать книгу по ID
app.put('/api/books/:id', (req, res) => {
  const { id } = req.params;
  const { title, description, authors, favorite, fileCover, fileName } = req.body;
  
  const bookIndex = books.findIndex(b => b.id === id);
  
  if (bookIndex !== -1) {
    books[bookIndex] = {
      ...books[bookIndex],
      title,
      description,
      authors,
      favorite,
      fileCover,
      fileName
    };
    
    res.json(books[bookIndex]);
  } else {
    res.status(404).json({ error: 'Книга не найдена' });
  }
});

// Удалить книгу по ID
app.delete('/api/books/:id', (req, res) => {
  const { id } = req.params;
  books = books.filter(b => b.id !== id);
  res.json('ok');
});

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});