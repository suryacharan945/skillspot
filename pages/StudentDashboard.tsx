import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../data/DataContext';
import { Enrollment, NGO, Course, EnrollmentStatus, Review } from '../types';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import CertificateModal from '../components/CertificateModal';
import CourseSyllabusModal from '../components/CourseSyllabusModal';
import StudentPortfolioShowcase from '../components/StudentPortfolioShowcase';
import CourseForumComponent from '../components/CourseForumComponent';
import AssignmentSubmissionModal from '../components/AssignmentSubmissionModal';
import UserProfileModal from '../components/UserProfileModal';
import CircularSkillProgressTracker, { CircularProgressRing } from '../components/CircularSkillProgressTracker';
import StudentWorkshopDeadlinesWidget from '../components/StudentWorkshopDeadlinesWidget';
import { DashboardGlassSkeleton } from '../components/skeletons/GlassSkeleton';
import { Notification } from '../types';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  Star,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Building2,
  FileCheck,
  Search,
  MessageSquare,
  ShieldCheck,
  FolderGit2,
  Users,
  CheckSquare,
  Send,
  HelpCircle,
  Briefcase,
  Edit3,
  MapPin,
  Mail,
  Phone,
  Globe,
  Share2,
  Link2,
  Image as ImageIcon,
  UserCheck,
  User as UserIcon,
  Camera,
} from 'lucide-react';

