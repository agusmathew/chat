const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    chatId: { type: String, required: true, index: true },
    text: { type: String, required: true, trim: true },
    senderId: { type: String, required: true, trim: true },
    senderName: { type: String, required: true, trim: true },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Message || mongoose.model("Message", MessageSchema);
