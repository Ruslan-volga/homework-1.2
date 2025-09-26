const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const passport = require('passport');
const User = require('./models/User');

const app = express();

app.get('/simple', (req, res) => res.json({ message: 'SIMPLE WORKS' }));

// ========== MIDDLEWARE ==========
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(session({ 
  secret: 'secret', 
  resave: false, 
  saveUninitialized: false 
}));

// ========== PASSPORT CONFIG ==========
const LocalStrategy = require('passport-local').Strategy;

passport.use(new LocalStrategy(
  async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: 'User not found' });
      const isMatch = await user.correctPassword(password);
      if (!isMatch) return done(null, false, { message: 'Wrong password' });
      return done(null, user);
    } catch (error) {
      return done(error);
    }
  }
));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error);
  }
});

app.use(passport.initialize());
app.use(passport.session());

// ========== ROUTES ==========

// 1. DEBUG - ПЕРВЫЙ МАРШРУТ
app.get('/debug', (req, res) => {
  console.log('✅ Debug endpoint called');
  res.json({ 
    message: 'DEBUG ENDPOINT IS WORKING!',
    timestamp: new Date().toISOString()
  });
});

// 2. Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server running' });
});

// 3. Test endpoint
app.get('/test', (req, res) => {
  res.json({ message: 'Test endpoint works!' });
});

// 4. Auth routes
app.get('/api/user/login', (req, res) => {
  res.json({ message: 'Login page' });
});

app.post('/api/user/signup', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
      return res.status(400).json({ message: 'All fields required' });
    }
    
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) return res.status(400).json({ message: 'User exists' });
    
    const newUser = new User({ username, email, password });
    await newUser.save();
    
    res.status(201).json({ message: 'Registered', user: { username, email } });
  } catch (error) {
    res.status(500).json({ message: 'Registration error', error: error.message });
  }
});

app.post('/api/user/login', (req, res, next) => {
  passport.authenticate('local', (err, user, info) => {
    if (err) return res.status(500).json({ message: 'Server error' });
    if (!user) return res.status(401).json({ message: 'Invalid credentials' });
    
    req.login(user, (err) => {
      if (err) return res.status(500).json({ message: 'Login error' });
      res.json({ message: 'Login successful', user: { username: user.username } });
    });
  })(req, res, next);
});

app.get('/api/user/me', (req, res) => {
  if (!req.isAuthenticated()) return res.status(401).json({ message: 'Not authorized' });
  res.json({ message: 'Profile', user: { username: req.user.username } });
});

// 5. LOGOUT - ПОСЛЕДНИЙ МАРШРУТ
app.post('/api/user/logout', (req, res) => {
  console.log('✅ Logout endpoint called');
  req.logout((err) => {
    if (err) return res.status(500).json({ message: 'Logout error' });
    res.json({ message: 'Logout successful' });
  });
});

// ========== DATABASE & SERVER START ==========
const MONGODB_URI = 'mongodb://localhost:27017/auth-demo';
mongoose.connect(MONGODB_URI)
.then(() => {
  console.log('✅ MongoDB connected');
  // Start server only after DB connection
  const PORT = 3000;
  app.listen(PORT, () => {
    console.log('🚀 Server started on port 3000');
    console.log('🔍 Debug: http://localhost:3000/debug');
    console.log('🚪 Logout: POST http://localhost:3000/api/user/logout');
  });
})
.catch(err => {
  console.error('❌ MongoDB error:', err.message);
});
