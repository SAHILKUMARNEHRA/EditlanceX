# EditlanceX

**Live Deployment:** [https://editlancex.vercel.app/](https://editlancex.vercel.app/)

EditlanceX is a comprehensive platform designed to bridge the gap between video editors and clients seeking professional editing services. It provides a structured, modern environment for posting jobs, managing applications, and building editor portfolios.

## Key Features

- **Role-Based Dashboards:** Distinct and powerful dashboard experiences for Clients and Editors.
- **Job Posting & Discovery:** Clients can post detailed job requirements (budget, deadline, software tools). Editors can browse and apply to matching jobs.
- **Editor Profiles:** Editors can create detailed profiles showcasing their skills, bio, and portfolio links.
- **Real-Time Notifications:** Live request status updates and notification badges for incoming job applications and direct hiring requests.
- **Hiring Analytics:** Visual breakdown (Pie Charts) of application statistics (Hired, Declined, Pending) on the Client Dashboard.
- **Direct Hiring & Requests:** Clients can browse the editor pool and send direct hiring requests bypassing the job posting process.
- **Secure Authentication:** Complete JWT-based user authentication.

## Tech Stack

- **Frontend:** React (Vite), TypeScript, Tailwind CSS, Shadcn UI, Recharts, Lucide React.
- **Backend:** Node.js, Express.js.
- **Database:** PostgreSQL managed via Prisma ORM (hosted on Neon).
- **Deployment:** Vercel (Frontend) and Render (Backend).

## Getting Started

### Prerequisites

- Node.js (v18 or higher)
- PostgreSQL Database (e.g., Neon)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/SAHILKUMARNEHRA/EditlanceX.git
   cd EditlanceX
   ```

2. **Install dependencies:**
   ```bash
   cd app && npm install
   cd ../backend && npm install
   ```

3. **Set up environment variables:**

   **Backend (`backend/.env`):**
   ```env
   DATABASE_URL="your_postgresql_connection_string"
   JWT_SECRET="your_secure_jwt_secret"
   FRONTEND_URL="http://localhost:5173"
   ```

   **Frontend (`app/.env`):**
   ```env
   VITE_API_URL="http://localhost:5000/api"
   ```

4. **Initialize Database:**
   ```bash
   cd backend
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development servers:**
   
   *Start Backend:*
   ```bash
   cd backend && npm run dev
   ```
   
   *Start Frontend:*
   ```bash
   cd app && npm run dev
   ```

## License

This project is licensed under the MIT License.
