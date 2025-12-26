import mongoose, { Schema, Model, Document } from "mongoose";
import { IUser } from "./User";

export interface IInstantMeeting extends Document {
  patientId: Schema.Types.ObjectId | IUser;
  doctorId?: Schema.Types.ObjectId | IUser;
  specialty: string;
  status: "waiting" | "matched" | "in-progress" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed";
  amount: number;
  meetingLink?: string;
  notes?: string;
  rating?: number;
  review?: string;
  transcription?: string;
  summary?: {
    english: string;
    hindi: string;
    generatedAt: Date;
  };
  matchedAt?: Date;
  completedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const InstantMeetingSchema = new Schema<IInstantMeeting>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User" },
    specialty: { type: String, required: true },
    status: { 
      type: String, 
      enum: ["waiting", "matched", "in-progress", "completed", "cancelled"], 
      default: "waiting" 
    },
    paymentStatus: { 
      type: String, 
      enum: ["pending", "paid", "failed"], 
      default: "pending" 
    },
    amount: { type: Number, required: true, default: 1500 },
    meetingLink: { type: String },
    notes: { type: String },
    rating: { type: Number, min: 1, max: 5 },
    review: { type: String },
    transcription: { type: String },
    summary: {
      english: { type: String },
      hindi: { type: String },
      generatedAt: { type: Date },
    },
    matchedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

// Index for quick lookups
InstantMeetingSchema.index({ status: 1, specialty: 1 });
InstantMeetingSchema.index({ patientId: 1, status: 1 });
InstantMeetingSchema.index({ doctorId: 1, status: 1 });

export const InstantMeeting: Model<IInstantMeeting> =
  mongoose.models.InstantMeeting || mongoose.model<IInstantMeeting>("InstantMeeting", InstantMeetingSchema);
