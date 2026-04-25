import './../App.css'

const ROOMS = ['General', 'Tech Talk', 'Random', 'Gaming']

const Channels = ({ activeRoom, setRoom }) => {
    return (
        <div className="container" id="channels-container">
            <h3 className="sidebar-title">Channels</h3>
            {ROOMS.map((room) => (
                <div 
                    key={room}
                    className={`channels ${activeRoom === room ? 'active' : ''}`}
                    onClick={() => setRoom(room)}
                >
                    <span className="hashtag">#</span> {room}
                </div>
            ))}
        </div>
    );
};

export default Channels;