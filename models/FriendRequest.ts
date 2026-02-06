import mongoose, { Schema } from "mongoose";

export type FriendRequestDocument = {
  _id: mongoose.Types.ObjectId;
  requesterId: string;
  recipientId: string;
  status: "pending" | "accepted" | "declined";
  createdAt: Date;
  updatedAt: Date;
};

const FriendRequestSchema = new Schema<FriendRequestDocument>(
  {
    requesterId: { type: String, required: true, index: true },
    recipientId: { type: String, required: true, index: true },
    status: {
      type: String,
      enum: ["pending", "accepted", "declined"],
      default: "pending",
      required: true,
    },
  },
  { timestamps: true }
);

FriendRequestSchema.index({ requesterId: 1, recipientId: 1 }, { unique: true });
FriendRequestSchema.index({ recipientId: 1, status: 1 });

const FriendRequestModel =
  (mongoose.models.FriendRequest as mongoose.Model<FriendRequestDocument>) ||
  mongoose.model<FriendRequestDocument>("FriendRequest", FriendRequestSchema);

export default FriendRequestModel;
