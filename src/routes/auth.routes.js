const express = require('express');
const pool = require('../config/db');

const router = express.Router();

// Нэгтгэсэн login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1 LIMIT 1',
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'Хэрэглэгч олдсонгүй'
      });
    }

    const user = result.rows[0];

    if (user.password_hash !== password) {
      return res.status(401).json({
        success: false,
        message: 'Нууц үг буруу байна'
      });
    }

    return res.json({
      success: true,
      message: 'Амжилттай нэвтэрлээ',
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        full_name: user.full_name
      }
    });
  } catch (error) {
    console.error('login error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server алдаа гарлаа'
    });
  }
});

module.exports = router;