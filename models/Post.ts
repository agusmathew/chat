import mongoose, { Schema } from "mongoose";

export type PostDocument = {
  _id: mongoose.Types.ObjectId;
  userId: string;
  imageUrl: string;
  caption?: string;
  createdAt: Date;
  updatedAt: Date;
};

const PostSchema = new Schema<PostDocument>(
  {
    userId: { type: String, required: true, index: true },
    imageUrl: { type: String, required: true, trim: true },
    caption: { type: String, required: false, trim: true },
  },
  { timestamps: true }
);

PostSchema.index({ createdAt: -1 });

const PostModel =
  (mongoose.models.Post as mongoose.Model<PostDocument>) ||
  mongoose.model<PostDocument>("Post", PostSchema);

export default PostModel;
