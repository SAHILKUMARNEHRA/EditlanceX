# EditlanceX

EditlanceX is a comprehensive platform designed for video editors and clients to collaborate effectively. It provides a structured environment for posting editing jobs, managing applications, and building editor portfolios.

## Key Features

- Client Dashboard: Manage posted jobs and review editor applications.
- Editor Dashboard: Browse available projects and track active applications.
- Job Posting System: Detailed project requirements including budget, deadline, and software needs.
- Editor Profiles: Professional profiles featuring bios, skills, and portfolio links.
- Google Authentication: Secure and easy login/signup process for all users.
- Database Integration: Powered by Neon PostgreSQL for reliable data management.

## Tech Stack

- Frontend: React with Vite, Tailwind CSS, and Shadcn UI.
- Backend: Node.js with Express.
- Database: PostgreSQL with Prisma ORM.
- Authentication: JWT and Google OAuth 2.0.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- A Neon PostgreSQL account
- Google Cloud Console project for OAuth

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/SAHILKUMARNEHRA/EditlanceX.git
   ```

2. Install dependencies for both frontend and backend:
   ```bash
   cd app && npm install
   cd ../backend && npm install
   ```

3. Set up environment variables:
   Create a .env file in the backend directory with the following:
   - DATABASE_URL
   - JWT_SECRET
   - GOOGLE_CLIENT_ID
   - FRONTEND_URL

   Create a .env file in the app directory with the following:
   - VITE_API_URL
   - VITE_GOOGLE_CLIENT_ID

4. Run the development servers:
   Backend:
   ```bash
   cd backend && npm run dev
   ```
   Frontend:
   ```bash
   cd app && npm run dev
   ```

## Deployment

The platform is designed to be easily deployable on platforms like Render (for backend) and Vercel (for frontend). Ensure all environment variables are correctly configured in your deployment platform's settings.

## License

This project is licensed under the MIT License.
