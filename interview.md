# EditlanceX 2.0 - Interview Guide & Tech Stack Overview

## Project Overview
**EditlanceX 2.0** is a specialized job marketplace designed to connect video editors with clients seeking editing services. The platform serves as a bridge where clients can post specific video editing jobs (e.g., short-form content, long-form videos) with requirements like budget, software preference (Premiere Pro, Final Cut), and deadlines. Video editors can browse these jobs, showcase their portfolios, and apply.

## Architecture
The project is built as a **Monorepo** containing both the frontend application and the backend API, managed together using `concurrently` for seamless local development.

---

## 🛠 Tech Stack

### Frontend (`/app`)
The frontend is a modern Single Page Application (SPA) built with a focus on performance, type safety, and a highly polished UI.

*   **Core Framework**: React 19
*   **Language**: TypeScript
*   **Build Tool**: Vite (Extremely fast HMR and optimized builds)
*   **Styling**: Tailwind CSS
*   **UI Components**: [shadcn/ui](https://ui.shadcn.com/) (Built on top of Radix UI primitives for accessible, customizable, and unstyled base components).
*   **Routing**: React Router DOM (v7)
*   **Forms & Validation**: React Hook Form coupled with Zod (`zod`, `@hookform/resolvers`).
*   **Authentication UI**: Google OAuth integration (`@react-oauth/google`).
*   **Icons**: Lucide React
*   **Data Visualization**: Recharts (for dashboards)

### Backend (`/backend`)
The backend is a robust RESTful API designed to handle user authentication, job postings, editor profiles, and application tracking.

*   **Runtime environment**: Node.js
*   **Framework**: Express.js (v5)
*   **Database**: PostgreSQL
*   **ORM (Object-Relational Mapper)**: Prisma ORM (Provides type-safe database queries and easy schema migrations).
*   **Authentication**: 
    *   JWT (JSON Web Tokens) for session management.
    *   Bcrypt.js for secure password hashing.
    *   Google Auth Library for handling Google Single Sign-On (SSO).
*   **Development Tools**: Nodemon for auto-restarting the server during development.

---

## 🗄 Database Schema (Key Models)

The PostgreSQL database is structured around four primary entities, managed by Prisma:

1.  **User**: Handles both `client` and `editor` roles. Supports traditional email/password and Google SSO.
2.  **EditorProfile**: An extension of the User model (1-to-1 relationship) specifically for editors to list their skills, software proficiency, portfolio links, and bio.
3.  **Job**: Created by `client` users. Contains details like title, description, budget, deadline, video type, and required software.
4.  **Application**: A join table connecting a `Job` and an `editor` (User). It tracks the status of the application (`PENDING`, `HIRED`, `NOT_HIRED`) and whether the client has contacted the editor.

---

## 💡 Key Talking Points for an Interview

If you are presenting or discussing this project in an interview, focus on these technical decisions:

1.  **Why Prisma + PostgreSQL?**
    *   *Answer:* Prisma provides absolute type safety from the database to the backend logic. When combined with TypeScript on the frontend, it ensures a highly reliable data flow. PostgreSQL was chosen for its robust relational features, which are perfect for matching users, jobs, and applications.
2.  **Why shadcn/ui and Tailwind CSS?**
    *   *Answer:* Unlike traditional component libraries (like Material UI or Bootstrap) that add bloat and are hard to customize, shadcn/ui provides raw component code that we own and can modify via Tailwind CSS. This gives us 100% control over the design system while maintaining ARIA accessibility standards.
3.  **Handling Authentication:**
    *   *Answer:* The platform implements a dual-strategy authentication system. Users can sign up traditionally (hashed via bcrypt) or use Google OAuth. The backend issues a JWT upon successful login, which the frontend stores and attaches to subsequent API requests to access protected routes (like posting a job or applying).
4.  **Monorepo Setup:**
    *   *Answer:* Using a single repository for both frontend and backend makes it easier to keep data shapes in sync. The `concurrently` package allows us to spin up both the Vite dev server and the Express backend with a single `npm run dev` command.
5.  **Role-Based Access Control (RBAC):**
    *   *Answer:* The application heavily relies on roles (`editor` vs `client`). The backend middleware checks the JWT payload to ensure that, for example, only clients can create jobs, and only editors can submit applications. The frontend `ProtectedRoute` components mirror this by rendering different dashboards based on the user's role.