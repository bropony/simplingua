import mongoose, { Schema, Document, Types } from "mongoose";

export interface ILike extends Document {
  userId: Types.ObjectId;
  targetType: "discussion" | "comment";
  targetId: Types.ObjectId;
  createdAt: Date;
}

const LikeSchema = new Schema<ILike>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    targetType: { type: String, enum: ["discussion", "comment"], required: true },
    targetId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

// Prevent duplicate likes
LikeSchema.index({ userId: 1, targetType: 1, targetId: 1 }, { unique: true });

export default mongoose.models.Like || mongoose.model<ILike>("Like", LikeSchema);
