import mongoose, { Schema, Model, Document } from "mongoose";

export interface IMessage extends Document {
  appointmentId: Schema.Types.ObjectId;
  senderId: Schema.Types.ObjectId;
  receiverId: Schema.Types.ObjectId;
  content: string;
  type: "text" | "image" | "file";
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>(
  {
    appointmentId: { type: Schema.Types.ObjectId, ref: "Appointment", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    receiverId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, required: true },
    type: { type: String, enum: ["text", "image", "file"], default: "text" },
    read: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Index for efficient querying
MessageSchema.index({ appointmentId: 1, createdAt: 1 });

export const Message: Model<IMessage> =
  mongoose.models.Message || mongoose.model<IMessage>("Message", MessageSchema);
