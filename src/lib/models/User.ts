import mongoose, { Schema, Model } from "mongoose";

export interface IUser {
  _id: string;
  name: string;
  email: string;
  password?: string;
  image?: string;
  role: "patient" | "doctor" | "admin";
  onboardingCompleted: boolean;
  // Doctor specific
  specialty?: string;
  bio?: string;
  // Patient specific
  gender?: string;
  dob?: Date;
  medicalHistory?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    image: { type: String },
    role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
    onboardingCompleted: { type: Boolean, default: false },
    // Doctor
    specialty: { type: String },
    bio: { type: String },
    // Patient
    gender: { type: String },
    dob: { type: Date },
    medicalHistory: { type: [String], default: [] },
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
