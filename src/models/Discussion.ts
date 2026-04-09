import mongoose, { Schema, Document, Types } from "mongoose";

export interface IDiscussion extends Document {
  title: string;
  content: string;
  authorId: Types.ObjectId;
  tags: string[];
  viewCount: number;
  likeCount: number;
  commentCount: number;
  isPinned: boolean;
  isLocked: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const DiscussionSchema = new Schema<IDiscussion>(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    authorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    tags: [{ type: String }],
    viewCount: { type: Number, default: 0 },
    likeCount: { type: Number, default: 0 },
    commentCount: { type: Number, default: 0 },
    isPinned: { type: Boolean, default: false },
    isLocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Indexes
DiscussionSchema.index({ createdAt: -1 });
DiscussionSchema.index({ authorId: 1 });
DiscussionSchema.index({ tags: 1 });

export default mongoose.models.Discussion || mongoose.model<IDiscussion>("Discussion", DiscussionSchema);
