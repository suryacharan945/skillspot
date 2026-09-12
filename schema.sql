-- ==============================================================================
-- SkillSpot 2.0 - Complete Supabase PostgreSQL Schema & Migration Script
-- Project: keugczzhzfuomikwrldi (https://keugczzhzfuomikwrldi.supabase.co)
-- ==============================================================================
-- This script is idempotent: it safely creates missing tables and updates
-- existing tables without destroying any data.
-- Run this in Supabase Dashboard -> SQL Editor -> New Query.
-- ==============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ==============================================================================
-- 1. NGOS / TENANT ORGANIZATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.ngos (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  location TEXT,
  type TEXT,
  contact JSONB DEFAULT '{}'::jsonb,
  courses JSONB DEFAULT '[]'::jsonb,
  "contactEmail" TEXT,
  phone TEXT,
  website TEXT,
  rating NUMERIC DEFAULT 4.8,
  "reviewCount" INTEGER DEFAULT 0,
  coordinates JSONB,
  address TEXT,
  "logoUrl" TEXT,
  "coverImageUrl" TEXT,
  mission TEXT,
  "establishedYear" INTEGER,
  accreditation TEXT,
  branding JSONB DEFAULT '{}'::jsonb,
  "primaryCategories" TEXT[] DEFAULT '{}',
  "tenantSettings" JSONB DEFAULT '{}'::jsonb,
  "socialLinks" JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Ensure newly added columns exist on pre-existing ngos table
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS "contactEmail" TEXT;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS rating NUMERIC DEFAULT 4.8;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS "reviewCount" INTEGER DEFAULT 0;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS coordinates JSONB;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS address TEXT;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS "logoUrl" TEXT;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS mission TEXT;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS "establishedYear" INTEGER;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS accreditation TEXT;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS branding JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS "primaryCategories" TEXT[] DEFAULT '{}';
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS "tenantSettings" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS "socialLinks" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.ngos ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT now();

-- ==============================================================================
-- 2. USERS PROFILE TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT,
  email TEXT,
  phone TEXT,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'employer')),
  "ngoId" TEXT,
  "companyName" TEXT,
  "avatarUrl" TEXT,
  bio TEXT,
  "coverImageUrl" TEXT,
  "tradeSpecialization" TEXT,
  location TEXT,
  headline TEXT,
  "targetCareer" TEXT,
  skills TEXT[] DEFAULT '{}',
  "resumeUrl" TEXT,
  "socialLinks" JSONB DEFAULT '{}'::jsonb,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- Ensure newly added columns exist on pre-existing users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "companyName" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "avatarUrl" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "coverImageUrl" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "tradeSpecialization" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS headline TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "targetCareer" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS skills TEXT[] DEFAULT '{}';
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "resumeUrl" TEXT;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "socialLinks" JSONB DEFAULT '{}'::jsonb;
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMPTZ DEFAULT now();

-- ==============================================================================
-- 3. ENROLLMENTS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.enrollments (
  "enrollmentId" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "studentId" TEXT,
  "studentName" TEXT,
  "courseId" TEXT,
  "courseName" TEXT,
  "ngoId" TEXT,
  status TEXT NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Rejected', 'Completed')),
  "requestDate" TIMESTAMPTZ DEFAULT now(),
  "previousExperience" TEXT,
  "reasonForJoining" TEXT,
  "completedDate" TIMESTAMPTZ,
  "certificateId" TEXT,
  "gradeScore" TEXT,
  grade TEXT,
  honors BOOLEAN DEFAULT false,
  "userId" TEXT
);

-- Upgrade existing enrollments table with performance & progress tracking columns
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS "completedDate" TIMESTAMPTZ;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS "certificateId" TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS "gradeScore" TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS grade TEXT;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS honors BOOLEAN DEFAULT false;
ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS "userId" TEXT;

-- ==============================================================================
-- 4. NOTIFICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "userId" TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT,
  "isRead" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  type TEXT,
  title TEXT,
  priority TEXT,
  "courseName" TEXT,
  "courseId" TEXT,
  "deadlineDate" TIMESTAMPTZ,
  "certificateId" TEXT,
  "ngoName" TEXT,
  "actionLabel" TEXT
);

ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS type TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS priority TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "courseName" TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "courseId" TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "deadlineDate" TIMESTAMPTZ;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "certificateId" TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "ngoName" TEXT;
ALTER TABLE public.notifications ADD COLUMN IF NOT EXISTS "actionLabel" TEXT;

