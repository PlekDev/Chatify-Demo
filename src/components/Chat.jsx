import { useEffect, useState, useRef } from 'react'
import socket from '../socket'
import './../App.css'

const ROOMS = ['General', 'Tech Talk', 'Random', 'Gaming']

const Chat = ({ username, room }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    // Conectar socket y unirse al room
    socket.connect()
    socket.emit('join room', { username, room })

    // Cargar historial al unirse
    socket.on('message history', (history) => {
      setMessages(history)
    })

    // Escuchar mensajes nuevos en tiempo real
    socket.on('chat message', (message) => {
      setMessages((prev) => [...prev, message])
    })

    return () => {
      socket.emit('leave room', { room })
      socket.off('message history')
      socket.off('chat message')
      socket.disconnect()
    }
  }, [username, room])

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = () => {
    if (!input.trim()) return

    socket.emit('chat message', {
      content: input.trim(),
      username,
      room,
    })
    setInput('')
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage()
  }

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('es-MX', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className="chat-container">
      <div className="chat-header">
        <h2># {room}</h2>
        <span className="chat-username">@{username}</span>
      </div>

      <div className="messages-list">
        {messages.length === 0 && (
          <p className="no-messages">No hay mensajes aún. ¡Sé el primero!</p>
        )}
        {messages.map((msg, index) => {
          const isOwn = msg.username === username
          return (
            <div
              key={msg.id || index}
              className={`message ${isOwn ? 'sent' : 'received'}`}
            >
              {!isOwn && (
                <span className="message-author">{msg.username}</span>
              )}
              <div className="message-bubble">
                <p>{msg.content}</p>
                <span className="message-time">
                  {formatTime(msg.created_at)}
                </span>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={`Mensaje en #${room}...`}
          className="chat-input"
        />
        <button onClick={sendMessage} className="send-btn">
          Enviar
        </button>
      </div>
    </div>
  )
}

export default Chat
