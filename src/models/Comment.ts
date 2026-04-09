import mongoose, { Schema, Document, Types } from "mongoose";

export interface IComment extends Document {
  discussionId: Types.ObjectId;
  parentId?: Types.ObjectId;
  content: string;
  authorId: Types.ObjectId;
  likeCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema = new Schema<IComment>(
  {
    discussionId: { type: Schema.Types.ObjectId, ref: "Discussion", required: true },
    parentId: { type: Schema.Types.ObjectId, ref: "Comment" },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    likeCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Indexes
CommentSchema.index({ discussionId: 1, createdAt: 1 });
CommentSchema.index({ parentId: 1 });

export default mongoose.models.Comment || mongoose.model<IComment>("Comment", CommentSchema);
