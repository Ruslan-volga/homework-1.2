const express = require('express');
const connectDB = require('./db');
const bookRoutes = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

// Подключение к базе данных
connectDB();

// Middleware
app.use(express.json());

// Routes
app.use('/api/books', bookRoutes);

// Запуск сервера
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});