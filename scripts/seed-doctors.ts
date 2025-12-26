import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI || "mongodb+srv://vijenderyadav9498:vijjuyadav@suraksha360.0p7tomi.mongodb.net/";

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String },
  image: { type: String },
  role: { type: String, enum: ["patient", "doctor", "admin"], default: "patient" },
  onboardingCompleted: { type: Boolean, default: false },
  specialty: { type: String },
  bio: { type: String },
  doctorProfile: {
    price: { type: Number, default: 500 },
    consultationDuration: { type: Number, default: 30 },
    qualifications: { type: [String], default: [] },
    experience: { type: Number, default: 0 },
    availability: {
      days: { type: [String], default: ["Mon", "Tue", "Wed", "Thu", "Fri"] },
      startTime: { type: String, default: "09:00" },
      endTime: { type: String, default: "17:00" }
    }
  }
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

const indianDoctors = [
  // Cardiologists
  { name: "Dr. Rajesh Kumar", specialty: "Cardiologist", price: 800, duration: 30, qualifications: ["MBBS", "MD Cardiology", "DM"], experience: 15 },
  { name: "Dr. Priya Sharma", specialty: "Cardiologist", price: 1000, duration: 45, qualifications: ["MBBS", "MD", "FACC"], experience: 20 },
  { name: "Dr. Anil Verma", specialty: "Cardiologist", price: 600, duration: 30, qualifications: ["MBBS", "DNB Cardiology"], experience: 8 },
  
  // Dermatologists
  { name: "Dr. Sneha Patel", specialty: "Dermatologist", price: 500, duration: 20, qualifications: ["MBBS", "MD Dermatology"], experience: 10 },
  { name: "Dr. Vikram Singh", specialty: "Dermatologist", price: 700, duration: 30, qualifications: ["MBBS", "DVD", "DNB"], experience: 12 },
  { name: "Dr. Anjali Gupta", specialty: "Dermatologist", price: 450, duration: 20, qualifications: ["MBBS", "DDVL"], experience: 6 },
  
  // Pediatricians
  { name: "Dr. Suresh Reddy", specialty: "Pediatrician", price: 400, duration: 30, qualifications: ["MBBS", "MD Pediatrics"], experience: 14 },
  { name: "Dr. Kavita Joshi", specialty: "Pediatrician", price: 500, duration: 30, qualifications: ["MBBS", "DCH", "DNB"], experience: 11 },
  { name: "Dr. Ramesh Iyer", specialty: "Pediatrician", price: 350, duration: 20, qualifications: ["MBBS", "DCH"], experience: 5 },
  
  // Psychiatrists
  { name: "Dr. Neha Kapoor", specialty: "Psychiatrist", price: 1200, duration: 60, qualifications: ["MBBS", "MD Psychiatry"], experience: 18 },
  { name: "Dr. Amit Desai", specialty: "Psychiatrist", price: 1000, duration: 45, qualifications: ["MBBS", "DPM", "DNB"], experience: 15 },
  { name: "Dr. Pooja Menon", specialty: "Psychiatrist", price: 800, duration: 45, qualifications: ["MBBS", "MD Psychiatry"], experience: 9 },
  
  // Orthopedists
  { name: "Dr. Sanjay Rao", specialty: "Orthopedist", price: 700, duration: 30, qualifications: ["MBBS", "MS Orthopedics", "DNB"], experience: 16 },
  { name: "Dr. Deepak Nair", specialty: "Orthopedist", price: 600, duration: 30, qualifications: ["MBBS", "MS Orthopedics"], experience: 12 },
  { name: "Dr. Ritu Saxena", specialty: "Orthopedist", price: 550, duration: 20, qualifications: ["MBBS", "DNB Orthopedics"], experience: 7 },
  
  // Neurologists
  { name: "Dr. Ashok Chatterjee", specialty: "Neurologist", price: 1100, duration: 45, qualifications: ["MBBS", "MD", "DM Neurology"], experience: 22 },
  { name: "Dr. Meera Krishnan", specialty: "Neurologist", price: 900, duration: 30, qualifications: ["MBBS", "DM Neurology"], experience: 13 },
  { name: "Dr. Vivek Malhotra", specialty: "Neurologist", price: 850, duration: 30, qualifications: ["MBBS", "DNB Neurology"], experience: 10 },
  
  // General Physicians
  { name: "Dr. Rahul Bose", specialty: "General Physician", price: 300, duration: 20, qualifications: ["MBBS", "MD Medicine"], experience: 8 },
  { name: "Dr. Sunita Agarwal", specialty: "General Physician", price: 350, duration: 20, qualifications: ["MBBS"], experience: 15 },
  { name: "Dr. Kiran Thakur", specialty: "General Physician", price: 250, duration: 15, qualifications: ["MBBS", "PGDM"], experience: 5 },
  
  // Gynecologists
  { name: "Dr. Lakshmi Venkatesh", specialty: "Gynecologist", price: 600, duration: 30, qualifications: ["MBBS", "MS OBG", "DNB"], experience: 17 },
  { name: "Dr. Shweta Pillai", specialty: "Gynecologist", price: 700, duration: 30, qualifications: ["MBBS", "MD OBG"], experience: 14 },
  { name: "Dr. Preeti Chauhan", specialty: "Gynecologist", price: 500, duration: 30, qualifications: ["MBBS", "DGO"], experience: 9 },
  
  // ENT Specialists
  { name: "Dr. Manoj Bhatt", specialty: "ENT Specialist", price: 450, duration: 20, qualifications: ["MBBS", "MS ENT"], experience: 11 },
  { name: "Dr. Ananya Das", specialty: "ENT Specialist", price: 400, duration: 20, qualifications: ["MBBS", "DNB ENT"], experience: 7 },
  { name: "Dr. Rohit Mishra", specialty: "ENT Specialist", price: 500, duration: 30, qualifications: ["MBBS", "MS ENT", "Fellowship"], experience: 13 },
  
  // Ophthalmologists
  { name: "Dr. Shalini Mathur", specialty: "Ophthalmologist", price: 550, duration: 30, qualifications: ["MBBS", "MS Ophthalmology"], experience: 12 },
  { name: "Dr. Gaurav Pandey", specialty: "Ophthalmologist", price: 600, duration: 30, qualifications: ["MBBS", "DNB Ophthalmology", "FICO"], experience: 15 },
  { name: "Dr. Nandini Srinivasan", specialty: "Ophthalmologist", price: 450, duration: 20, qualifications: ["MBBS", "DO"], experience: 6 },
  
  // Dentists
  { name: "Dr. Aakash Mehta", specialty: "Dentist", price: 400, duration: 30, qualifications: ["BDS", "MDS"], experience: 10 },
  { name: "Dr. Divya Kulkarni", specialty: "Dentist", price: 350, duration: 20, qualifications: ["BDS"], experience: 5 },
  { name: "Dr. Nikhil Bansal", specialty: "Dentist", price: 500, duration: 30, qualifications: ["BDS", "MDS Orthodontics"], experience: 12 },
  
  // Gastroenterologists
  { name: "Dr. Harish Chadha", specialty: "Gastroenterologist", price: 900, duration: 30, qualifications: ["MBBS", "MD", "DM Gastro"], experience: 18 },
  { name: "Dr. Pallavi Hegde", specialty: "Gastroenterologist", price: 800, duration: 30, qualifications: ["MBBS", "DNB Gastro"], experience: 11 },
  
  // Endocrinologists
  { name: "Dr. Tarun Sethi", specialty: "Endocrinologist", price: 750, duration: 30, qualifications: ["MBBS", "MD", "DM Endocrinology"], experience: 14 },
  { name: "Dr. Archana Deshpande", specialty: "Endocrinologist", price: 850, duration: 45, qualifications: ["MBBS", "DM Endocrinology"], experience: 16 },
  
  // Pulmonologists
  { name: "Dr. Vijay Naidu", specialty: "Pulmonologist", price: 650, duration: 30, qualifications: ["MBBS", "MD Pulmonology", "DNB"], experience: 13 },
  { name: "Dr. Smita Roy", specialty: "Pulmonologist", price: 700, duration: 30, qualifications: ["MBBS", "DM Pulmonology"], experience: 10 },
];

