import express from "express";
import mongoose from "mongoose";
import userRoute from "./routes/user.routes.js";
import postRoute from "./routes/post.routes.js";
import cors from "cors";
import { Server } from "socket.io";
import http from "http";
import dotenv from "dotenv";
dotenv.config();

const PORT = process.env.MONGO_URL || 9000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "https://pixora-plum.vercel.app/",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static("uploads"));

app.use(userRoute);
app.use(postRoute);

app.get("/", (req, res) => {
  res.send("Hello World");
});

const dbUrl = process.env.MONGO_URL;
main()
  .then(() => console.log("Connected to Atlas DB Pixora"))
  .catch((err) => console.log("MongoDB connection error:", err));

async function main() {
  await mongoose.connect(dbUrl);
}

io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    console.log(`User joined room: ${roomId}`);
  });

  socket.on("send-message", (data) => {
    io.to(data.roomId).emit("receive-message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(9000, () => {
  console.log("Server is listening on port 9000");
});
