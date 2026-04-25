import { useState } from 'react'
import Chat from './components/Chat'
import Users from './components/Users'
import Channels from './components/Channels'
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

  // RETURN 1: Pantalla de selección de room

  if (!currentRoom) {
    return (
      <div className="room-selector">
        <div className="glass-card">
          <h1 className="logo-text">Chatify</h1>
          <p className="subtitle">Escoge un chat.</p>
          <div className="rooms-grid">
            {ROOMS.map((room) => (
              <button
                key={room}
                className="room-btn"
                onClick={() => joinRoom(room)}
              >
                <span className="hashtag">#</span> {room}
              </button>
            ))}
          </div>
        </div>
      </div>
    )
  }

  // RETURN 2: Pantalla de ingreso de username si no existe
  if (!username) {
    return (
      <div className="username-prompt">
        <div className="glass-card">
          <h2>Únete a <span className="highlight">#{currentRoom}</span></h2>
          <form onSubmit={handleUsernameSubmit}>
            <input
              type="text"
              placeholder="Selecciona un nombre de usuario..."
              value={inputUser}
              onChange={(e) => setInputUser(e.target.value)}
              autoFocus
            />
            <button className="submit-btn" type="submit">Connect</button>
          </form>
          <button className="back-btn" onClick={() => setCurrentRoom(null)}>
            <span className="arrow">←</span> Volver
          </button>
        </div>
      </div>
    )
  }

  // RETURN 3: Channels, Chat y Users
  return (
    <div className="chat-main-container">
      <Channels activeRoom={currentRoom} setRoom={setCurrentRoom} />
      <Chat username={username} room={currentRoom} />
      <Users room={currentRoom} />
    </div>
  )
}

export default App