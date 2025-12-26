# MediMaven 🏥 - Next-Gen Telehealth Platform

![MediMaven Banner](public/assets/screenshots/home.png)

> **Hackathon Track**: Use Case 2 – Telehealth Solution for Access to Healthcare from Anywhere.

MediMaven is a cutting-edge **Telehealth platform** designed to bridge the gap between patients and healthcare providers, ensuring instant, secure, and accessible medical consultations from the comfort of your home. Built for the modern world, it integrates advanced video conferencing, real-time transcription, and secure payment processing to deliver a seamless healthcare experience.

---

## 🚀 Key Features & Hackathon Requirements

This project directly addresses the hackathon problem statement by implementing the following core solutions:

### 1. 📹 Instant Video Consultations (Daily.co)
**"Instant access to Health consultation similar to in person experience"**
- High-definition, low-latency video calls powered by **Daily.co WebRTC**.
- Secure, HIPAA-compliant video rooms generated dynamically for each appointment.
- Screen sharing and in-call chat support for better diagnosis.

### 2. 💳 Integrated Payments (Square Up)
**"Ability to accept payment for the Telehealth consultation before the actual consultation begins"**
- Seamless payment gateway integration using **Square Up**.
- Patients can securely pay for consultations upfront.
- Supports credit/debit cards and digital wallets.

### 3. 📝 Live Transcription & AI Summary (DeepGram & OpenRouter)
**"Overcome challenges of difference in dialect/ accent in remote consultation via a transcription service"**
- **DeepGram**: Real-time, medical-grade speech-to-text transcription during video calls to ensure no detail is missed, regardless of accents or dialects.
- **OpenRouter (LLM)**: Generates intelligent post-consultation summaries from the transcript, highlighting key diagnosis points, prescriptions, and follow-up actions.

## 📸 Application Screenshots

### Home Page
The landing page featuring our mission, services, and easy navigation.
![Home Page](public/assets/screenshots/home.png)

### Key Features
Overview of our platform's capabilities.
![Features](public/assets/screenshots/features.png)

### Doctor Search
Find the right specialist with ease.
![Find Doctors](public/assets/screenshots/doctors.png)

### Patient Dashboard
Manage appointments, view medical history, and join calls.
> *[Insert Patient Dashboard Screenshot Here]*

### Doctor Dashboard
Manage availability, view upcoming consultations, and patient records.
> *[Insert Doctor Dashboard Screenshot Here]*

### Secure Video Consultation
The heart of MediMaven - where the consultation happens.
> *[Insert Video Call Session Screenshot Here]*

### Smart Review & Summary
AI-generated summary of the consultation for future reference.
> *[Insert Review Page Screenshot Here]*

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router), React, TailwindCSS, Framer Motion
- **Backend / DB**: Node.js, MongoDB (Mongoose)
- **Authentication**: NextAuth.js (Custom Credentials & JWT)
- **Video / Audio**: Daily.co API
- **Payments**: Square Web Payments SDK
- **AI & ML**: 
  - **DeepGram** (Transcription)
  - **OpenRouter** (AI Summaries)
  - **Google Cloud Platform** (Maps & Natural Language)

---

## 🏁 Getting Started

### Prerequisites
- Node.js (v18+)
- MongoDB connection string
- API Keys for Daily.co, Square, DeepGram, and OpenRouter.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/medimaven.git
   cd medimaven
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up Environment Variables**
   Create a `.env.local` file and add:
   ```env
   # Database
   MONGODB_URI=your_mongodb_uri

   # Auth
   AUTH_SECRET=your_auth_secret

   # Daily.co (Video)
   DAILY_API_KEY=your_daily_key

   # Square (Payments)
   NEXT_PUBLIC_SQUARE_APP_ID=your_app_id
   NEXT_PUBLIC_SQUARE_LOCATION_ID=your_location_id
   SQUARE_ACCESS_TOKEN=your_access_token

   # AI Services
   DEEPGRAM_API_KEY=your_deepgram_key
   OPENROUTER_API_KEY=your_openrouter_key
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open the app**
   Visit `http://localhost:3000` to see the application in action.

---

## 👥 Contributors

- **Vijender Yadav** - *Full Stack Developer*

---
