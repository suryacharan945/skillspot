# 🌟 SkillSpot 2.0 — Multi-Tenant Vocational Skill Ecosystem & SaaS

[![SkillSpot CI](https://github.com/suryacharan945/skillspot/actions/workflows/ci.yml/badge.svg)](https://github.com/suryacharan945/skillspot/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![React](https://img.shields.io/badge/React-19.2-blue)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%20RLS-3ECF8E)](https://supabase.com/)
[![Deployment: Vercel](https://img.shields.io/badge/Deployment-Vercel-black)](https://skillspot-eight.vercel.app)

SkillSpot 2.0 is a modern, multi-tenant Software-as-a-Service (SaaS) platform connecting Non-Governmental Organizations (NGOs), vocational skill training centers, learners, and enterprise employers under a unified digital infrastructure.

* **Live Web Application:** [https://skillspot-eight.vercel.app](https://skillspot-eight.vercel.app) (Alternative: [https://skillspot-omega.vercel.app](https://skillspot-omega.vercel.app))

---

## 🏛️ Architectural Overview & Multi-Tenancy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        SKILLSPOT 2.0 ARCHITECTURE                       │
└────────────────────────────────────────────────────────────────────────┘
          │
          ├── [Presentation Layer]: React 19, TypeScript, Tailwind CSS, Lucide Icons
          │     ├── Student Portal: Interactive course discovery, geo-mapping, submission modals
          │     ├── NGO Admin Portal: Multi-tenant dashboards, tool inventory, PDF report generator
          │     └── Employer Portal: Verified credential lookup, vocational hiring pipeline
          │
          ├── [State & Data Layer]: React Context + Supabase JS Client (@supabase/supabase-js)
          │     ├── Dynamic Supabase Synchronization (`lib/supabaseClient.ts`)
          │     └── Offline Resilient Fallback: Static mock seed directory (`constants.ts`)
          │
          └── [Backend & Security Layer]: Supabase PostgreSQL Cloud
                ├── 16 Relational Tables (`schema.sql` DDL)
                ├── Multi-Tenant Isolation via Row-Level Security (RLS) policies
                └── Auth: Google OAuth + Email/Password JWT Session guards
```

---

## 🚀 Key Modules & Capabilities

1. **Multi-Tenant NGO Administration**:
   - Independent branding, tenant customization, custom domain slugs, and accreditation management.
   - Comprehensive **Data Visualizations** (Enrollment & Retention trajectories, Core Competency radar, Track Mastery charts, Equipment utilization, and comparative NGO performance).
   - **Executive PDF & CSV Report Generator**: Export accreditation-ready PDF dossiers and CSV spreadsheets for donor audits, board reviews, and offline archival.
   - Real-time **SMS/Broadcast Messaging System** with urgency tags.
   - **Workshop Equipment & Tool Inventory** tracker with maintenance schedules.

2. **Student Learning & Vocational Portfolios**:
   - Course discovery with interactive geo-mapping across verified NGOs.
   - Milestone tracking, assignment submissions with instructor feedback rubrics.
   - **Student Skill Portfolio Showcase** highlighting hands-on tools, capstone images, and verified credentials.
   - Digital Certificates with tamper-proof verification hash and QR codes.
   - Peer discussion forums with instructor answers and voting.

3. **Career Advancement & Direct Hiring Pipeline**:
   - **AI Trade Career Coach & Mock Interviewer**: Scenario-based technical and safety evaluations powered by Google Gemini AI.
   - **Vocational Resume Builder**: One-click ATS-friendly resume export.
   - **Employer Portal & Direct Hiring**: Post vocational jobs, review verified student certifications, and issue interview invitations.
   - **Workshop & Maker Space Tool Lending Library**: Interactive facility map and machinery slot reservations.

4. **Authentication & Multi-Role Access**:
   - Email/Password authentication & **Google OAuth Sign-In**.
   - Role-Based Access Control (RBAC): `student`, `admin`, and `employer`.
   - Built-in one-click demo profiles for instant exploration.

---

## 🗄️ Database Setup & Row-Level Security (RLS)

The database schema and multi-tenant security policies are declared in [`schema.sql`](./schema.sql).

### Running the Database Migration

1. Open your Supabase Project: [`https://supabase.com/dashboard/project/keugczzhzfuomikwrldi`](https://supabase.com/dashboard/project/keugczzhzfuomikwrldi)
2. Go to **SQL Editor** -> **New query**.
3. Copy the entire contents of [`schema.sql`](./schema.sql) from this repository.
4. Paste and click **Run**.
5. This deploys:
   - 16 core relational tables (`ngos`, `users`, `enrollments`, `notifications`, `workshop_equipment`, `placement_records`, etc.).
   - Explicit Row-Level Security (RLS) policies ensuring tenant and user data isolation.
   - Automated `on_auth_user_created` trigger provisioning student profiles upon Google OAuth sign-in.

---

## 🛠️ Local Development, Testing & Build

```bash
# Install dependencies
npm install

# Run automated integrity test suite
npm test

# Type-check TypeScript
npx tsc --noEmit

# Start local development server
npm run dev

# Build production bundle
npm run build
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
