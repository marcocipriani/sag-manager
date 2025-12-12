# 🏍️ SagManager

**SagManager** is a Progressive Web App (PWA) designed for motorcycle track day enthusiasts. It replaces the traditional paper "setup sheets" with a mobile-first interface optimized for quick data entry in the pit box.

🔗 [Project Demo](https://sag-manager.vercel.app/)

![Project Status](https://img.shields.io/badge/Status-In%20Development-orange)
![License](https://img.shields.io/badge/License-MIT-blue)

## 🎯 The Goal

Every rider knows the struggle: you adjust your fork compression, go out for a session, come back, and forget what you changed. Paper sheets get lost, dirty with grease, or destroyed by rain.

**SagManager allows you to:**
1.  **Digitize your garage:** Keep track of multiple bikes.
2.  **Smart Inputs:** Adjust values (clicks, preload turns, tire pressure) using large `+` / `-` buttons. No tiny keyboards needed while wearing gloves.
3.  **Inherit Settings:** Every new session starts with the previous session's setup. Just tweak what changed.
4.  **Visualize History:** See how your setup evolved throughout the day.
5.  **Export to PDF:** Generate a professional report to print or share.

## 🛠️ Tech Stack

Built with a modern, scalable, and performance-focused stack:

-   **Frontend:** [Next.js 14](https://nextjs.org/) (App Router)
-   **Styling:** [Tailwind CSS](https://tailwindcss.com/) + [Shadcn/UI](https://ui.shadcn.com/)
-   **Backend & Auth:** [Supabase](https://supabase.com/) (PostgreSQL)
-   **Icons:** [Lucide React](https://lucide.dev/)
-   **PDF Generation:** `jspdf`

## 🚀 Getting Started

### Prerequisites

-   Node.js 18+
-   A [Supabase](https://supabase.com/) account (Free tier is fine)

### Installation

1.  **Clone the repo**
    ```bash
    git clone [https://github.com/YOUR_USERNAME/sag-manager.git](https://github.com/YOUR_USERNAME/sag-manager.git)
    cd sag-manager
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Variables**
    Create a `.env.local` file in the root directory and add your Supabase credentials:
    ```env
    NEXT_PUBLIC_SUPABASE_URL=your_project_url
    NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
    ```

4.  **Database Setup**
    Run the SQL script found in `supabase/schema.sql` (or check the docs) inside your Supabase SQL Editor to create the `bikes`, `track_days`, and `sessions` tables.

5.  **Run the App**
    ```bash
    npm run dev
    ```
    Open [http://localhost:3000](http://localhost:3000) with your browser.

## 📱 Features Breakdown

### 🔧 Suspension Management
Detailed tracking for both Fork and Shock:
-   **Spring Rate (K)**
-   **Preload** (mm or turns)
-   **Compression & Rebound** (clicks)
-   **Static & Dynamic Sag**

### 📐 Geometry & Tires
-   Track Wheelbase, Rake, and Trail.
-   Log tire compounds and hot/cold pressures.

## 🤝 Contributing

Contributions are welcome! Please open an issue or submit a pull request for any bugs or features.

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📄 License

Distributed under the MIT License.
