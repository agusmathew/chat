require("dotenv").config();

const http = require("http");
const next = require("next");
const { Server } = require("socket.io");
const mongoose = require("mongoose");
const Message = require("./models/Message");

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

const connectMongo = async () => {
  if (!MONGODB_URI) {
    throw new Error("Missing MONGODB_URI environment variable.");
  }
  if (mongoose.connection.readyState >= 1) return;
  await mongoose.connect(MONGODB_URI);
};

app.prepare().then(async () => {
  await connectMongo();

  const server = http.createServer((req, res) => handle(req, res));
  const io = new Server(server, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", async (socket) => {
    socket.on("join", async (payload) => {
      const chatId = String(payload?.chatId ?? "");
      if (!chatId) return;
      socket.join(chatId);
      const history = await Message.find({ chatId })
        .sort({ createdAt: -1 })
        .limit(50)
        .lean();
      socket.emit("history", history.reverse());
    });

    socket.on("message", async (payload) => {
      const chatId = String(payload?.chatId ?? "");
      const text = String(payload?.text ?? "").trim();
      const senderId = String(payload?.senderId ?? "");
      const senderName = String(payload?.senderName ?? "User");
      if (!chatId || !text || !senderId) return;
      const message = await Message.create({
        chatId,
        text,
        senderId,
        senderName,
      });
      io.to(chatId).emit("message", message);
    });
  });

  server.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
});
