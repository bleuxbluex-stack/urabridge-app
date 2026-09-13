# Ura (UriBridge) - German Language Learning App

**Ura** is a modern, cross-platform mobile and web application built with **React Native / Expo** and **Supabase**, specifically designed for Albanian speakers to learn German (**sq → de**) through contrastive didactics, interactive exercises, audio listening, and voice pronunciation practice.

---

## 🌟 Key Features

- **Contrastive Didactics (`sq → de`)**: Tailored lessons comparing German grammar rules (*der/die/das*, cases, sentence order) in Albanian context.
- **Interactive Exercise Engine**:
  - Vocabulary Flashcards with Audio
  - Multiple Choice Questions
  - Fill-in-the-Blank Grammar Exercises
  - Sentence Reordering & Word Puzzles
  - Translation Exercises
  - **Speech & Pronunciation Practice**: Built-in 100% free voice-to-text recognition with **Easy**, **Medium**, and **Hard** difficulty levels.
- **Spaced Repetition System (SRS)**: Smart review algorithm for vocabulary retention.
- **Gamification & Habit Building**: Daily Streaks, XP Points, Achievements & Badges, and customizable Daily Goals.
- **Authentication & User Profiles**: Supabase Auth integration with profile customization.
- **Bilingual Interface**: Dual language support (Albanian & English).

---

## 🚀 Tech Stack

- **Frontend**: React Native, Expo SDK 57, Expo Router, TypeScript, React 19, Lucide Icons, Reanimated.
- **Backend**: Supabase (PostgreSQL, Row-Level Security, Auth).
- **Audio & Speech**: Expo Audio/AV + Web Speech API.
- **Deployment**: Netlify Proxy setup for Web hosting.

---

## ⚙️ Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/bleuxbluex-stack/urabridge-app.git
   cd urabridge-app
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Environment Variables:
   Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
   Fill in your Supabase credentials (`EXPO_PUBLIC_SUPABASE_URL` and `EXPO_PUBLIC_SUPABASE_ANON_KEY`).

4. Run locally:
   ```bash
   npm run start
   ```

---

## 📄 License

Private Repository - All Rights Reserved.
