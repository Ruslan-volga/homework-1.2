const express = require('express');
const booksRouter = require('./routes/books');

const app = express();
const PORT = process.env.PORT || 3000;

console.log('🔄 app.js начал выполнение', new Date().toLocaleTimeString());

// Подробное логирование ВСЕХ запросов
app.use((req, res, next) => {
  console.log('=== 📨 ЗАПРОС ПОЛУЧЕН ===');
  console.log('Время:', new Date().toLocaleTimeString());
  console.log('Метод:', req.method);
  console.log('URL:', req.url);
  console.log('Path:', req.path);
  console.log('Headers:', JSON.stringify(req.headers));
  console.log('========================');
  next();
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Корневой route с подтверждением
app.get('/', (req, res) => {
  console.log('✅ Обрабатываю GET / - КОРНЕВОЙ ROUTE');
  res.send(`
    <h1>Book API работает! 📚</h1>
    <p>Время: ${new Date().toLocaleTimeString()}</p>
    <p>Запрос успешно обработан!</p>
    <p><a href="/api/books">/api/books</a></p>
  `);
});

// Подключаем роуты книг
app.use('/api/books', booksRouter);

// Запускаем сервер
app.listen(PORT, () => {
  console.log('=== 🚀 СЕРВЕР ЗАПУЩЕН ===');
  console.log('Порт:', PORT);
  console.log('Время:', new Date().toLocaleTimeString());
  console.log('URL: http://localhost:' + PORT);
  console.log('========================');
});

// Обработка 404 с логированием
app.use((req, res) => {
  console.log('❌ 404 - Route не найден:', req.method, req.url);
  res.status(404).send('404 - Страница не найдена');
});