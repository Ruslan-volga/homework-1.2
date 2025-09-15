const Book = require('../models/Book');

// GET /api/books - Получить все книги
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.find({});
    res.json(books);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// GET /api/books/:id - Получить книгу по ID
const getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    res.json(book);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    res.status(500).json({ error: error.message });
  }
};

// POST /api/books - Создать книгу
const createBook = async (req, res) => {
  try {
    const { title, description, authors, favorite, fileCover, fileName } = req.body;
    
    const book = new Book({
      title,
      description,
      authors,
      favorite,
      fileCover,
      fileName
    });
    
    const savedBook = await book.save();
    res.status(201).json(savedBook);
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// PUT /api/books/:id - Редактировать книгу по ID
const updateBook = async (req, res) => {
  try {
    const { title, description, authors, favorite, fileCover, fileName } = req.body;
    
    const book = await Book.findByIdAndUpdate(
      req.params.id,
      {
        title,
        description,
        authors,
        favorite,
        fileCover,
        fileName
      },
      { new: true, runValidators: true }
    );
    
    if (!book) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    res.json(book);
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
};

// DELETE /api/books/:id - Удалить книгу по ID
const deleteBook = async (req, res) => {
  try {
    const book = await Book.findByIdAndDelete(req.params.id);
    
    if (!book) {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    
    res.json({ message: 'ok' });
  } catch (error) {
    if (error.name === 'CastError') {
      return res.status(404).json({ error: 'Книга не найдена' });
    }
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};