import React, { useState } from 'react';
import { Course, EnrollmentStatus } from '../types';
import CourseSyllabusModal from './CourseSyllabusModal';
import {
  Clock,
  Calendar,
  Users,
  Award,
  Star,
  BookOpen,
  CheckCircle,
  AlertCircle,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface CourseCardProps {
  course: Course;
  onRegisterClick: () => void;
  averageRating?: number;
  isRegistrationDisabled?: boolean;
  enrollmentStatus?: EnrollmentStatus;
}

const CourseCard: React.FC<CourseCardProps> = ({
  course,
  onRegisterClick,
  averageRating,
  isRegistrationDisabled,
  enrollmentStatus,
}) => {
  const [isSyllabusOpen, setIsSyllabusOpen] = useState(false);
  const isWaitlisted = course.seatsAvailable === 0;
  const moduleCount = course.modules?.length || 0;

  // Category Color Accent
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'Clean Energy':
        return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Trades & Construction':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Healthcare':
        return 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      case 'Culinary Arts':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-950/60 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      default: // Technology
        return 'bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300 border-blue-200 dark:border-blue-800';
    }
  };

  const getButtonState = () => {
    if (enrollmentStatus === 'Completed') {
      return {
        text: 'Graduated & Certified',
        disabled: true,
        className: 'bg-emerald-600 text-white cursor-default',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
      };
    }
    if (enrollmentStatus === 'Pending') {
      return {
        text: 'Application In Review',
        disabled: true,
        className: 'bg-amber-500 text-white cursor-default',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
      };
    }
    if (enrollmentStatus === 'Approved') {
      return {
        text: 'Active Cohort Enrolled',
        disabled: true,
        className: 'bg-blue-600 text-white cursor-default',
        icon: <CheckCircle className="w-3.5 h-3.5" />,
      };
    }
    if (isRegistrationDisabled) {
      return {
        text: 'Admin View Only',
        disabled: true,
        className: 'bg-gray-400 dark:bg-gray-600 text-white cursor-not-allowed',
        icon: null,
      };
    }
    if (isWaitlisted) {
      return {
        text: 'Join Waitlist',
        disabled: false,
        className: 'bg-amber-600 hover:bg-amber-700 text-white shadow-xs hover:shadow',
        icon: <AlertCircle className="w-3.5 h-3.5" />,
      };
    }
    return {
      text: 'Enroll In Cohort',
      disabled: false,
      className: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white shadow-md hover:shadow-lg',
      icon: <Sparkles className="w-3.5 h-3.5" />,
    };
  };

  const { text, disabled, className, icon } = getButtonState();

  return (
    <>
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl border border-gray-100 dark:border-gray-700 overflow-hidden flex flex-col transition-all duration-300 hover:-translate-y-1 group">
        
        <div className="p-6 flex-grow flex flex-col">
          
          {/* Header Row: Category Badge & Level & Rating */}
          <div className="flex justify-between items-center mb-3">
            <div className="flex flex-wrap gap-1.5 items-center">
              <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getCategoryStyles(course.category)}`}>
                {course.category}
              </span>
              {course.level && (
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300">
                  {course.level}
                </span>
              )}
            </div>

            {averageRating !== undefined && (
              <div className="flex items-center bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-lg border border-amber-200/60 dark:border-amber-900/60">
                <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-400 mr-1" />
                <span className="text-xs font-bold text-amber-900 dark:text-amber-300">
                  {averageRating.toFixed(1)}
                </span>
                <span className="text-[10px] text-gray-400 ml-1">
                  ({course.reviews?.length || 0})
                </span>
              </div>
            )}
          </div>

          {/* Course Name */}
          <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {course.name}
          </h3>

          {/* Description */}
          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed mb-4 line-clamp-2">
            {course.description}
          </p>

          {/* Key Metadata Pill Badges */}
          <div className="grid grid-cols-2 gap-2 text-xs text-gray-600 dark:text-gray-300 mb-4 bg-gray-50 dark:bg-gray-700/40 p-3 rounded-xl border border-gray-100 dark:border-gray-700/60">
            <div className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
              <span className="truncate">{course.duration}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" />
              <span className="truncate">Starts: {course.startDate}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Users className="w-3.5 h-3.5 text-purple-500 flex-shrink-0" />
              <span className="truncate">{course.trainer}</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0" />
              <span className={`truncate font-semibold ${isWaitlisted ? 'text-amber-600 dark:text-amber-400' : 'text-emerald-600 dark:text-emerald-400'}`}>
                {course.seatsAvailable} seats left
              </span>
            </div>
          </div>

          {/* Syllabus & Curriculum Highlights */}
          {moduleCount > 0 && (
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setIsSyllabusOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100/70 transition-colors text-xs font-semibold"
              >
                <div className="flex items-center space-x-2">
                  <BookOpen className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                  <span>Interactive Syllabus ({moduleCount} Modules)</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Certificate Badge */}
          {course.certificationBadge && (
            <div className="mt-auto pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
              <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-300 font-semibold text-[11px]">
                <Award className="w-4 h-4 text-emerald-500" />
                <span className="truncate">{course.certificationBadge}</span>
              </div>
            </div>
          )}

        </div>

        {/* Action Button Footer */}
        <div className="p-4 bg-gray-50/70 dark:bg-gray-800/60 border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={onRegisterClick}
            disabled={disabled}
            className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs transition-all flex items-center justify-center space-x-2 ${className}`}
          >
            {icon}
            <span>{text}</span>
          </button>
        </div>

      </div>

      {/* Course Syllabus Modal */}
      {isSyllabusOpen && (
        <CourseSyllabusModal
          course={course}
          isOpen={isSyllabusOpen}
          onClose={() => setIsSyllabusOpen(false)}
        />
      )}
    </>
  );
};

export default CourseCard;
