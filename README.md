# 🌟 SkillSpot 2.0 - Multi-Tenant Vocational Skill Ecosystem & SaaS

SkillSpot 2.0 is a modern, multi-tenant Software-as-a-Service (SaaS) platform connecting Non-Governmental Organizations (NGOs), vocational skill training centers, learners, and enterprise employers under a unified digital infrastructure.

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

## 🗄️ Database Setup (Supabase)

The project connects to Supabase with automated fallback to persistent client-side storage.

### Running the Database Migration

1. Open your Supabase Project: [`https://supabase.com/dashboard/project/keugczzhzfuomikwrldi`](https://supabase.com/dashboard/project/keugczzhzfuomikwrldi)
2. Go to **SQL Editor** -> **New query**.
3. Copy the entire contents of [`schema.sql`](./schema.sql) from this repository.
4. Paste and click **Run**.
5. This will:
   - Upgrade existing tables (`ngos`, `users`, `enrollments`, `notifications`) with the required columns.
   - Create missing tables: `workshop_equipment`, `placement_records`, `assignment_submissions`, `course_forum_posts`, `broadcast_messages`, `vocational_jobs`, `job_applications`, `student_portfolio_items`, `workshop_facilities`, `machine_reservations`, and `interview_invitations`.
   - Set up Row Level Security (RLS) policies.
   - Deploy the `on_auth_user_created` trigger that automatically provisions student profiles upon Google OAuth sign-in.

---

## 🔑 Enabling Google OAuth in Supabase

To enable **Sign in with Google**:

1. **Google Cloud Console**:
   - Create an **OAuth 2.0 Client ID** (Application type: *Web application*).
   - In **Authorized redirect URIs**, add:
     ```
     https://keugczzhzfuomikwrldi.supabase.co/auth/v1/callback
     ```
   - Copy your **Client ID** and **Client Secret**.

2. **Supabase Dashboard**:
   - Go to **Authentication** -> **Providers** -> **Google**.
   - Toggle Google to **Enabled**.
   - Paste your **Client ID** and **Client Secret**, then click **Save**.

3. **Redirect URLs**:
   - Go to **Authentication** -> **URL Configuration**.
   - In **Site URL**, set your primary domain (e.g. `https://suryacharan945.github.io/skillspot` or your Vercel/Cloud Run URL).
   - In **Redirect URLs**, add wildcard `*` or your production and local URLs:
     - `http://localhost:3000/*`
     - `https://*.run.app/*`
     - Your custom domain.

---

## 🛠️ Local Development & Scripts

```bash
# Install dependencies
npm install

# Start local development server
npm run dev

# Build for production
npm run build
```

---

## 📦 Updating GitHub Repository (`suryacharan945/skillspot`)

To push these updates to your GitHub repository:

```bash
# 1. Clone or sync your repository
git remote add origin https://github.com/suryacharan945/skillspot.git

# 2. Stage all updated files
git add .

# 3. Commit the changes
git commit -m "feat: upgrade SkillSpot 2.0 with data visualizations, report exports, schema migration and Google OAuth fix"

# 4. Push to main branch
git push -u origin main
```