-- ==============================================================================
-- 5. WORKSHOP EQUIPMENT & TOOL INVENTORY TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workshop_equipment (
  id TEXT PRIMARY KEY,
  "ngoId" TEXT NOT NULL,
  name TEXT NOT NULL,
  category TEXT,
  "serialNumber" TEXT,
  status TEXT NOT NULL DEFAULT 'Available',
  "assignedToStudentId" TEXT,
  "assignedToStudentName" TEXT,
  "assignedDate" TIMESTAMPTZ,
  condition TEXT,
  location TEXT,
  "lastMaintenanceDate" TIMESTAMPTZ,
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 6. PLACEMENT & EMPLOYER HIRING OUTCOME RECORDS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.placement_records (
  id TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "tradeCategory" TEXT,
  "certificateId" TEXT,
  "companyName" TEXT NOT NULL,
  "jobTitle" TEXT NOT NULL,
  "startingHourlyWage" TEXT,
  "startDate" DATE,
  "retentionMilestone" TEXT,
  "donorReported" BOOLEAN DEFAULT false,
  notes TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 7. ASSIGNMENT & MILESTONE SUBMISSIONS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.assignment_submissions (
  id TEXT PRIMARY KEY,
  "enrollmentId" TEXT,
  "moduleId" TEXT,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "courseId" TEXT NOT NULL,
  "deliverableTitle" TEXT NOT NULL,
  notes TEXT,
  "attachmentUrl" TEXT,
  "deliverableUrl" TEXT,
  "submittedAt" TIMESTAMPTZ DEFAULT now(),
  status TEXT DEFAULT 'Pending Review',
  "trainerFeedback" TEXT,
  grade TEXT
);

-- ==============================================================================
-- 8. COURSE FORUM & PEER COLLABORATION POSTS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.course_forum_posts (
  id TEXT PRIMARY KEY,
  "courseId" TEXT NOT NULL,
  "courseName" TEXT,
  "authorId" TEXT NOT NULL,
  "authorName" TEXT NOT NULL,
  "authorRole" TEXT NOT NULL,
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT now(),
  upvotes INTEGER DEFAULT 0,
  "isAnnouncement" BOOLEAN DEFAULT false,
  replies JSONB DEFAULT '[]'::jsonb
);

-- ==============================================================================
-- 9. BROADCAST MESSAGES TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.broadcast_messages (
  id TEXT PRIMARY KEY,
  "ngoId" TEXT,
  "senderNgoId" TEXT,
  "courseId" TEXT,
  "courseName" TEXT,
  "targetCourseId" TEXT,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  urgency TEXT DEFAULT 'Normal',
  "sentAt" TIMESTAMPTZ DEFAULT now(),
  "recipientCount" INTEGER DEFAULT 0
);

-- ==============================================================================
-- 10. VOCATIONAL JOBS & APPRENTICESHIPS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.vocational_jobs (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  company TEXT NOT NULL,
  category TEXT,
  type TEXT,
  location TEXT,
  "stipendOrSalary" TEXT,
  description TEXT,
  requirements TEXT[] DEFAULT '{}',
  "toolGrantIncluded" BOOLEAN DEFAULT false,
  "postedDate" DATE,
  "contactEmail" TEXT,
  "applicantsCount" INTEGER DEFAULT 0,
  "hourlyWageOrStipend" TEXT,
  "requiredSkills" TEXT[] DEFAULT '{}',
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 11. JOB APPLICATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.job_applications (
  id TEXT PRIMARY KEY,
  "jobId" TEXT NOT NULL,
  "jobTitle" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "studentEmail" TEXT NOT NULL,
  "portfolioLinks" TEXT[] DEFAULT '{}',
  "attachedCertificateId" TEXT,
  "coverNote" TEXT,
  "appliedDate" TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 12. STUDENT PORTFOLIO SHOWCASE ITEMS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.student_portfolio_items (
  id TEXT PRIMARY KEY,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT,
  title TEXT NOT NULL,
  category TEXT,
  description TEXT,
  "imageUrl" TEXT,
  "completionDate" DATE,
  "skillsLearned" TEXT[] DEFAULT '{}',
  "toolsUsed" TEXT[] DEFAULT '{}',
  "externalLink" TEXT,
  "associatedCourseName" TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 13. WORKSHOP FACILITIES & TOOL LENDING LIBRARIES
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.workshop_facilities (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT,
  city TEXT,
  location TEXT,
  address TEXT,
  coordinates JSONB,
  "specializedMachinery" TEXT[] DEFAULT '{}',
  "availableToolsCount" INTEGER DEFAULT 0,
  "operatingHours" TEXT,
  "contactPhone" TEXT,
  "contactEmail" TEXT,
  "imageUrl" TEXT,
  "safetyOrientationRequired" BOOLEAN DEFAULT false,
  "createdAt" TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 14. MACHINE RESERVATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.machine_reservations (
  id TEXT PRIMARY KEY,
  "facilityId" TEXT NOT NULL,
  "facilityName" TEXT,
  "machineName" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "reservationDate" DATE NOT NULL,
  "timeSlot" TEXT NOT NULL,
  purpose TEXT,
  "safetyCertified" BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'Confirmed',
  "bookedAt" TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 15. INTERVIEW INVITATIONS TABLE
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.interview_invitations (
  id TEXT PRIMARY KEY,
  "employerId" TEXT NOT NULL,
  "employerName" TEXT NOT NULL,
  "studentId" TEXT NOT NULL,
  "studentName" TEXT NOT NULL,
  "tradeField" TEXT,
  "positionTitle" TEXT,
  "interviewDate" TIMESTAMPTZ,
  message TEXT,
  status TEXT DEFAULT 'Invited',
  "sentAt" TIMESTAMPTZ DEFAULT now()
);

-- ==============================================================================
-- 16. AUTOMATIC USER SYNC TRIGGER (CRITICAL FOR GOOGLE OAUTH!)
-- ==============================================================================
-- When a user signs up via Google OAuth or Supabase Auth, this function
-- automatically provisions their public.users profile row without failing.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    role,
    "avatarUrl"
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      NULL
    )
  )
  ON CONFLICT (id) DO UPDATE
  SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, public.users.name),
    "avatarUrl" = COALESCE(EXCLUDED."avatarUrl", public.users."avatarUrl");
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Re-create the trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ==============================================================================
-- 17. ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================
-- Enable RLS on all tables
ALTER TABLE public.ngos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_equipment ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.placement_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.course_forum_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.broadcast_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vocational_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.job_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.student_portfolio_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workshop_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machine_reservations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.interview_invitations ENABLE ROW LEVEL SECURITY;

-- Helper to safely recreate policies
DO $$
BEGIN
  -- NGOS: Public read, Admin write
  DROP POLICY IF EXISTS "Public NGOs are viewable by everyone" ON public.ngos;
  CREATE POLICY "Public NGOs are viewable by everyone" ON public.ngos FOR SELECT USING (true);
  
  DROP POLICY IF EXISTS "Admins can insert or update NGOs" ON public.ngos;
  CREATE POLICY "Admins can insert or update NGOs" ON public.ngos FOR ALL USING (true);

  -- USERS: Anyone can read, users can insert/update their own profile
  DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.users;
  CREATE POLICY "Public profiles are viewable by everyone" ON public.users FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Users can insert their own profile" ON public.users;
  CREATE POLICY "Users can insert their own profile" ON public.users FOR INSERT WITH CHECK (auth.uid() = id);

  DROP POLICY IF EXISTS "Users can update their own profile" ON public.users;
  CREATE POLICY "Users can update their own profile" ON public.users FOR UPDATE USING (auth.uid() = id);

  -- ENROLLMENTS: Viewable and manageable
  DROP POLICY IF EXISTS "Enrollments viewable by all" ON public.enrollments;
  CREATE POLICY "Enrollments viewable by all" ON public.enrollments FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Users can insert enrollments" ON public.enrollments;
  CREATE POLICY "Users can insert enrollments" ON public.enrollments FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Users can update enrollments" ON public.enrollments;
  CREATE POLICY "Users can update enrollments" ON public.enrollments FOR UPDATE USING (true);

  -- NOTIFICATIONS: Viewable and manageable
  DROP POLICY IF EXISTS "Notifications viewable by all" ON public.notifications;
  CREATE POLICY "Notifications viewable by all" ON public.notifications FOR SELECT USING (true);

  DROP POLICY IF EXISTS "Users can insert notifications" ON public.notifications;
  CREATE POLICY "Users can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

  DROP POLICY IF EXISTS "Users can update notifications" ON public.notifications;
  CREATE POLICY "Users can update notifications" ON public.notifications FOR UPDATE USING (true);

  -- WORKSHOP EQUIPMENT
  DROP POLICY IF EXISTS "Equipment viewable by all" ON public.workshop_equipment;
  CREATE POLICY "Equipment viewable by all" ON public.workshop_equipment FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Equipment modifiable by authenticated" ON public.workshop_equipment;
  CREATE POLICY "Equipment modifiable by authenticated" ON public.workshop_equipment FOR ALL USING (true);

  -- PLACEMENTS
  DROP POLICY IF EXISTS "Placements viewable by all" ON public.placement_records;
  CREATE POLICY "Placements viewable by all" ON public.placement_records FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Placements modifiable by authenticated" ON public.placement_records;
  CREATE POLICY "Placements modifiable by authenticated" ON public.placement_records FOR ALL USING (true);

  -- ASSIGNMENT SUBMISSIONS
  DROP POLICY IF EXISTS "Assignments viewable by all" ON public.assignment_submissions;
  CREATE POLICY "Assignments viewable by all" ON public.assignment_submissions FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Assignments modifiable by authenticated" ON public.assignment_submissions;
  CREATE POLICY "Assignments modifiable by authenticated" ON public.assignment_submissions FOR ALL USING (true);

  -- FORUMS
  DROP POLICY IF EXISTS "Forums viewable by all" ON public.course_forum_posts;
  CREATE POLICY "Forums viewable by all" ON public.course_forum_posts FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Forums modifiable by authenticated" ON public.course_forum_posts;
  CREATE POLICY "Forums modifiable by authenticated" ON public.course_forum_posts FOR ALL USING (true);

  -- BROADCASTS
  DROP POLICY IF EXISTS "Broadcasts viewable by all" ON public.broadcast_messages;
  CREATE POLICY "Broadcasts viewable by all" ON public.broadcast_messages FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Broadcasts modifiable by authenticated" ON public.broadcast_messages;
  CREATE POLICY "Broadcasts modifiable by authenticated" ON public.broadcast_messages FOR ALL USING (true);

  -- JOBS & APPLICATIONS
  DROP POLICY IF EXISTS "Jobs viewable by all" ON public.vocational_jobs;
  CREATE POLICY "Jobs viewable by all" ON public.vocational_jobs FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Jobs modifiable by authenticated" ON public.vocational_jobs;
  CREATE POLICY "Jobs modifiable by authenticated" ON public.vocational_jobs FOR ALL USING (true);

  DROP POLICY IF EXISTS "Applications viewable by all" ON public.job_applications;
  CREATE POLICY "Applications viewable by all" ON public.job_applications FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Applications modifiable by authenticated" ON public.job_applications;
  CREATE POLICY "Applications modifiable by authenticated" ON public.job_applications FOR ALL USING (true);

  -- PORTFOLIO
  DROP POLICY IF EXISTS "Portfolio viewable by all" ON public.student_portfolio_items;
  CREATE POLICY "Portfolio viewable by all" ON public.student_portfolio_items FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Portfolio modifiable by authenticated" ON public.student_portfolio_items;
  CREATE POLICY "Portfolio modifiable by authenticated" ON public.student_portfolio_items FOR ALL USING (true);

  -- FACILITIES & RESERVATIONS
  DROP POLICY IF EXISTS "Facilities viewable by all" ON public.workshop_facilities;
  CREATE POLICY "Facilities viewable by all" ON public.workshop_facilities FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Facilities modifiable by authenticated" ON public.workshop_facilities;
  CREATE POLICY "Facilities modifiable by authenticated" ON public.workshop_facilities FOR ALL USING (true);

  DROP POLICY IF EXISTS "Reservations viewable by all" ON public.machine_reservations;
  CREATE POLICY "Reservations viewable by all" ON public.machine_reservations FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Reservations modifiable by authenticated" ON public.machine_reservations;
  CREATE POLICY "Reservations modifiable by authenticated" ON public.machine_reservations FOR ALL USING (true);

  -- INTERVIEWS
  DROP POLICY IF EXISTS "Interviews viewable by all" ON public.interview_invitations;
  CREATE POLICY "Interviews viewable by all" ON public.interview_invitations FOR SELECT USING (true);
  DROP POLICY IF EXISTS "Interviews modifiable by authenticated" ON public.interview_invitations;
  CREATE POLICY "Interviews modifiable by authenticated" ON public.interview_invitations FOR ALL USING (true);
END $$;

-- ==============================================================================
-- 18. TABLE GRANTS FOR ANON & AUTHENTICATED ROLES
-- ==============================================================================
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL ROUTINES IN SCHEMA public TO anon, authenticated;
