import { useState, useRef } from "react";
import useSWRSubscription from "swr/subscription";
import io from "socket.io-client";

function App() {
  const socketRef = useRef();
  const { data } = useSWRSubscription(
    "http://localhost:3001",
    (key, { next }) => {
      socketRef.current = io(key);

      socketRef.current.on("receive_message", (event) => {
        next(null, event);
      });

      socketRef.current.on("error", (event) => {
        next(event.error);
      });

      return () => socketRef.current.close();
    }
  );

  const [message, setMessage] = useState("");
  const [room, setRoom] = useState("");

  const sendMessage = () => {
    if (socketRef.current) {
      socketRef.current.emit("send_message", { message, room });
    }
  };

  const joinRoom = () => {
    if (room !== "") {
      socketRef.current.emit("join_room", room);
    }
  };

  return (
    <div className="App">
    <input
        placeholder="Room Number..."
        onChange={(event) => {
          setRoom(event.target.value);
        }}
      />
      <button onClick={joinRoom}> Join Room</button>
      <input
        placeholder="Message..."
        onChange={(event) => {
          setMessage(event.target.value);
        }}
      />
      <button onClick={sendMessage}>Send Message</button>

      <h2>Messages from SWR:</h2>
      <p>{data?.message}</p>
    </div>
  );
}

export default App;
