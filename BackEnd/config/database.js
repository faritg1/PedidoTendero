import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
  connectTimeout: 60000,
  charset: 'utf8mb4'
});

// Probar la conexión al iniciar
pool.getConnection()
  .then(connection => {
    console.log('✅ Conexión a base de datos exitosa');
    connection.release();
  })
  .catch(err => {
    console.error('❌ Error al conectar a la base de datos:');
    console.error('Host:', process.env.DB_HOST);
    console.error('User:', process.env.DB_USER);
    console.error('Database:', process.env.DB_NAME);
    console.error('Port:', process.env.DB_PORT);
    console.error('Error:', err.message);
  });

export default pool;
