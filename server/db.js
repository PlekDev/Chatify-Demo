import pg from 'pg'
import dotenv from 'dotenv'

dotenv.config()

const { Pool } = pg

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
})

// Crear tabla si no existe al arrancar
const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS messages (
        id        SERIAL PRIMARY KEY,
        content   TEXT NOT NULL,
        username  VARCHAR(50) NOT NULL,
        room      VARCHAR(50) NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      )
    `)
    console.log('✅ Tabla messages lista')
  } catch (error) {
    console.error('Error inicializando DB:', error)
  }
}

initDB().catch(console.error)

export default pool