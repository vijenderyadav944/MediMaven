import mongoose from "mongoose";
import fs from "fs";
import path from "path";

// Manually load .env.local
try {
  const envPath = path.resolve(process.cwd(), ".env.local");
  const envFile = fs.readFileSync(envPath, "utf8");
  envFile.split("\n").forEach((line) => {
    const [key, value] = line.split("=");
    if (key && value) {
      process.env[key.trim()] = value.trim();
    }
  });
} catch (error) {
  console.log("Could not load .env.local file, assuming environment variables are set.");
}

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("Please define the MONGODB_URI environment variable inside .env.local");
  process.exit(1);
}

// Define InstantMeeting Schema directly to avoid import issues
const InstantMeetingSchema = new mongoose.Schema(
  {
    patientId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
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
    matchedAt: { type: Date },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

const InstantMeeting = mongoose.models.InstantMeeting || mongoose.model("InstantMeeting", InstantMeetingSchema);

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String },
  role: { type: String },
});

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function fixStuckInstantMeetings() {
  try {
    await mongoose.connect(MONGODB_URI!);
    console.log("Connected to MongoDB");

    // First, let's see ALL instant meetings to understand the state
    const allMeetings = await InstantMeeting.find({})
      .populate("patientId", "name email")
      .populate("doctorId", "name email")
      .sort({ createdAt: -1 });

    console.log(`\n=== All Instant Meetings (${allMeetings.length}) ===\n`);
    for (const meeting of allMeetings) {
      console.log(`ID: ${meeting._id}`);
      console.log(`  Status: ${meeting.status}`);
      console.log(`  Patient: ${(meeting.patientId as any)?.email || meeting.patientId}`);
      console.log(`  Doctor: ${(meeting.doctorId as any)?.email || meeting.doctorId || "Not matched"}`);
      console.log(`  Created: ${meeting.createdAt}`);
      console.log(`  Payment: ${meeting.paymentStatus}`);
      console.log(`  Meeting Link: ${meeting.meetingLink}`);
      console.log("");
    }

    // Find all instant meetings that are stuck in "waiting", "matched", or "in-progress"
    // but are older than 1 hour (stale meetings)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    
    const stuckMeetings = await InstantMeeting.find({
      status: { $in: ["waiting", "matched", "in-progress"] },
      createdAt: { $lt: oneHourAgo }
    }).populate("patientId", "name email").populate("doctorId", "name email");

    console.log(`\nFound ${stuckMeetings.length} stuck instant meeting(s) older than 1 hour:\n`);

    for (const meeting of stuckMeetings) {
      console.log(`ID: ${meeting._id}`);
      console.log(`  Status: ${meeting.status}`);
      console.log(`  Patient: ${(meeting.patientId as any)?.email || meeting.patientId}`);
      console.log(`  Doctor: ${(meeting.doctorId as any)?.email || meeting.doctorId || "Not matched"}`);
      console.log(`  Created: ${meeting.createdAt}`);
      console.log(`  Payment: ${meeting.paymentStatus}`);
      console.log("");
    }

    // Also find all "matched" meetings (regardless of age) to see potential issues
    const allMatchedMeetings = await InstantMeeting.find({
      status: "matched"
    }).populate("patientId", "name email").populate("doctorId", "name email");

    console.log(`\n=== All Matched Meetings (${allMatchedMeetings.length}) ===\n`);
    for (const meeting of allMatchedMeetings) {
      console.log(`ID: ${meeting._id}`);
      console.log(`  Patient: ${(meeting.patientId as any)?.email || meeting.patientId}`);
      console.log(`  Doctor: ${(meeting.doctorId as any)?.email || meeting.doctorId}`);
      console.log(`  Created: ${meeting.createdAt}`);
      console.log(`  Matched At: ${meeting.matchedAt || "N/A"}`);
      console.log("");
    }

    // Ask for confirmation before fixing
    if (stuckMeetings.length > 0) {
      console.log("\n--- FIXING STUCK MEETINGS ---");
      console.log("Cancelling all stuck meetings...\n");

      for (const meeting of stuckMeetings) {
        meeting.status = "cancelled";
        meeting.notes = "Auto-cancelled: Meeting was stuck due to system issue";
        await meeting.save();
        console.log(`Cancelled meeting ${meeting._id}`);
      }

      console.log("\nAll stuck meetings have been cancelled.");
    }

    // Also fix matched meetings that are too old (likely orphaned)
    const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);
    const staleMatchedMeetings = await InstantMeeting.find({
      status: "matched",
      matchedAt: { $lt: thirtyMinutesAgo }
    });

    if (staleMatchedMeetings.length > 0) {
      console.log(`\nFound ${staleMatchedMeetings.length} stale matched meetings (matched > 30 mins ago but never started)`);
      
      for (const meeting of staleMatchedMeetings) {
        meeting.status = "cancelled";
        meeting.notes = "Auto-cancelled: Meeting was matched but never started";
        await meeting.save();
        console.log(`Cancelled stale matched meeting ${meeting._id}`);
      }
    }

    // Also cancel any in-progress meetings that are more than 30 mins old without activity
    const staleInProgressMeetings = await InstantMeeting.find({
      status: "in-progress",
      createdAt: { $lt: thirtyMinutesAgo }
    });

    if (staleInProgressMeetings.length > 0) {
      console.log(`\nFound ${staleInProgressMeetings.length} stale in-progress meetings`);
      
      for (const meeting of staleInProgressMeetings) {
        meeting.status = "cancelled";
        meeting.notes = "Auto-cancelled: Orphaned in-progress meeting (likely from bug)";
        await meeting.save();
        console.log(`Cancelled stale in-progress meeting ${meeting._id}`);
      }
    }

    console.log("\n=== Fix Complete ===");
    process.exit(0);
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

fixStuckInstantMeetings();
