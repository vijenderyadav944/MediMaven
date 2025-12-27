import mongoose, { Schema, Model, Document } from "mongoose";
import { IUser } from "./User";

export interface IAppointment extends Document {
  patientId: Schema.Types.ObjectId | IUser;
  doctorId: Schema.Types.ObjectId | IUser;
  date: Date;
  duration: number; // in minutes
  status: "scheduled" | "completed" | "cancelled";
  paymentStatus: "pending" | "paid" | "failed" | "refunded";
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
  createdAt: Date;
  updatedAt: Date;
}

const AppointmentSchema = new Schema<IAppointment>(
  {
    patientId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true },
    duration: { type: Number, default: 30 },
    status: { type: String, enum: ["scheduled", "completed", "cancelled"], default: "scheduled" },
    paymentStatus: { type: String, enum: ["pending", "paid", "failed", "refunded"], default: "pending" },
    amount: { type: Number, required: true },
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
  },
  { timestamps: true }
);

export const Appointment: Model<IAppointment> =
  mongoose.models.Appointment || mongoose.model<IAppointment>("Appointment", AppointmentSchema);
