const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Бүх анги авах
router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM classes ORDER BY sort_order ASC, id ASC'
    );

    res.json({
      success: true,
      classes: result.rows
    });
  } catch (error) {
    console.error('get classes error:', error);
    res.status(500).json({
      success: false,
      message: 'Ангиудыг авахад алдаа гарлаа'
    });
  }
});

// Шинэ анги нэмэх
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Ангийн нэр оруулна уу'
      });
    }

    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM classes'
    );

    const nextOrder = Number(maxOrderResult.rows[0].max_order) + 1;

    const insertResult = await pool.query(
      'INSERT INTO classes (name, sort_order) VALUES ($1, $2) RETURNING *',
      [name.trim(), nextOrder]
    );

    res.json({
      success: true,
      message: 'Анги амжилттай нэмэгдлээ',
      classItem: insertResult.rows[0]
    });
  } catch (error) {
    console.error('create class error:', error);
    res.status(500).json({
      success: false,
      message: 'Анги нэмэхэд алдаа гарлаа'
    });
  }
});

// Анги устгах
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleteResult = await pool.query(
      'DELETE FROM classes WHERE id = $1 RETURNING *',
      [id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Анги олдсонгүй'
      });
    }

    res.json({
      success: true,
      message: 'Анги амжилттай устгагдлаа'
    });
  } catch (error) {
    console.error('delete class error:', error);
    res.status(500).json({
      success: false,
      message: 'Анги устгахад алдаа гарлаа'
    });
  }
});

module.exports = router;