<<<<<<< HEAD
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

pool.connect()
  .then(client => {
    console.log('DB CONNECTED');
    client.release();
  })
  .catch(err => {
    console.error('DB ERROR:', err.message);
  });

=======
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: Number(process.env.DB_PORT),
});

pool.connect()
  .then(client => {
    console.log('DB CONNECTED');
    client.release();
  })
  .catch(err => {
    console.error('DB ERROR:', err.message);
  });

>>>>>>> f0a059cb5a8c2336b0078ed73e32535cafec65c9
module.exports = pool;