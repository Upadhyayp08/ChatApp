import React, { useEffect, useState } from "react";
import io from "socket.io-client";

const socket = io("http://localhost:4000");

const ChatArea = () => {
  // Creating state to handle different values
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [room, setRoom] = useState("");
  const [user, setUser] = useState("");
  // Sets up real-time chat functionality using socket.io.
  useEffect(() => {
    // Listens for incoming "chatMessage" events and appends new messages to the state.
    socket.on("chatMessage", (data) => {
      setMessages((prevMessages) => [...prevMessages, data]);
    });

    // Listens for "oldMessages" event to replace existing messages with historical messages.
    socket.on("oldMessages", (oldMessages) => {
      console.log("OldMessages", oldMessages);
      setMessages(oldMessages);
    });

    // Ensures cleanup of event listeners when the component is unmounted.
    return () => {
      socket.off("chatMessage");
      socket.off("oldMessages");
    };
  }, []);

  // Using this to join the room in which we want to chat
  const joinRoom = (e) => {
    e.preventDefault();
    setRoom(e.target.value);
    socket.emit("joinRoom", e.target.value);
  };
  // an handle to send messages using socket
  const sendMessage = (e) => {
    e.preventDefault();
    socket.emit("chatMessage", {
      sender: user,
      content: input,
      room: room,
    });
    setInput("");
  };

  return (
    <>
      <div className="container">
        <div>
          <h1 className="text-center">Chat App</h1>
        </div>
        <div className="row mt-3">
          <div className="col-md-2"></div>
          <div
            className="col-md-8 card text-center mt-3"
            style={{ border: "none" }}
          >
            <div class="card-header form-control">
              <div className="row">
                <div className="col-md-4">
                  <select
                    name="groups"
                    id="groups"
                    className="form-control"
                    value={room}
                    disabled={!user}
                    onChange={(e) => joinRoom(e)}
                  >
                    <option value="">Select Group</option>
                    <option value="IT">IT</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <input
                    type="text"
                    className="form-control "
                    placeholder="You are Chatting As..."
                    value={user}
                    onChange={(e) => setUser(e.target.value)}
                  />
                </div>
              </div>
            </div>

            <div class="card-body form-control message-container">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`message ${
                    message.sender === user
                      ? "current-user-message"
                      : "other-user-message"
                  }`}
                >
                  <div
                    className={`${
                      message.sender === user ? "text-end" : "text-start"
                    }`}
                  >
                    {message.content}
                  </div>
                  <div
                    className={`${
                      message.sender === user ? "text-end" : "text-start"
                    }`}
                  >
                    <span style={{ fontSize: "12px", color: "black" }}>
                      Sender: {message.sender}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div class="card-footer form-control">
              <form onSubmit={sendMessage}>
                <div className="row">
                  <div className="col-md-10">
                    <input
                      type="text"
                      value={input}
                      className="form-control"
                      disabled={!user}
                      placeholder="Enter your message here"
                      onChange={(e) => setInput(e.target.value)}
                    />
                  </div>
                  <div className="col-md-2">
                    <button
                      type="submit"
                      className="btn"
                      style={{ backgroundColor: "#0892D0" }}
                      disabled={!user}
                    >
                      Send
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
          <div className="col-md-2"></div>
        </div>
      </div>
    </>
  );
};

export default ChatArea;
