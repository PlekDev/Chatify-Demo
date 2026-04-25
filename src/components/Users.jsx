import './../App.css'

const Users = ({ userList = [] }) => { 
    if (userList.length === 0) return <p>No active users.</p>;

    return (
        <div className="container" id="users-container">
            {userList.map((user) => (
                <div className="users" key={user.id}>
                    <span>{user.name}</span>
                </div>
            ))}
        </div>
    );
};

export default Users;