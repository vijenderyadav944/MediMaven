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

  // Doctor Profile
  doctorProfile?: {
    price: number;
    consultationDuration: number; // in minutes
    qualifications: string[];
    experience: number; // years
    availability: {
      days: string[]; // ["Mon", "Tue"...]
      startTime: string; // "09:00"
      endTime: string; // "17:00"
    };
  };
  // Patient specific
  gender?: string;
  dob?: Date;
  medicalHistory?: string[];
  // Patient Health Profile
  healthProfile?: {
    bloodGroup?: string;
    allergies?: string[];
    chronicConditions?: string[];
    medications?: string[]; // current medications
    lastVisit?: Date;
    emergencyContact?: {
      name: string;
      relation: string;
      phone: string;
    };
  };
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
    // Doctor Basic
    specialty: { type: String },
    bio: { type: String },
    // Patient Basic
    gender: { type: String },
    dob: { type: Date },
    medicalHistory: { type: [String], default: [] },

    // Extended Profiles
    doctorProfile: {
      price: { type: Number, default: 50 },
      consultationDuration: { type: Number, default: 30 },
      qualifications: { type: [String], default: [] },
      experience: { type: Number, default: 0 },
      availability: {
        days: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
        startTime: { type: String, default: "09:00" },
        endTime: { type: String, default: "17:00" }
      }
    },

    healthProfile: {
      bloodGroup: { type: String },
      allergies: { type: [String], default: [] },
      chronicConditions: { type: [String], default: [] },
      medications: { type: [String], default: [] },
      lastVisit: { type: Date },
      emergencyContact: {
        name: { type: String },
        relation: { type: String },
        phone: { type: String }
      }
    }
  },
  { timestamps: true }
);

export const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", UserSchema);
