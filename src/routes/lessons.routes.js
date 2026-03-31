const express = require('express');
const pool = require('../config/db');
const multer = require('multer');
const path = require('path');

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + ext;
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

// Тухайн ангийн бүх хичээлийг авах
router.get('/by-class/:classId', async (req, res) => {
  try {
    const { classId } = req.params;

    const result = await pool.query(
      'SELECT * FROM lessons WHERE class_id = $1 ORDER BY sort_order ASC, id ASC',
      [classId]
    );

    res.json({
      success: true,
      lessons: result.rows
    });
  } catch (error) {
    console.error('get lessons by class error:', error);
    res.status(500).json({
      success: false,
      message: 'Хичээлүүдийг авахад алдаа гарлаа'
    });
  }
});

// Lesson-ийн файлууд авах
router.get('/files/:lessonId', async (req, res) => {
  try {
    const { lessonId } = req.params;

    const result = await pool.query(
      'SELECT * FROM lesson_files WHERE lesson_id = $1 ORDER BY id ASC',
      [lessonId]
    );

    res.json({
      success: true,
      files: result.rows
    });
  } catch (err) {
    console.error('get lesson files error:', err);
    res.status(500).json({
      success: false
    });
  }
});

// Шинэ хичээл + файл нэмэх
router.post('/', upload.single('file'), async (req, res) => {
  try {
    const { class_id, title, description } = req.body;

    if (!class_id || !title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Хичээлийн нэр болон анги шаардлагатай'
      });
    }

    const maxOrderResult = await pool.query(
      'SELECT COALESCE(MAX(sort_order), 0) AS max_order FROM lessons WHERE class_id = $1',
      [class_id]
    );

    const nextOrder = Number(maxOrderResult.rows[0].max_order) + 1;

    const insertLesson = await pool.query(
      `INSERT INTO lessons (class_id, title, description, sort_order)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [class_id, title.trim(), description ? description.trim() : '', nextOrder]
    );

    const lesson = insertLesson.rows[0];

    if (req.file) {
      const filePath = `/uploads/${req.file.filename}`;

      await pool.query(
        `INSERT INTO lesson_files (lesson_id, file_name, file_path, file_type)
         VALUES ($1, $2, $3, $4)`,
        [lesson.id, req.file.originalname, filePath, req.file.mimetype]
      );
    }

    res.json({
      success: true,
      message: 'Хичээл амжилттай нэмэгдлээ',
      lesson
    });
  } catch (error) {
    console.error('create lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Хичээл нэмэхэд алдаа гарлаа'
    });
  }
});

// Хичээл засах + хүсвэл файл солих
router.put('/:id', upload.single('file'), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Хичээлийн нэр оруулна уу'
      });
    }

    const updateResult = await pool.query(
      `UPDATE lessons
       SET title = $1, description = $2
       WHERE id = $3
       RETURNING *`,
      [title.trim(), description ? description.trim() : '', id]
    );

    if (updateResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Хичээл олдсонгүй'
      });
    }

    if (req.file) {
      await pool.query('DELETE FROM lesson_files WHERE lesson_id = $1', [id]);

      const filePath = `/uploads/${req.file.filename}`;

      await pool.query(
        `INSERT INTO lesson_files (lesson_id, file_name, file_path, file_type)
         VALUES ($1, $2, $3, $4)`,
        [id, req.file.originalname, filePath, req.file.mimetype]
      );
    }

    res.json({
      success: true,
      message: 'Хичээл амжилттай шинэчлэгдлээ',
      lesson: updateResult.rows[0]
    });
  } catch (error) {
    console.error('update lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Хичээл засахад алдаа гарлаа'
    });
  }
});

// Хичээл устгах
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deleteResult = await pool.query(
      'DELETE FROM lessons WHERE id = $1 RETURNING *',
      [id]
    );

    if (deleteResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Хичээл олдсонгүй'
      });
    }

    res.json({
      success: true,
      message: 'Хичээл устгагдлаа'
    });
  } catch (error) {
    console.error('delete lesson error:', error);
    res.status(500).json({
      success: false,
      message: 'Хичээл устгахад алдаа гарлаа'
    });
  }
});

module.exports = router;