async function seedDoctors() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log("Connected to MongoDB");

    const hashedPassword = await bcrypt.hash("asdasd", 10);

    for (const doc of indianDoctors) {
      const email = doc.name.toLowerCase().replace("dr. ", "").replace(/ /g, "") + "@gmail.com";
      
      // Check if doctor already exists
      const existing = await User.findOne({ email });
      if (existing) {
        console.log(`Skipping ${doc.name} - already exists`);
        continue;
      }

      await User.create({
        name: doc.name,
        email,
        password: hashedPassword,
        role: "doctor",
        specialty: doc.specialty,
        bio: `${doc.name} is an experienced ${doc.specialty} with ${doc.experience} years of practice. Specializing in comprehensive patient care and modern treatment approaches.`,
        onboardingCompleted: true,
        doctorProfile: {
          price: doc.price,
          consultationDuration: doc.duration,
          qualifications: doc.qualifications,
          experience: doc.experience,
          availability: {
            days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            startTime: "09:00",
            endTime: "18:00"
          }
        }
      });

      console.log(`Created: ${doc.name} (${doc.specialty}) - ₹${doc.price}`);
    }

    console.log("\n✅ Seeding complete! Added", indianDoctors.length, "doctors");
    
    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("Error seeding doctors:", error);
    process.exit(1);
  }
}

seedDoctors();