const ReviewModal: React.FC<{
  course: Course;
  user: { id: string; name: string };
  onClose: () => void;
  onSaveReview: (courseId: string, review: Review) => Promise<void>;
}> = ({ course, user, onClose, onSaveReview }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0 || isSubmitting) return;
    setIsSubmitting(true);
    const newReview: Review = {
      id: `review-${Date.now()}`,
      studentId: user?.id || 'anonymous',
      studentName: user?.name || 'Student',
      rating,
      comment,
      createdAt: new Date().toISOString(),
    };
    await onSaveReview(course.id, newReview);
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full border border-gray-100 dark:border-gray-700">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">
          Share Your Experience
        </h2>
        <h3 className="text-xs text-blue-600 dark:text-blue-400 font-semibold mb-6">
          {course?.name}
        </h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-2">
              Overall Rating
            </label>
            <div className="flex items-center space-x-1" onMouseLeave={() => setHoverRating(0)}>
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  className="p-1 text-gray-300 hover:scale-110 transition-transform"
                >
                  <Star
                    className={`w-6 h-6 ${
                      (hoverRating || rating) >= star
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Your Feedback & Outcomes
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="What skills did you learn? How were the instructors?"
              className="w-full px-3.5 py-2.5 text-xs border rounded-xl dark:bg-gray-700 dark:border-gray-600 text-gray-900 dark:text-white"
              rows={4}
              required
            />
          </div>
          <div className="flex justify-end space-x-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold rounded-xl text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl disabled:bg-gray-400 shadow-xs"
            >
              {isSubmitting ? 'Submitting...' : 'Post Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const StudentDashboard: React.FC = () => {
  const { user, updateUser } = useAuth();
  const {
    enrollments,
    ngos,
    fetchNgos,
    loading,
    error,
    assignmentSubmissions,
    setNotifications,
    addNotification,
  } = useData();

  const [activeSection, setActiveSection] = useState<
    'cohorts' | 'alerts' | 'certificates' | 'portfolio' | 'forum' | 'profile'
  >('cohorts');

  const handleNotificationGenerated = (notif: Notification) => {
    if (addNotification) {
      addNotification(notif);
    } else if (setNotifications) {
      setNotifications((prev) => [notif, ...prev.filter((p) => p.id !== notif.id)]);
    }
  };

  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);

  const [statusFilter, setStatusFilter] = useState<'all' | 'approved' | 'completed' | 'pending'>(
    'all'
  );

  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [reviewingCourse, setReviewingCourse] = useState<{ course: Course; ngo: NGO } | null>(null);

  const [viewingCertificate, setViewingCertificate] = useState<{
    enrollment: Enrollment;
    course?: Course;
    ngo?: NGO;
  } | null>(null);

  const [viewingSyllabusCourse, setViewingSyllabusCourse] = useState<Course | null>(null);
  const [assignmentModalEnrollment, setAssignmentModalEnrollment] = useState<{
    enrollment: Enrollment;
    course?: Course;
  } | null>(null);

  // Completed syllabus topics tracking
  const [completedTopicIds, setCompletedTopicIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('skillspot_completed_topics');
      return saved ? new Set(JSON.parse(saved)) : new Set(['mod-1-1-t1', 'mod-1-1-t2']);
    } catch {
      return new Set();
    }
  });

  const location = useLocation();
  const navigate = useNavigate();
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || '');

  useEffect(() => {
    try {
      localStorage.setItem('skillspot_completed_topics', JSON.stringify(Array.from(completedTopicIds)));
    } catch (e) {
      console.warn('Failed saving completed topics', e);
    }
  }, [completedTopicIds]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
        navigate(location.pathname, { replace: true, state: {} });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, navigate, location.pathname]);

  if (loading) {
    return <DashboardGlassSkeleton role="student" />;
  }

  if (error) {
    return <p className="text-rose-500 text-center py-12 text-xs">Error: {error}</p>;
  }

  if (!user) {
    return <p className="text-center py-12 text-xs text-gray-500">Redirecting to login...</p>;
  }

  const studentEnrollments = enrollments.filter((e) => e.studentId === user.id);
  const completedEnrollments = studentEnrollments.filter((e) => e.status === 'Completed');
  const activeEnrollments = studentEnrollments.filter((e) => e.status === 'Approved');

  const filteredEnrollments = studentEnrollments.filter((e) => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'approved') return e.status === 'Approved';
    if (statusFilter === 'completed') return e.status === 'Completed';
    if (statusFilter === 'pending') return e.status === 'Pending';
    return true;
  });

  const getCourseAndNgoDetails = (
    enrollment: Enrollment
  ): { course?: Course; ngo?: NGO } => {
    const ngo = ngos.find((n) => n.id === enrollment.ngoId);
    const course = ngo?.courses?.find((c) => c?.id === enrollment.courseId || c?.name === enrollment.courseName);
    return { course, ngo };
  };

  const averageProgress = useMemo(() => {
    if (studentEnrollments.length === 0) return 0;
    const scores = studentEnrollments.map((enr) => {
      if (enr.status === 'Completed') return 100;
      const { course } = getCourseAndNgoDetails(enr);
      const modules = course?.modules || [];
      const allTopics = modules.flatMap((m) => m.topics || []);
      if (allTopics.length === 0) return enr.status === 'Approved' ? 50 : 10;
      const completedCount = allTopics.filter((_, idx) =>
        completedTopicIds.has(`${course?.id || 'c'}-t-${idx}`)
      ).length;
      return Math.round((completedCount / allTopics.length) * 100);
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  }, [studentEnrollments, completedTopicIds, ngos]);

  const handleOpenReviewModal = (course: Course, ngo: NGO) => {
    setReviewingCourse({ course, ngo });
    setIsReviewModalOpen(true);
  };

  const toggleTopicCompleted = (topicId: string) => {
    setCompletedTopicIds((prev) => {
      const next = new Set(prev);
      if (next.has(topicId)) {
        next.delete(topicId);
      } else {
        next.add(topicId);
      }
      return next;
    });
  };

  const handleSaveReview = async (courseId: string, review: Review) => {
    if (!reviewingCourse) return;

    const ngoToUpdate = ngos.find((n) => n.id === reviewingCourse.ngo.id);
    if (!ngoToUpdate) return;

    const updatedCourses = ngoToUpdate.courses.map((course) => {
      if (course.id === courseId) {
        const hasReviewed = course.reviews?.some((r) => r.studentId === user.id);
        if (!hasReviewed) {
          return { ...course, reviews: [...(course.reviews || []), review] };
        }
      }
      return course;
    });

    try {
      const { error } = await supabase
        .from('ngos')
        .update({ courses: updatedCourses })
        .eq('id', ngoToUpdate.id);

      if (error) throw error;
      await fetchNgos();
    } catch (err: any) {
      console.error('Failed to save review:', err);
      ngoToUpdate.courses = updatedCourses;
    }

    setIsReviewModalOpen(false);
    setReviewingCourse(null);
  };

  const getStatusBadge = (status: EnrollmentStatus) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
            <span>Graduated</span>
          </span>
        );
      case 'Approved':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
            <span>Active Cohort</span>
          </span>
        );
      case 'Pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Clock className="w-3 h-3 text-amber-500" />
            <span>Under Review</span>
          </span>
        );
      case 'Rejected':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
            <AlertCircle className="w-3 h-3 text-rose-500" />
            <span>Waitlist Filled</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Success Notification */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* Student Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 text-white shadow-xl min-h-[160px]">
        {user.coverImageUrl && (
          <img
            src={user.coverImageUrl}
            alt="Profile cover banner"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-slate-950/45 backdrop-blur-[0.5px]" />
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 p-6 sm:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="flex items-start space-x-4">
            <div className="relative group shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/15 border-2 border-white/40 shadow-xl overflow-hidden flex items-center justify-center font-black text-2xl text-white backdrop-blur-md">
                {user?.avatarUrl ? (
                  <img src={user.avatarUrl} alt={user?.name || 'Student'} className="w-full h-full object-cover" />
                ) : (
                  (user?.name || 'ST').slice(0, 2).toUpperCase()
                )}
              </div>
              <button
                onClick={() => setIsEditProfileOpen(true)}
                title="Change Profile Photo"
                className="absolute -bottom-1.5 -right-1.5 p-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md border border-white/30 transition-transform hover:scale-105"
              >
                <Camera className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center space-x-1.5 px-3 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-semibold">
                  <GraduationCap className="w-3 h-3 text-cyan-200" />
                  <span>Vocational Candidate</span>
                </div>
                {user?.targetCareer && (
                  <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/30 text-cyan-100 border border-cyan-400/30 text-[11px] font-bold">
                    {user.targetCareer}
                  </span>
                )}
                {user?.location && (
                  <span className="text-xs text-blue-100 flex items-center">
                    <MapPin className="w-3 h-3 mr-1" />
                    {user.location}
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl font-black">
                {user?.name || 'Student Candidate'}
              </h1>
              <p className="text-xs text-blue-100/90 max-w-xl font-normal leading-relaxed line-clamp-2">
                {user.bio || 'Track cohort admissions, complete syllabus checkpoints, and craft your vocational showcase.'}
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs border border-white/30 backdrop-blur-md shadow-sm flex items-center justify-center space-x-2 transition-all hover:scale-102"
            >
              <Edit3 className="w-3.5 h-3.5 text-amber-300" />
              <span>Edit Profile & Cover</span>
            </button>

            {/* Quick Metrics Badge */}
            <div className="flex items-center space-x-3 bg-black/25 backdrop-blur-md p-2.5 rounded-2xl border border-white/20 shadow-inner">
              <div className="text-center px-2.5 border-r border-white/20">
                <span className="text-lg sm:text-xl font-black block">
                  {studentEnrollments.length}
                </span>
                <span className="text-[9px] text-blue-100 uppercase tracking-wider font-semibold">
                  Courses
                </span>
              </div>
              <div className="text-center px-2.5 border-r border-white/20">
                <span className="text-lg sm:text-xl font-black text-cyan-300 block">
                  {activeEnrollments.length}
                </span>
                <span className="text-[9px] text-blue-100 uppercase tracking-wider font-semibold">
                  Active
                </span>
              </div>
              <div className="text-center px-2.5 border-r border-white/20">
                <span className="text-lg sm:text-xl font-black text-amber-300 block">
                  {completedEnrollments.length}
                </span>
                <span className="text-[9px] text-blue-100 uppercase tracking-wider font-semibold">
                  Honors
                </span>
              </div>
              <div className="flex items-center space-x-2 pl-1 pr-1.5">
                <CircularProgressRing
                  percentage={averageProgress}
                  size={36}
                  strokeWidth={4.5}
                  trackColor="text-white/20"
                  color="#38bdf8"
                  showText={false}
                />
                <div className="text-left">
                  <span className="text-xs sm:text-sm font-black text-cyan-200 block leading-tight">
                    {averageProgress}%
                  </span>
                  <span className="text-[8px] text-blue-100 uppercase tracking-wider font-semibold">
                    Mastery
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Student Portal Navigation Tabs */}
      <div className="flex overflow-x-auto pb-1 gap-2 border-b border-gray-200 dark:border-gray-800">
        <button
          onClick={() => setActiveSection('cohorts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeSection === 'cohorts'
              ? 'bg-blue-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          <span>Cohorts & Progress ({studentEnrollments.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('alerts')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeSection === 'alerts'
              ? 'bg-amber-500 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Workshop Deadlines & Real-Time Alerts</span>
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        </button>

        <button
          onClick={() => setActiveSection('certificates')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeSection === 'certificates'
              ? 'bg-amber-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Verified Credentials ({completedEnrollments.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('portfolio')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeSection === 'portfolio'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Capstone Showcase & Portfolio</span>
        </button>

        <button
          onClick={() => setActiveSection('forum')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeSection === 'forum'
              ? 'bg-purple-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Classroom Q&A Forum</span>
        </button>

        <button
          onClick={() => setActiveSection('profile')}
          className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 shrink-0 ${
            activeSection === 'profile'
              ? 'bg-rose-600 text-white shadow-sm'
              : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <UserIcon className="w-4 h-4" />
          <span>Profile & Identity</span>
        </button>
      </div>

      {/* SECTION 1: COHORTS & SYLLABUS PROGRESS TRACKER */}
      {activeSection === 'cohorts' && (
        <div className="space-y-8">
          {/* Visual Circular Progress Tracking Component */}
          <CircularSkillProgressTracker
            enrollments={studentEnrollments}
            ngos={ngos}
            assignmentSubmissions={assignmentSubmissions}
            completedTopicIds={completedTopicIds}
            onToggleTopicCompleted={toggleTopicCompleted}
            onViewSyllabus={(course) => setViewingSyllabusCourse(course)}
            onSubmitMilestone={(enrollment, course) => setAssignmentModalEnrollment({ enrollment, course })}
            onViewCertificate={(payload) => setViewingCertificate(payload)}
          />

          {/* Real-time Workshop Alerts & Deadlines Section */}
          <StudentWorkshopDeadlinesWidget
            enrollments={studentEnrollments}
            ngos={ngos}
            userId={user.id}
            userName={user.name || 'Student'}
            onSubmitMilestone={(enrollment, course) => setAssignmentModalEnrollment({ enrollment, course })}
            onViewSyllabus={(course) => setViewingSyllabusCourse(course)}
            onViewCertificate={(payload) => setViewingCertificate(payload)}
            onNotificationGenerated={handleNotificationGenerated}
          />

          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white">
                  Enrolled Program Cohorts & Weekly Syllabus
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Comprehensive topic breakdown, interactive checklists, and milestone submission actions.
                </p>
              </div>

              {/* Status Filter Chips */}
              <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
                {(['all', 'approved', 'completed', 'pending'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                      statusFilter === tab
                        ? 'bg-white dark:bg-gray-750 text-blue-600 dark:text-blue-400 shadow-xs'
                        : 'text-gray-500 hover:text-gray-800 dark:hover:text-gray-200'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>
            </div>

            {filteredEnrollments.length === 0 ? (
              <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-3">
                <BookOpen className="w-10 h-10 text-gray-300 mx-auto" />
                <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">No courses in this category</h4>
                <p className="text-xs text-gray-400">Explore accredited NGO training centers to apply for a cohort.</p>
                <Link to="/" className="inline-block px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl">
                  Browse Training Centers
                </Link>
              </div>
            ) : (
              <div className="space-y-5">
                {filteredEnrollments.map((enr) => {
                  const { course, ngo } = getCourseAndNgoDetails(enr);
                  const modules = course?.modules || [];
                  const allTopics = modules.flatMap((m) => m.topics);
                  const completedCount = allTopics.filter((t, idx) =>
                    completedTopicIds.has(`${course?.id || 'c'}-t-${idx}`)
                  ).length;
                  const progressPercent = allTopics.length > 0 ? Math.round((completedCount / allTopics.length) * 100) : 60;

                  return (
                    <div
                      key={enr.enrollmentId}
                      className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-5"
                    >
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                        <div className="flex items-start space-x-4">
                          <div className="shrink-0 pt-0.5">
                            <CircularProgressRing
                              percentage={progressPercent}
                              size={58}
                              strokeWidth={5.5}
                              showText={true}
                            />
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                                {course?.category || 'Vocational Trade'}
                              </span>
                              {getStatusBadge(enr.status)}
                            </div>
                            <h4 className="text-lg font-black text-gray-900 dark:text-white mt-1">
                              {enr.courseName}
                            </h4>
                            <p className="text-xs text-gray-500 flex items-center space-x-1.5 mt-0.5">
                              <Building2 className="w-3.5 h-3.5 text-gray-400" />
                              <span className="font-semibold text-gray-700 dark:text-gray-300">{ngo?.name}</span>
                              <span>• Trainer: {course?.trainer || 'Lead Instructor'}</span>
                            </p>
                          </div>
                        </div>

                      <div className="flex flex-wrap items-center gap-2">
                        {course && (
                          <button
                            onClick={() => setViewingSyllabusCourse(course)}
                            className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 text-xs font-bold text-gray-700 dark:text-gray-200 flex items-center space-x-1"
                          >
                            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
                            <span>View Full Syllabus</span>
                          </button>
                        )}

                        <button
                          onClick={() => setAssignmentModalEnrollment({ enrollment: enr, course })}
                          className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-xs flex items-center space-x-1.5"
                        >
                          <FileCheck className="w-3.5 h-3.5" />
                          <span>Submit Milestone / Assignment</span>
                        </button>
                      </div>
                    </div>

                    {/* Weekly Syllabus Progress Check-Off Section */}
                    {modules.length > 0 && (
                      <div className="pt-2 border-t border-gray-100 dark:border-gray-700/60 space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider text-[11px] flex items-center space-x-1.5">
                            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Interactive Syllabus Topic Mastery</span>
                          </span>
                          <span className="text-emerald-600 dark:text-emerald-400 font-bold">
                            {progressPercent}% Complete ({completedCount} / {allTopics.length} Topics Mastered)
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full transition-all duration-300"
                            style={{ width: `${progressPercent}%` }}
                          />
                        </div>

                        {/* Module topic check-boxes */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5 pt-1">
                          {modules.map((mod, modIdx) => (
                            <div
                              key={mod.id}
                              className="p-3 rounded-xl bg-gray-50/70 dark:bg-gray-750 border border-gray-100 dark:border-gray-700 text-xs space-y-2"
                            >
                              <span className="font-bold text-gray-900 dark:text-white block">
                                Week {mod.weekNumber}: {mod.title}
                              </span>
                              <div className="space-y-1">
                                {mod.topics.map((topic, tIdx) => {
                                  const topicKey = `${course?.id || 'c'}-t-${modIdx * 3 + tIdx}`;
                                  const isChecked = completedTopicIds.has(topicKey);
                                  return (
                                    <label
                                      key={tIdx}
                                      className="flex items-start space-x-2 text-[11px] text-gray-600 dark:text-gray-300 cursor-pointer hover:text-emerald-600 select-none"
                                    >
                                      <input
                                        type="checkbox"
                                        checked={isChecked}
                                        onChange={() => toggleTopicCompleted(topicKey)}
                                        className="mt-0.5 rounded text-emerald-600 focus:ring-emerald-500"
                                      />
                                      <span className={isChecked ? 'line-through text-gray-400' : ''}>
                                        {topic}
                                      </span>
                                    </label>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      )}

      {/* SECTION 2: VERIFIED CREDENTIALS */}
      {activeSection === 'certificates' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Official Accredited Credentials ({completedEnrollments.length})
              </h3>
              <p className="text-xs text-gray-500">
                Shareable with employers, downloadable as high-resolution PNGs, and verifiable on the public ledger.
              </p>
            </div>
            <Link
              to="/verify"
              className="px-4 py-2 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-xs font-bold border border-indigo-200 dark:border-indigo-800 flex items-center space-x-1.5"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-500" />
              <span>Open Public Verifier</span>
            </Link>
          </div>

          {completedEnrollments.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 space-y-2">
              <Award className="w-10 h-10 text-gray-300 mx-auto" />
              <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">No completed credentials yet</h4>
              <p className="text-xs text-gray-400">Complete your active cohort modules to earn your verified certificate.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {completedEnrollments.map((enr) => {
                const { course, ngo } = getCourseAndNgoDetails(enr);
                return (
                  <div
                    key={enr.enrollmentId}
                    className="p-6 rounded-3xl border-2 border-amber-300/60 dark:border-amber-700/60 bg-gradient-to-br from-amber-50/40 via-white to-orange-50/20 dark:from-gray-800 dark:to-gray-800 shadow-sm flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-200/70 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 flex items-center space-x-1">
                          <ShieldCheck className="w-3 h-3 text-amber-700 dark:text-amber-300" />
                          <span>Ledger Verified</span>
                        </span>
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                          {enr.gradeScore || 'Honors Pass'}
                        </span>
                      </div>

                      <h4 className="font-black text-lg text-gray-900 dark:text-white">
                        {enr.courseName}
                      </h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        Issued by: <strong className="text-gray-800 dark:text-gray-200">{ngo?.name}</strong>
                      </p>

                      <div className="mt-3 p-2.5 rounded-xl bg-white dark:bg-gray-750 border border-amber-200/50 dark:border-amber-800/40 text-xs space-y-1">
                        <div className="flex justify-between text-gray-500">
                          <span>Certificate Hash ID:</span>
                          <span className="font-mono font-bold text-gray-900 dark:text-white">
                            {enr.certificateId}
                          </span>
                        </div>
                        <div className="flex justify-between text-gray-500">
                          <span>Completed:</span>
                          <span>{enr.completedDate ? new Date(enr.completedDate).toLocaleDateString() : 'Recent'}</span>
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-amber-200/40 flex items-center justify-between gap-2">
                      <button
                        onClick={() => setViewingCertificate({ enrollment: enr, course, ngo })}
                        className="px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5"
                      >
                        <Award className="w-3.5 h-3.5" />
                        <span>View & Print Certificate</span>
                      </button>

                      <Link
                        to={`/verify/${enr.certificateId}`}
                        className="px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-100 text-xs font-bold rounded-xl border border-gray-200 dark:border-gray-600 flex items-center space-x-1"
                      >
                        <span>Verify Proof</span>
                        <ExternalLink className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* SECTION: WORKSHOP DEADLINES & REAL-TIME ALERTS */}
      {activeSection === 'alerts' && (
        <div className="space-y-6">
          <StudentWorkshopDeadlinesWidget
            enrollments={studentEnrollments}
            ngos={ngos}
            userId={user.id}
            userName={user.name || 'Student'}
            onSubmitMilestone={(enrollment, course) => setAssignmentModalEnrollment({ enrollment, course })}
            onViewSyllabus={(course) => setViewingSyllabusCourse(course)}
            onViewCertificate={(payload) => setViewingCertificate(payload)}
            onNotificationGenerated={handleNotificationGenerated}
          />
        </div>
      )}

      {/* SECTION 3: CAPSTONE SHOWCASE & PORTFOLIO */}
      {activeSection === 'portfolio' && (
        <StudentPortfolioShowcase />
      )}

      {/* SECTION 4: CLASSROOM FORUM */}
      {activeSection === 'forum' && (
        <CourseForumComponent />
      )}

      {/* SECTION 5: USER PROFILE & IDENTITY MANAGEMENT */}
      {activeSection === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-700 pb-5">
              <div>
                <div className="flex items-center space-x-2 text-xs font-bold text-rose-600 dark:text-rose-400 uppercase tracking-wider">
                  <UserIcon className="w-4 h-4" />
                  <span>Personal Brand & Identity</span>
                </div>
                <h2 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                  Candidate Profile & Showcase Details
                </h2>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Manage your public vocational identity, profile picture, cover page, bio, and career contacts.
                </p>
              </div>

              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all self-start sm:self-auto"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Profile & Cover</span>
              </button>
            </div>

            {/* Live Profile Card Preview */}
            <div className="rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden bg-gray-50 dark:bg-gray-900/40">
              {/* Cover Banner */}
              <div className="relative h-40 sm:h-48 w-full bg-gradient-to-r from-blue-700 via-indigo-700 to-purple-800 overflow-hidden flex items-end p-5">
                {user.coverImageUrl && (
                  <img
                    src={user.coverImageUrl}
                    alt="Cover page preview"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                )}
                <div className="absolute inset-0 bg-black/40 backdrop-blur-[0.5px]" />
                <div className="relative z-10 flex justify-between items-end w-full">
                  <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-white font-bold text-[11px]">
                    Cover Page Banner Preview
                  </span>
                  <button
                    onClick={() => setIsEditProfileOpen(true)}
                    className="px-3 py-1.5 rounded-xl bg-white/90 hover:bg-white text-gray-900 font-bold text-xs shadow flex items-center space-x-1 transition-all"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-blue-600" />
                    <span>Change Cover Banner</span>
                  </button>
                </div>
              </div>

              {/* Profile Body */}
              <div className="p-6 pt-0 bg-white dark:bg-gray-800">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 mb-5 gap-4">
                  <div className="flex items-end space-x-4">
                    <div className="relative group">
                      <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center font-black text-2xl text-blue-600 dark:text-blue-400 overflow-hidden shrink-0 relative z-10">
                        {user?.avatarUrl ? (
                          <img src={user.avatarUrl} alt={user?.name || 'Student'} className="w-full h-full object-cover" />
                        ) : (
                          (user?.name || 'ST').slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <button
                        onClick={() => setIsEditProfileOpen(true)}
                        className="absolute -bottom-1 -right-1 z-20 p-1.5 rounded-lg bg-blue-600 text-white shadow hover:bg-blue-700"
                        title="Change avatar"
                      >
                        <Camera className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="pb-1">
                      <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                        {user?.name || 'Student Candidate'}
                      </h3>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">
                          {user?.targetCareer || 'Vocational Student'}
                        </span>
                        {user?.location && (
                          <span className="flex items-center">
                            <MapPin className="w-3 h-3 mr-0.5 text-gray-400" />
                            {user.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-900 capitalize">
                      {user.role} Account
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-900 flex items-center space-x-1">
                      <UserCheck className="w-3 h-3 text-emerald-500" />
                      <span>Active Candidate</span>
                    </span>
                  </div>
                </div>

                {/* Bio Callout */}
                {user.bio ? (
                  <div className="mb-5 p-4 rounded-xl bg-gray-50 dark:bg-gray-700/30 border border-gray-100 dark:border-gray-700">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">
                      Professional Summary / Biography
                    </span>
                    <p className="text-xs text-gray-800 dark:text-gray-200 leading-relaxed">
                      {user.bio}
                    </p>
                  </div>
                ) : (
                  <div className="mb-5 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300 flex items-center justify-between">
                    <span>Add a short biography so partner NGOs and trade recruiters know your vocational focus.</span>
                    <button
                      onClick={() => setIsEditProfileOpen(true)}
                      className="font-bold underline ml-2 shrink-0"
                    >
                      Add Bio
                    </button>
                  </div>
                )}

                {/* Skills Tags */}
                {user.skills && user.skills.length > 0 && (
                  <div className="mb-5">
                    <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">
                      Core Vocational Competencies
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {user.skills.map((skill, idx) => (
                        <span
                          key={idx}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-100 dark:border-blue-900"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contact and Links Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-4 border-t border-gray-100 dark:border-gray-700/60 text-xs">
                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center space-x-1.5 text-gray-400 mb-1">
                      <Mail className="w-3.5 h-3.5 text-blue-500" />
                      <span className="text-[10px] uppercase font-bold">Email</span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">{user.email}</p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center space-x-1.5 text-gray-400 mb-1">
                      <Phone className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-[10px] uppercase font-bold">Phone</span>
                    </div>
                    <p className="font-semibold text-gray-800 dark:text-gray-200 truncate">
                      {user.phone || 'Not provided'}
                    </p>
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center space-x-1.5 text-gray-400 mb-1">
                      <Globe className="w-3.5 h-3.5 text-emerald-500" />
                      <span className="text-[10px] uppercase font-bold">Resume Link</span>
                    </div>
                    {user.resumeUrl ? (
                      <a
                        href={user.resumeUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                      >
                        View Resume File
                      </a>
                    ) : (
                      <span className="text-gray-400">Not linked</span>
                    )}
                  </div>

                  <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/30">
                    <div className="flex items-center space-x-1.5 text-gray-400 mb-1">
                      <Share2 className="w-3.5 h-3.5 text-sky-500" />
                      <span className="text-[10px] uppercase font-bold">LinkedIn</span>
                    </div>
                    {user.socialLinks?.linkedin ? (
                      <a
                        href={user.socialLinks.linkedin}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate block"
                      >
                        Profile URL
                      </a>
                    ) : (
                      <span className="text-gray-400">Not connected</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Certificate Viewer Modal */}
      {viewingCertificate && (
        <CertificateModal
          enrollment={viewingCertificate.enrollment}
          course={viewingCertificate.course}
          ngo={viewingCertificate.ngo}
          onClose={() => setViewingCertificate(null)}
        />
      )}

      {/* Course Syllabus Modal */}
      {viewingSyllabusCourse && (
        <CourseSyllabusModal
          course={viewingSyllabusCourse}
          onClose={() => setViewingSyllabusCourse(null)}
        />
      )}

      {/* Assignment Turn-In Modal */}
      {assignmentModalEnrollment && (
        <AssignmentSubmissionModal
          enrollment={assignmentModalEnrollment.enrollment}
          course={assignmentModalEnrollment.course}
          onClose={() => setAssignmentModalEnrollment(null)}
        />
      )}

      {/* Review Modal */}
      {isReviewModalOpen && reviewingCourse && user && (
        <ReviewModal
          course={reviewingCourse.course}
          user={user}
          onClose={() => setIsReviewModalOpen(false)}
          onSaveReview={handleSaveReview}
        />
      )}

      {/* User Profile & Identity Editor Modal */}
      {isEditProfileOpen && user && (
        <UserProfileModal
          user={user}
          isOpen={isEditProfileOpen}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={(updates) => updateUser(updates)}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
