import mongoose, { Schema } from "mongoose";

export type UserDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  email: string;
  passwordHash: string;
  avatarUrl?: string;
  likedUserIds?: string[];
  dislikedUserIds?: string[];
  blockedUserIds?: string[];
  createdAt: Date;
  updatedAt: Date;
};

const UserSchema = new Schema<UserDocument>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, trim: true, unique: true, lowercase: true },
    passwordHash: { type: String, required: true },
    avatarUrl: { type: String, required: false, trim: true },
    likedUserIds: { type: [String], required: false, default: [] },
    dislikedUserIds: { type: [String], required: false, default: [] },
    blockedUserIds: { type: [String], required: false, default: [] },
  },
  { timestamps: true }
);

const UserModel =
  (mongoose.models.User as mongoose.Model<UserDocument>) ||
  mongoose.model<UserDocument>("User", UserSchema);

export default UserModel;
