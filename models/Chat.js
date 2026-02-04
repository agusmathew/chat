const mongoose = require("mongoose");

const ChatSchema = new mongoose.Schema(
  {
    participants: {
      type: [String],
      required: true,
    },
  },
  { timestamps: true }
);

ChatSchema.index({ participants: 1 }, { unique: true });

module.exports = mongoose.models.Chat || mongoose.model("Chat", ChatSchema);
