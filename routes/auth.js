const express = require('express');
const passport = require('passport');
const User = require('../models/User');
const router = express.Router();

// GET /api/user/login - страница с формой входа/регистрации
router.get('/login', (req, res) => {
  res.json({
    message: 'Страница входа/регистрации',
    forms: {
      login: {
        method: 'POST',
        url: '/api/user/login',
        fields: ['username', 'password']
      },
      signup: {
        method: 'POST',
        url: '/api/user/signup',
        fields: ['username', 'email', 'password']
      }
    }
  });
});

// GET /api/user/me - страница профиля
router.get('/me', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ 
      message: 'Не авторизован',
      redirect: '/api/user/login'
    });
  }
  
  res.json({
    message: 'Страница профиля',
    user: {
      id: req.user._id,
      username: req.user.username,
      email: req.user.email,
      createdAt: req.user.createdAt
    }
  });
});

// POST /api/user/login - обработка входа
router.post('/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка сервера' });
    }
    
    if (!user) {
      return res.status(401).json({ 
        message: info.message || 'Ошибка аутентификации' 
      });
    }
    
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка входа' });
      }
      
      res.json({
        message: 'Успешный вход',
        user: {
          id: user._id,
          username: user.username,
          email: user.email
        },
        redirect: '/api/user/me'
      });
    });
  })(req, res, next);
});

// POST /api/user/signup - обработка регистрации
router.post('/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Проверка обязательных полей
    if (!username || !email || !password) {
      return res.status(400).json({ 
        message: 'Все поля обязательны для заполнения' 
      });
    }
    
    // Проверка существующего пользователя
    const existingUser = await User.findOne({
      $or: [{ username }, { email }]
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Пользователь с таким именем или email уже существует' 
      });
    }
    
    // Создание нового пользователя
    const newUser = new User({
      username,
      email,
      password
    });
    
    await newUser.save();
    
    // Автоматический вход после регистрации
    req.logIn(newUser, (err) => {
      if (err) {
        return res.status(500).json({ message: 'Ошибка автоматического входа' });
      }
      
      res.status(201).json({
        message: 'Пользователь успешно зарегистрирован',
        user: {
          id: newUser._id,
          username: newUser.username,
          email: newUser.email
        },
        redirect: '/api/user/me'
      });
    });
    
  } catch (error) {
    res.status(500).json({ 
      message: 'Ошибка при регистрации',
      error: error.message 
    });
  }
});

// POST /api/user/logout - выход из системы
router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) {
      return res.status(500).json({ message: 'Ошибка выхода' });
    }
    res.json({ message: 'Успешный выход', redirect: '/api/user/login' });
  });
});

module.exports = router;