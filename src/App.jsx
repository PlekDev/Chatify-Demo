import { useState } from 'react'
import Chat from './components/Chat'
import './App.css'

const ROOMS = ['General', 'Tech Talk', 'Random', 'Gaming']

function App() {
  const [currentRoom, setCurrentRoom] = useState(null)
  const [username, setUsername] = useState('')
  const [inputUser, setInputUser] = useState('')

  const joinRoom = (room) => {
    if (!username) {
      const saved = localStorage.getItem(`chatify_user_${room}`)
      if (saved) {
        setUsername(saved)
        setCurrentRoom(room)
        return
      }
      // Pedir username si no existe
      setCurrentRoom(room)
      return
    }
    setCurrentRoom(room)
  }

  const handleUsernameSubmit = (e) => {
    e.preventDefault()
    if (!inputUser.trim()) return
    const name = inputUser.trim()
    localStorage.setItem(`chatify_user_${currentRoom}`, name)
    setUsername(name)
  }

  // Pantalla de selección de room
  if (!currentRoom) {
    return (
      <div className="room-selector">
        <h1>Chatify</h1>
        <p>Selecciona un room para comenzar</p>
        <div className="rooms-grid">
          {ROOMS.map((room) => (
            <button
              key={room}
              className="room-btn"
              onClick={() => joinRoom(room)}
            >
              # {room}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // Pantalla de ingreso de username si no existe
  if (!username) {
    return (
      <div className="username-prompt">
        <h2>Entrar a #{currentRoom}</h2>
        <form onSubmit={handleUsernameSubmit}>
          <input
            type="text"
            placeholder="Tu nombre de usuario"
            value={inputUser}
            onChange={(e) => setInputUser(e.target.value)}
            autoFocus
          />
          <button type="submit">Entrar</button>
        </form>
        <button
          className="back-btn"
          onClick={() => setCurrentRoom(null)}
        >
          ← Volver
        </button>
      </div>
    )
  }

  return (
    <Chat
      username={username}
      room={currentRoom}
    />
  )
}

export default App