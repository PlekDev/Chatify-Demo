import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import dotenv from 'dotenv'
import pool from './db.js'

dotenv.config()

const app = express()
const httpServer = createServer(app)

const io = new Server(httpServer, {
  cors: {
    origin: 'http://localhost:5173',
    methods: ['GET', 'POST'],
  },
})

app.use(cors())
app.use(express.json())

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Chatify server running' })
})

// ===== SOCKET.IO EVENTS =====
io.on('connection', (socket) => {
  console.log(`🔌 Cliente conectado: ${socket.id}`)

  // JOIN ROOM — cargar historial al unirse
  socket.on('join room', async ({ username, room }) => {
    // Salir de todos los rooms anteriores (excepto el default)
    const rooms = [...socket.rooms]
    rooms.forEach((r) => {
      if (r !== socket.id) socket.leave(r)
    })

    socket.join(room)
    socket.data.username = username
    socket.data.room = room

    console.log(`👤 ${username} se unió a #${room}`)

    try {
      // Cargar historial de los últimos 50 mensajes del room
      const result = await pool.query(
        `SELECT id, content, username, room, created_at
         FROM messages
         WHERE room = $1
         ORDER BY created_at ASC
         LIMIT 50`,
        [room]
      )
      socket.emit('message history', result.rows)
    } catch (err) {
      console.error('Error cargando historial:', err)
      socket.emit('message history', [])
    }
  })

  // LEAVE ROOM
  socket.on('leave room', ({ room }) => {
    socket.leave(room)
    console.log(`👋 ${socket.data.username} salió de #${room}`)
  })

  // CHAT MESSAGE — guardar en DB y broadcast al room
  socket.on('chat message', async ({ content, username, room }) => {
    try {
      const result = await pool.query(
        `INSERT INTO messages (content, username, room)
         VALUES ($1, $2, $3)
         RETURNING id, content, username, room, created_at`,
        [content, username, room]
      )
      const savedMessage = result.rows[0]

      // Enviar a todos en el room (incluido el emisor)
      io.to(room).emit('chat message', savedMessage)
    } catch (err) {
      console.error('Error guardando mensaje:', err)
    }
  })


  // TYPING — broadcast a otros del room (excepto emisor)
  socket.on('typing', ({ username, room }) => {
    socket.to(room).emit('typing', { username })
  })

  socket.on('stop typing', ({ username, room }) => {
    socket.to(room).emit('stop typing', { username })
  })


  socket.on('disconnect', () => {
    console.log(`❌ Cliente desconectado: ${socket.id}`)
  })
})

const PORT = process.env.PORT || 3001
httpServer.listen(PORT, () => {
  console.log(`🚀 Servidor corriendo en http://localhost:${PORT}`)
})
