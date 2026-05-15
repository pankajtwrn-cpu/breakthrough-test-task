# Wellspring CMS Platform

Wellspring is a premium, multi-tenant content management platform for wellness creators. It features strict tenant isolation at the data layer, idempotent bulk imports, and a sleek glassmorphic administrative interface.

## Tech Stack
- **Frontend**: Next.js (App Router), Tailwind CSS
- **Backend**: Express, Drizzle ORM, Node-Postgres
- **Database**: PostgreSQL (with Row Level Security)
- **Security**: JWT, Bcrypt, Postgres RLS

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+ 
- PostgreSQL (Local or Docker)

### 2. Environment Setup
Copy the example environment file and update your database credentials.
```bash
cp .env.example .env
# Also copy to backend
cp .env.example backend/.env
```

### 3. Installation
```bash
# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 4. Database Initialization (Migrations & Seeding)
Run these commands in the `backend` directory to set up the schema and the RLS policies.
```bash
cd backend
npm run db:migrate   # Applies RLS migrations and schema
npm run db:seed      # Seeds 2 creators, 6 programs, 60 sessions
```

### 5. Running the Application
Open two terminals:

**Terminal 1 (Backend)**:
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend)**:
```bash
cd frontend
npm run dev
```
Visit: `http://localhost:3000`

---

## 🧪 Testing

### Tenant Isolation Tests
To verify the non-negotiable data-layer isolation:
```bash
cd backend
npm test
```
This runs the `isolation.test.ts` suite which explicitly checks:
- `rejects cross-tenant program access`
- `rejects cross-tenant program update`
- `rejects cross-tenant program deletion`

---

## 📁 Project Structure
- `/backend`: Express API with Drizzle and RLS logic.
- `/frontend`: Next.js Admin Panel with glassmorphic UI.
- `/ai-history`: Full transcripts of the AI development process (Non-negotiable).
- `/backend/drizzle`: SQL migration files for versioned schema changes.

---

## 🔑 Default Credentials (After Seeding)
- **Account 1**: `creator1@example.com` / `password123`
- **Account 2**: `creator2@example.com` / `password123`
