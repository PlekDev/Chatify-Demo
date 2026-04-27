import { useEffect, useState } from 'react'
import socket from '../socket'
import './App.css'

const Users = ({ room }) => {
    const [userList, setUserList] = useState([])

    useEffect(() => {
        socket.on('room users', ({ users }) => {
            setUserList(users)
        })

        return () => {
            socket.off('room users')
        }
    }, [room])

    return (
        <div className="container" id="users-container">
            <h3 className="sidebar-title">En línea — {userList.length}</h3>
            {userList.length === 0 ? (
                <p className="no-users"><span className="off-dot"></span>Ningún usuario conectado</p>
            ) : (
                userList.map((user, index) => (
                    <div className="users" key={user.id || index}>
                        <span className="on-dot"></span>
                        <span>{user.username || user.name}</span>
                    </div>
                ))
            )}
        </div>
    )
}

export default Users