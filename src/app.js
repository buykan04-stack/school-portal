const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const pool = require('./config/db');
const authRoutes = require('./routes/auth.routes');
const classesRoutes = require('./routes/classes.routes');
const lessonRoutes = require('./routes/lessons.routes');
const experimentsRoutes = require('./routes/experiments.routes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use(express.static(path.join(__dirname, '../public')));

app.use('/api/auth', authRoutes);
app.use('/api/classes', classesRoutes);
app.use('/api/lessons', lessonRoutes);
app.use('/api/experiments', experimentsRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const dbResult = await pool.query('SELECT NOW()');

    res.json({
      success: true,
      message: 'Backend and database working',
      time: dbResult.rows[0].now
    });
  } catch (error) {
    console.error('health error:', error);
    res.status(500).json({
      success: false,
      message: 'Database connection failed'
    });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

module.exports = app;