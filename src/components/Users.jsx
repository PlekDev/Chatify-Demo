import './Components.css'

const Users = ({ userList = [] }) => { // Veri
    // Verificar
    if (userList.length === 0) return <p>No active users.</p>;

    return (
        <div className="container" id="users-container">
            {/*{userList.map((user) => (*/}
                <div className="users" key={user.id}>
                    {/*<span>{user.name}</span>*/}
                    <span>Rosita Fresita</span>
                </div>
            {/*))}(*/}
        </div>
    );
};

export default Users;