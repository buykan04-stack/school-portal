const express = require('express');
const pool = require('../config/db');

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM experiments ORDER BY sort_order ASC, id ASC'
    );

    res.json({
      success: true,
      experiments: result.rows
    });
  } catch (error) {
    console.error('get experiments error:', error);
    res.status(500).json({
      success: false,
      message: 'Туршилтуудыг авахад алдаа гарлаа'
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { title, url } = req.body;

    if (!title || !title.trim() || !url || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Туршилтын нэр болон холбоос шаардлагатай'
      });
    }

    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM experiments'
    );

    const nextOrder = Number(maxOrderResult.rows[0].max_order) + 1;

    const insertResult = await pool.query(
      `INSERT INTO experiments (title, url, sort_order)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [title.trim(), url.trim(), nextOrder]
    );

    res.json({
      success: true,
      message: 'Туршилт амжилттай нэмэгдлээ',
      experiment: insertResult.rows[0]
    });
  } catch (error) {
    console.error('create experiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Туршилт нэмэхэд алдаа гарлаа'
    });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, url } = req.body;

    if (!title || !title.trim() || !url || !url.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Туршилтын нэр болон холбоос шаардлагатай'
      });
    }

    const updateResult = await pool.query(
      `UPDATE experiments
       SET title = $1, url = $2
       WHERE id = $3
       RETURNING *`,
      [title.trim(), url.trim(), id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Туршилт олдсонгүй'
      });
    }

    res.json({
      success: true,
      message: 'Туршилт амжилттай шинэчлэгдлээ',
      experiment: updateResult.rows[0]
    });
  } catch (error) {
    console.error('update experiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Туршилт засахад алдаа гарлаа'
    });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleteResult = await pool.query(
      'DELETE FROM experiments WHERE id = $1 RETURNING *',
      [id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Туршилт олдсонгүй'
      });
    }

    res.json({
      success: true,
      message: 'Туршилт устгагдлаа'
    });
  } catch (error) {
    console.error('delete experiment error:', error);
    res.status(500).json({
      success: false,
      message: 'Туршилт устгахад алдаа гарлаа'
    });
  }
});

module.exports = router;