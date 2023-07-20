const express = require("express");
const http = require("http");
const socketIO = require("socket.io");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type"],
    credentials: true,
  },
});
app.use(cors());

mongoose
  .connect(
    "mongodb+srv://UpadhyayParth:upadhyayparth123@cluster0.isld67k.mongodb.net/contentblogwebsite",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

const messageSchema = new mongoose.Schema({
  sender: String,
  content: String,
  timestamp: { type: Date, default: Date.now },
  room: String,
});

const Message = mongoose.model("Message", messageSchema);

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("joinRoom", async (room) => {
    socket.leaveAll();
    socket.join(room);
    console.log(`User joined room: ${room}`);

    // Fetch old messages from the database for the room
    try {
      const messages = await Message.find({ room });
      console.log(messages, "messages");
      socket.emit("oldMessages", messages);
      // Clear messages from the previous room
      socket.emit("clearMessages");
    } catch (error) {
      console.error("Error fetching old messages:", error);
    }
  });

  socket.on("chatMessage", (data) => {
    console.log("Received message:", data);

    const message = new Message(data);
    message.save();

    io.to(data.room).emit("chatMessage", data);
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected");
  });
});

server.listen(4000, () => {
  console.log("Server is running on port 4000");
});
