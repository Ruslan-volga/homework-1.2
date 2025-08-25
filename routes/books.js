const express = require('express');
const router = express.Router();

// Временное хранилище вместо MongoDB
let books = [];
let currentId = 1;

// GET /api/books - получить все книги
router.get('/', (req, res) => {
  res.json(books);
});

// GET /api/books/:id - получить книгу по ID
router.get('/:id', (req, res) => {
  const book = books.find(b => b.id === req.params.id);
  if (!book) {
    return res.status(404).json({ error: 'Книга не найдена' });
  }
  res.json(book);
});

// POST /api/books - создать новую книгу
router.post('/', (req, res) => {
  try {
    const bookData = {
      id: currentId.toString(),
      title: req.body.title,
      description: req.body.description,
      authors: req.body.authors,
      favorite: req.body.favorite === 'true',
      fileCover: req.body.fileCover || '',
      fileName: req.body.fileName || '',
      fileBook: req.body.fileBook || ''
    };

    books.push(bookData);
    currentId++;

    res.status(201).json(bookData);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// PUT /api/books/:id - обновить книгу
router.put('/:id', (req, res) => {
  try {
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }

    const updatedBook = {
      ...books[bookIndex],
      ...req.body,
      id: req.params.id // сохраняем оригинальный ID
    };

    books[bookIndex] = updatedBook;
    res.json(updatedBook);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// DELETE /api/books/:id - удалить книгу
router.delete('/:id', (req, res) => {
  try {
    const bookIndex = books.findIndex(b => b.id === req.params.id);
    
    if (bookIndex === -1) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }

    books.splice(bookIndex, 1);
    res.json({ message: 'Книга удалена' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// GET /api/books/:id/download - информация о файле
router.get('/:id/download', (req, res) => {
  try {
    const book = books.find(b => b.id === req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    if (!book.fileBook) {
      return res.status(404).json({ error: 'Файл книги не найден' });
    }
    
    res.json({ 
      message: 'Функция скачивания будет работать после настройки multer',
      file: book.fileBook,
      fileName: book.fileName
    });
    
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;