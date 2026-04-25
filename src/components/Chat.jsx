import { useEffect, useState, useRef } from 'react'
import socket from '../socket'

const ROOMS = ['General', 'Tech Talk', 'Random', 'Gaming']

const Chat = ({ username, room, onLeave }) => {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [typingUsers, setTypingUsers] = useState([])
  const bottomRef = useRef(null)
  const typingTimeoutRef = useRef(null)
  const isTypingRef = useRef(false)

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

    // Otros usuarios escribiendo
    socket.on('typing', ({ username: who }) => {
      setTypingUsers((prev) => (prev.includes(who) ? prev : [...prev, who]))
    })

    socket.on('stop typing', ({ username: who }) => {
      setTypingUsers((prev) => prev.filter((u) => u !== who))
    })

    return () => {
      socket.emit('leave room', { room })
      socket.off('message history')
      socket.off('chat message')
      socket.off('typing')
      socket.off('stop typing')
      socket.disconnect()
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
      isTypingRef.current = false
      setTypingUsers([])
    }
  }, [username, room])

  // Auto-scroll al último mensaje
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const stopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current)
      typingTimeoutRef.current = null
    }
    if (isTypingRef.current) {
      isTypingRef.current = false
      socket.emit('stop typing', { username, room })
    }
  }

  const handleInputChange = (e) => {
    setInput(e.target.value)

    if (e.target.value.trim() === '') {
      stopTyping()
      return
    }

    if (!isTypingRef.current) {
      isTypingRef.current = true
      socket.emit('typing', { username, room })
    }

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current)
    typingTimeoutRef.current = setTimeout(() => {
      stopTyping()
    }, 3000)
  }

  const sendMessage = () => {
    if (!input.trim()) return

    socket.emit('chat message', {
      content: input.trim(),
      username,
      room,
    })
    setInput('')
    stopTyping()
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

      {typingUsers.filter((u) => u !== username).length > 0 && (
        <div className="typing-indicator">
          {typingUsers.filter((u) => u !== username).join(', ')}
          {typingUsers.filter((u) => u !== username).length === 1
            ? ' está escribiendo'
            : ' están escribiendo'}
          <span className="typing-dots">
            <span>.</span><span>.</span><span>.</span>
          </span>
        </div>
      )}

      <div className="chat-input-area">
        <input
          type="text"
          value={input}
          onChange={handleInputChange}
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
