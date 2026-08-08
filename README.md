# Placement Resource Hub

Placement Resource Hub is a modern, student-driven platform designed to centralize and democratize interview experiences, preparation resources, and company insights. It replaces scattered WhatsApp forwards with a fully searchable, structured, and AI-powered database.

## 🚀 Features

- **Centralized Experience Database**: Read, search, and filter interview experiences submitted by seniors. Drill down into specific rounds (e.g., Online Assessment, Technical Interview, HR).
- **Resource Repository**: Access curated preparation materials, cheat sheets, and guides sorted by company and role.
- **AI Mock Interview Simulator**: Practice your interview skills with an interactive AI interviewer that provides real-time feedback and critiques based on real company experiences.
- **AI Quiz Generator**: Generate customized, multiple-choice quizzes on any technical topic to test your knowledge before the real interview.
- **AI Summaries**: Automatically generate TL;DR summaries and topic tags for lengthy interview write-ups so you can quickly glean the most important information.
- **PDF Export**: Export structured interview experiences to beautiful PDF documents for offline reading and sharing.
- **Dynamic Theming**: Support for Light, Dark, and a custom Cream aesthetic theme.
- **Secure Authentication**: Seamless user authentication via Clerk.

## 🛠️ Technology Stack

- **Framework**: Next.js 16 (App Router)
- **Styling**: Tailwind CSS & Framer Motion
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenRouter API (Accessing state-of-the-art models like Gemma and Llama)
- **Authentication**: Clerk

## 🚦 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account
- OpenRouter account

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Hanzala044/Placement-Resource-Hub.--Coding-club-.git
   cd "Placement-Resource-Hub.--Coding-club-"
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Environment Setup:**
   Create a `.env.local` file in the root directory and add the following variables:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

   # AI Integration
   OPENROUTER_API_KEY=your_openrouter_api_key

   # Clerk Auth (Optional)
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_publishable_key
   CLERK_SECRET_KEY=your_clerk_secret_key
   ```

4. **Database Setup:**
   In your Supabase SQL Editor, run `sql/schema.sql` first (creates `companies`, `experiences`, `resources`), then every file in `sql/migrations/` **in numeric order** — each one adds to tables the previous step created, so running only the migrations folder on a fresh project will fail.

5. **Start the Development Server:**
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request.

## 📝 License
This project is open-source and available under the MIT License.