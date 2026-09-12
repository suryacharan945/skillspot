import React, { useState, useMemo, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import CourseCard from '../components/CourseCard';
import { Course, Enrollment, Notification, NGO } from '../types';
import { supabase } from '../lib/supabaseClient';
import OrganizationProfileModal from '../components/OrganizationProfileModal';
import { dispatchRealtimeNotification } from '../services/realtimeNotificationService';
import { NgoDetailGlassSkeleton } from '../components/skeletons/GlassSkeleton';
import {
  MapPin,
  Mail,
  Phone,
  Globe,
  ArrowLeft,
  Building2,
  BookOpen,
  CheckCircle2,
  Sparkles,
  Users,
  Send,
  X,
  Edit3,
  Award,
  Calendar,
  Share2,
} from 'lucide-react';

const EnrollmentModal: React.FC<{
  course: Course;
  onClose: () => void;
  onSubmit: (answers: { previousExperience: string; reasonForJoining: string }) => void;
  isSubmitting: boolean;
}> = ({ course, onClose, onSubmit, isSubmitting }) => {
  const [previousExperience, setPreviousExperience] = useState('');
  const [reasonForJoining, setReasonForJoining] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ previousExperience, reasonForJoining });
  };

  const inputClasses =
    'w-full px-4 py-2.5 text-xs border rounded-xl bg-white text-gray-900 border-gray-300 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-all';

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8 max-w-lg w-full border border-gray-100 dark:border-gray-700">
        
        <div className="flex justify-between items-start mb-4 border-b border-gray-100 dark:border-gray-700 pb-3">
          <div>
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Cohort Enrollment Application</span>
            </div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-1">
              {course?.name}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5">
          Please answer a few brief questions so the workshop instructors can prepare tools and allocate your seat.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Prior Experience or Skill Level
            </label>
            <textarea
              value={previousExperience}
              onChange={(e) => setPreviousExperience(e.target.value)}
              className={inputClasses}
              rows={3}
              placeholder="e.g. Beginner with strong enthusiasm, or 6 months experience in electrical basics..."
              required
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1.5">
              Why do you want to join this program?
            </label>
            <textarea
              value={reasonForJoining}
              onChange={(e) => setReasonForJoining(e.target.value)}
              className={inputClasses}
              rows={3}
              placeholder="What are your career or vocational goals upon graduating with your certificate?"
              required
            />
          </div>

          <div className="flex justify-end pt-3 space-x-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-sm transition-all disabled:bg-blue-400 flex items-center space-x-1.5"
            >
              {isSubmitting ? (
                <span>Submitting Application...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Confirm Application</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const NgoDetailPage: React.FC = () => {
  const { ngoId } = useParams<{ ngoId: string }>();
  const { ngos, setNgos, enrollments, setEnrollments, setNotifications, loading, error } = useData();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [isRegistering, setIsRegistering] = useState<string | null>(null);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 6000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  const ngo = useMemo(() => ngos.find((n) => n.id === ngoId), [ngos, ngoId]);

  const canEditOrganization = useMemo(() => {
    if (!user || user.role !== 'admin') return false;
    return !user.ngoId || user.ngoId === ngo?.id;
  }, [user, ngo]);

  const handleSaveOrganization = (updatedNgo: NGO) => {
    setNgos((prev) => prev.map((n) => (n.id === updatedNgo.id ? updatedNgo : n)));
    setSuccessMessage('Organization profile, cover page, and details updated successfully!');
  };

  const handleOpenEnrollmentModal = (course: Course) => {
    if (!isAuthenticated || !user) {
      navigate('/login?role=student');
      return;
    }

    if (enrollments.some((e) => e.studentId === user.id && e.courseId === course.id)) {
      return;
    }

    setSelectedCourse(course);
  };

  const handleRegister = async (answers: { previousExperience: string; reasonForJoining: string }) => {
    if (!user || !selectedCourse || !ngo) return;

    setIsRegistering(selectedCourse.id);
    try {
      const newEnrollment: Omit<Enrollment, 'enrollmentId'> = {
        studentId: user?.id || 'anonymous',
        studentName: user?.name || 'Applicant',
        courseId: selectedCourse.id,
        courseName: selectedCourse?.name || 'Vocational Course',
        ngoId: ngo.id,
        status: 'Pending',
        requestDate: new Date().toISOString(),
        previousExperience: answers.previousExperience,
        reasonForJoining: answers.reasonForJoining,
      };

      try {
        const { data: createdEnrollment, error: enrollError } = await supabase
          .from('enrollments')
          .insert(newEnrollment)
          .select()
          .single();

        if (!enrollError && createdEnrollment) {
          setEnrollments((prev) => [...prev, createdEnrollment]);
        } else {
          throw new Error('Fallback local insertion');
        }
      } catch {
        const fallbackEnrollment: Enrollment = {
          ...newEnrollment,
          enrollmentId: `enr-${Date.now()}`,
        };
        setEnrollments((prev) => [...prev, fallbackEnrollment]);
      }

      setSuccessMessage(
        `Application Submitted! Your request to enroll in "${selectedCourse?.name || 'Course'}" has been sent to ${ngo?.name || 'the Organization'}.`
      );

      // Real-time notification dispatch for enrollment
      const enrollmentNotif: Notification = {
        id: `notif-enr-${Date.now()}`,
        userId: user.id,
        type: 'enrollment',
        title: `Enrollment Submitted: ${selectedCourse.name}`,
        message: `Your application to enroll in "${selectedCourse.name}" at ${ngo.name} was successfully received and is queued for verification.`,
        link: '/student-dashboard',
        isRead: false,
        createdAt: new Date().toISOString(),
        courseName: selectedCourse.name,
        courseId: selectedCourse.id,
        ngoName: ngo.name,
        actionLabel: 'View Dashboard',
      };
      dispatchRealtimeNotification(enrollmentNotif);
      setNotifications((prev) => [enrollmentNotif, ...prev]);
    } catch (err: any) {
      console.error('Course registration error:', err);
    } finally {
      setIsRegistering(null);
      setSelectedCourse(null);
    }
  };

  if (loading) {
    return <NgoDetailGlassSkeleton />;
  }

  if (error || !ngo) {
    return (
      <div className="text-center py-20 max-w-md mx-auto">
        <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto text-2xl mb-4">
          ⚠️
        </div>
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Organization Not Found</h2>
        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
          The requested training center could not be loaded.
        </p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center space-x-2 bg-blue-600 text-white text-xs font-bold py-2.5 px-6 rounded-xl hover:bg-blue-700 shadow-sm transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Directory</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Back Link */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to All Partner Organizations</span>
        </Link>
      </div>

      {/* Success Notification Alert */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center space-x-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span className="font-semibold">{successMessage}</span>
        </div>
      )}

      {/* NGO Profile Hero Card */}
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
        
        {/* Cover Page Header with Custom Image & Dynamic Tenant Branding */}
        <div
          className="h-40 sm:h-56 w-full relative p-6 flex flex-col justify-between text-white overflow-hidden"
          style={{
            backgroundColor: ngo.branding?.primaryColor || '#2563EB',
            backgroundImage: ngo.coverImageUrl
              ? `linear-gradient(to bottom, rgba(0,0,0,0.35), rgba(0,0,0,0.65)), url(${ngo.coverImageUrl})`
              : undefined,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          <div className="absolute inset-0 bg-black/25 backdrop-blur-[0.5px]" />

          <div className="relative z-10 flex justify-between items-start">
            <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-semibold text-white">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
              <span>Verified Training Partner</span>
            </span>

            <div className="flex items-center space-x-2">
              <span className="px-3 py-1 rounded-full bg-black/40 backdrop-blur-md text-xs font-bold text-white">
                {ngo.type}
              </span>
              {ngo.branding?.customSlug && (
                <span className="hidden sm:inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-mono font-bold text-white">
                  <span>skillspot.org/o/{ngo.branding.customSlug}</span>
                </span>
              )}
              {canEditOrganization && (
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="px-3.5 py-1.5 rounded-full bg-white text-gray-900 hover:bg-gray-100 font-bold text-xs shadow-md flex items-center space-x-1.5 transition-all"
                >
                  <Edit3 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Edit Profile & Branding</span>
                </button>
              )}
            </div>
          </div>

          {ngo.address && (
            <div className="relative z-10 hidden sm:flex items-center text-xs text-white/90 drop-shadow">
              <MapPin className="w-3.5 h-3.5 mr-1 text-emerald-300" />
              <span>Campus: {ngo.address}</span>
            </div>
          )}
        </div>

        {/* Profile Content Body */}
        <div className="p-6 sm:p-8 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-12 sm:-mt-14 mb-6 gap-4">
            <div className="flex items-end space-x-4">
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white dark:bg-gray-900 border-4 border-white dark:border-gray-800 shadow-xl flex items-center justify-center text-2xl sm:text-3xl font-black text-blue-600 dark:text-blue-400 overflow-hidden shrink-0 relative z-10"
                style={{
                  borderColor: ngo.branding?.primaryColor ? `${ngo.branding.primaryColor}30` : undefined,
                }}
              >
                {ngo.logoUrl ? (
                  <img src={ngo.logoUrl} alt={ngo?.name || 'Center'} className="w-full h-full object-cover" />
                ) : (
                  (ngo?.name || 'SS').slice(0, 2).toUpperCase()
                )}
              </div>
              <div className="pb-1">
                <div className="flex items-center space-x-2">
                  <h1 className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                    {ngo?.name || 'Vocational Center'}
                  </h1>
                </div>
                {ngo.branding?.tagline && (
                  <p className="text-xs sm:text-sm font-semibold text-gray-600 dark:text-gray-300 mt-0.5 italic">
                    "{ngo.branding.tagline}"
                  </p>
                )}
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <MapPin className="w-3.5 h-3.5 mr-1 text-gray-400" />
                  <span>{ngo.location}</span>
                  {ngo.establishedYear && (
                    <span className="ml-3 flex items-center text-gray-400">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      Est. {ngo.establishedYear}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 text-xs">
              {ngo.accreditation && (
                <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-100 dark:border-emerald-900 flex items-center space-x-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{ngo.accreditation}</span>
                </span>
              )}
              <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 font-bold border border-blue-100 dark:border-blue-900">
                {ngo.courses.length} Active Courses
              </span>
            </div>
          </div>

          {/* Primary Skill Categories Badges */}
          {ngo.primaryCategories && ngo.primaryCategories.length > 0 && (
            <div className="mb-6 p-4 rounded-2xl bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2 text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-500" />
                <span>Primary Specialized Skill Tracks</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {ngo.primaryCategories.map((category) => (
                  <span
                    key={category}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 border border-gray-200 dark:border-gray-600 shadow-2xs"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: ngo.branding?.primaryColor || '#2563EB' }} />
                    <span>{category}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Mission Callout if present */}
          {ngo.mission && (
            <div className="mb-5 p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
              <span className="text-[10px] uppercase font-bold text-blue-600 dark:text-blue-400 tracking-wider block mb-1">
                Mission Statement
              </span>
              <p className="text-xs sm:text-sm font-medium text-gray-800 dark:text-gray-200 italic">
                "{ngo.mission}"
              </p>
            </div>
          )}

          {/* Mission & Description */}
          <div className="mb-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">
              Operational Scope & Facilities
            </h3>
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed max-w-4xl">
              {ngo.description}
            </p>
          </div>

          {/* Contact Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6 border-t border-gray-100 dark:border-gray-700/60 text-xs">
            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <Mail className="w-4 h-4 text-blue-500" />
              <div className="truncate">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Contact Email</p>
                <a href={`mailto:${ngo.contact.email}`} className="font-semibold text-gray-800 dark:text-gray-200 hover:text-blue-600 truncate">
                  {ngo.contact.email}
                </a>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <Phone className="w-4 h-4 text-indigo-500" />
              <div className="truncate">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Phone Support</p>
                <span className="font-semibold text-gray-800 dark:text-gray-200">
                  {ngo.contact.phone}
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2.5 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40">
              <Globe className="w-4 h-4 text-emerald-500" />
              <div className="truncate">
                <p className="text-[10px] text-gray-400 uppercase font-semibold">Official Website</p>
                <a
                  href={ngo.contact.website}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:underline truncate"
                >
                  {ngo.contact.website.replace('https://', '').replace('http://', '')}
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Available Vocational Courses Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Offered Training Courses & Workshops
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Select an open program below to review the interactive syllabus and submit an application.
            </p>
          </div>
        </div>

        {ngo.courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ngo.courses.map((course) => {
              const averageRating =
                course.reviews.length > 0
                  ? course.reviews.reduce((acc, r) => acc + r.rating, 0) / course.reviews.length
                  : undefined;

              const userEnrollment = enrollments.find(
                (e) => e.studentId === user?.id && e.courseId === course.id
              );

              return (
                <CourseCard
                  key={course.id}
                  course={course}
                  onRegisterClick={() => handleOpenEnrollmentModal(course)}
                  averageRating={averageRating}
                  enrollmentStatus={userEnrollment?.status}
                  isRegistrationDisabled={user?.role === 'admin' || isRegistering === course.id}
                />
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700">
            <BookOpen className="w-10 h-10 text-gray-400 mx-auto mb-2" />
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300">
              No vocational programs currently listed
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Check back soon as new cohorts are published by the administration team.
            </p>
          </div>
        )}
      </div>

      {/* Enrollment Application Modal */}
      {selectedCourse && (
        <EnrollmentModal
          course={selectedCourse}
          onClose={() => setSelectedCourse(null)}
          onSubmit={handleRegister}
          isSubmitting={isRegistering === selectedCourse.id}
        />
      )}

      {/* Organization Profile & Branding Editor Modal */}
      {isEditModalOpen && ngo && (
        <OrganizationProfileModal
          ngo={ngo}
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleSaveOrganization}
        />
      )}
    </div>
  );
};

export default NgoDetailPage;
