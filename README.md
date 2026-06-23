<div align="center">
  <img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# ZenStudy 🧘‍♂️

**ZenStudy** is a psychology-aware academic assistant and productivity workspace designed to help students optimize their learning, manage exam stress, and build sustainable study habits.

Unlike traditional planners, ZenStudy actively adapts to your focus profile, tracks your study consistency, and provides personalized AI coaching to prevent burnout before it happens.

---

## 🌟 Key Features

* **Zen AI Tutor**: A personalized intelligent coach offering actionable insights into your learning profile, academic diagnosis, and burnout/stress levels.
* **Productivity Workspace**: A centralized dashboard featuring daily agendas, study goal tracking, task lists, and upcoming exam countdowns.
* **Adaptive AI Planner**: Dynamically generates study roadmaps customized to your available time and current academic stress levels.
* **Note Archive**: Upload and process your study materials. The AI simplifier summarizes complex notes into digestible formats.
* **Strategies Toolbox**: Discover and implement proven learning frameworks like the Pomodoro technique, Feynman technique, and active recall.
* **Gamification & Streaks**: Build consistency through daily study streaks, unlock achievements, earn XP, and utilize "Streak Freezes" when you need a well-deserved break.
* **Mood & Stress Tracking**: Daily check-ins help the AI gauge your current cognitive load and adjust recommendations accordingly.

## 🛠️ Tech Stack

* **Frontend**: React 19, TypeScript, Vite
* **Styling**: Tailwind CSS (with Glassmorphism and modern UI patterns)
* **Backend / Auth**: Firebase Authentication & Local Storage for robust offline capabilities
* **AI Integration**: Google Gemini API via `@google/genai`
* **Data Visualization**: Recharts
* **Markdown Rendering**: React Markdown & Remark GFM

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org/en/) (v18 or higher recommended)
* A [Google Gemini API Key](https://aistudio.google.com/app/apikey)
* (Optional) Firebase Project for Authentication services

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/zenstudy.git
   cd zenstudy
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Environment Variables:**
   Create a `.env.local` file in the root of the project and add your Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```
   *(If using full Firebase Auth, ensure your Firebase credentials are also configured in your `firebase.ts` file).*

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Build for Production:**
   ```bash
   npm run build
   ```

## ⚖️ Legal

By using ZenStudy, you agree to our terms and conditions. The application features a mandatory consent modal on the first visit to ensure compliance with our:
* [Terms of Service](public/policies/terms-of-service.md)
* [Privacy Policy](public/policies/privacy-policy.md)
* [Cookie Policy](public/policies/cookie-policy.md)

---
<div align="center">
  <b>Developed by B A FAREED AHAMED</b><br>
  <i>With care for the help in student performance</i><br><br>
  <a href="https://github.com/fareedahamed0425-code">GitHub</a> • <a href="https://bafareedahamedportfolio.netlify.app/">Portfolio</a>
</div>
