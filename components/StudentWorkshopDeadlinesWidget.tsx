import React, { useState } from 'react';
import {
  Clock,
  AlertTriangle,
  FileCheck,
  CheckCircle2,
  Calendar,
  Sparkles,
  Award,
  BookOpen,
  Send,
  Volume2,
  VolumeX,
  ChevronRight,
  ShieldAlert,
  Flame,
} from 'lucide-react';
import { Enrollment, Course, NGO, WorkshopDeadline, Notification } from '../types';
import {
  getStudentUpcomingDeadlines,
  getTimeRemainingText,
  dispatchRealtimeNotification,
} from '../services/realtimeNotificationService';

interface StudentWorkshopDeadlinesWidgetProps {
  enrollments: Enrollment[];
  ngos: NGO[];
  userId: string;
  userName: string;
  onSubmitMilestone?: (enrollment: Enrollment, course?: Course) => void;
  onViewSyllabus?: (course: Course) => void;
  onViewCertificate?: (payload: { enrollment: Enrollment; course?: Course; ngo?: NGO }) => void;
  onNotificationGenerated?: (notification: Notification) => void;
}

export const StudentWorkshopDeadlinesWidget: React.FC<StudentWorkshopDeadlinesWidgetProps> = ({
  enrollments,
  ngos,
  userId,
  userName,
  onSubmitMilestone,
  onViewSyllabus,
  onViewCertificate,
  onNotificationGenerated,
}) => {
  const activeEnrollments = enrollments.filter((e) => e.status === 'Approved' || e.status === 'Completed');
  const deadlines = getStudentUpcomingDeadlines(activeEnrollments);
  const [filterType, setFilterType] = useState<'all' | 'urgent' | 'project'>('all');
  const [isSoundMuted, setIsSoundMuted] = useState(() => {
    return localStorage.getItem('skillspot_sound_enabled') === 'false';
  });

  const toggleSound = () => {
    setIsSoundMuted((prev) => {
      const next = !prev;
      localStorage.setItem('skillspot_sound_enabled', next ? 'false' : 'true');
      return next;
    });
  };

  const filteredDeadlines = deadlines.filter((dl) => {
    if (filterType === 'urgent') return dl.priority === 'urgent';
    if (filterType === 'project') return dl.type === 'project';
    return true;
  });

  // Simulator helper: Trigger a Real-time Workshop Deadline Alert
  const handleSimulateDeadlineAlert = (deadline: WorkshopDeadline) => {
    const notif: Notification = {
      id: `notif-dl-${Date.now()}`,
      userId: userId,
      type: 'deadline',
      title: `Upcoming Workshop Deadline: ${deadline.title}`,
      message: `Heads-up! "${deadline.title}" for ${deadline.courseName} is due soon. Submit your practical deliverable to maintain certification eligibility.`,
      link: '/student-dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: 'urgent',
      courseName: deadline.courseName,
      courseId: deadline.courseId,
      deadlineDate: deadline.dueDate,
      actionLabel: 'Submit Milestone',
    };

    dispatchRealtimeNotification(notif);
    if (onNotificationGenerated) onNotificationGenerated(notif);
  };

  // Simulator helper: Trigger a Real-time Certificate Issuance
  const handleSimulateCertificateAlert = () => {
    const sampleCourseName = activeEnrollments[0]?.courseName || 'Precision Vocational Program';
    const notif: Notification = {
      id: `notif-cert-${Date.now()}`,
      userId: userId,
      type: 'certificate',
      title: `Accredited Certificate Issued!`,
      message: `🎉 Outstanding work! Your verified graduation credential for "${sampleCourseName}" has been issued and placed on the public blockchain verification ledger.`,
      link: '/student-dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: 'high',
      courseName: sampleCourseName,
      certificateId: `CERT-${Math.floor(100000 + Math.random() * 900000)}`,
      actionLabel: 'View Certificate',
    };

    dispatchRealtimeNotification(notif);
    if (onNotificationGenerated) onNotificationGenerated(notif);
  };

  // Simulator helper: Trigger a Real-time Enrollment Approval
  const handleSimulateEnrollmentAlert = () => {
    const notif: Notification = {
      id: `notif-enr-${Date.now()}`,
      userId: userId,
      type: 'enrollment',
      title: `Cohort Enrollment Approved!`,
      message: `Congratulations! TechForward Foundation has reviewed and Approved your seat for the upcoming vocational cohort. Access syllabus and lab schedule now.`,
      link: '/student-dashboard',
      isRead: false,
      createdAt: new Date().toISOString(),
      priority: 'normal',
      courseName: 'Advanced Trade Skills Cohort',
      actionLabel: 'View Cohort',
    };

    dispatchRealtimeNotification(notif);
    if (onNotificationGenerated) onNotificationGenerated(notif);
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
      {/* Header & Status Indicator */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-700/80 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-gray-900 dark:text-white">
              Real-Time Workshop Alerts & Deadlines
            </h3>
            <span className="flex items-center space-x-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 text-[10px] font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              <span>Live Engine</span>
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Automated notifications tracking hands-on workshop assessments, equipment sign-offs, and project deadlines.
          </p>
        </div>

        {/* Filter Chips */}
        <div className="flex items-center space-x-1.5 bg-gray-100 dark:bg-gray-750 p-1 rounded-xl shrink-0">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
              filterType === 'all'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-300'
            }`}
          >
            All ({deadlines.length})
          </button>
          <button
            onClick={() => setFilterType('urgent')}
            className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all flex items-center space-x-1 ${
              filterType === 'urgent'
                ? 'bg-amber-500 text-white shadow-2xs'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-300'
            }`}
          >
            <Flame className="w-3 h-3" />
            <span>Urgent</span>
          </button>
          <button
            onClick={() => setFilterType('project')}
            className={`px-3 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
              filterType === 'project'
                ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 shadow-2xs'
                : 'text-gray-500 hover:text-gray-900 dark:text-gray-300'
            }`}
          >
            Projects
          </button>
        </div>
      </div>

      {/* Deadlines List */}
      {filteredDeadlines.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 dark:bg-gray-750/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700">
          <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
          <p className="text-xs font-bold text-gray-700 dark:text-gray-200">No pending workshop deadlines</p>
          <p className="text-[11px] text-gray-400 mt-0.5">All required assessments and practical milestones are up to date.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          {filteredDeadlines.map((dl) => {
            const timeInfo = getTimeRemainingText(dl.dueDate);
            const matchingEnrollment = enrollments.find(
              (e) => e.courseId === dl.courseId || e.courseName.toLowerCase() === dl.courseName.toLowerCase()
            );
            const matchingNgo = ngos.find((n) => n.id === dl.ngoId);
            const matchingCourse = matchingNgo?.courses?.find((c) => c.id === dl.courseId || c.name === dl.courseName);

            return (
              <div
                key={dl.id}
                className={`p-4 rounded-2xl border transition-all hover:shadow-md flex flex-col justify-between ${
                  timeInfo.isUrgent
                    ? 'bg-gradient-to-br from-amber-50/70 to-orange-50/40 dark:from-amber-950/20 dark:to-orange-950/10 border-amber-200 dark:border-amber-800/60'
                    : 'bg-white dark:bg-gray-750/70 border-gray-100 dark:border-gray-700'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-1.5 flex-wrap">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                          timeInfo.isUrgent
                            ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                            : 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        }`}
                      >
                        {dl.type === 'safety_quiz'
                          ? 'Safety Exam'
                          : dl.type === 'tool_inspection'
                          ? 'Equipment Sign-off'
                          : 'Workshop Deliverable'}
                      </span>
                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold truncate max-w-[160px]">
                        {dl.courseName}
                      </span>
                    </div>

                    {/* Countdown Badge */}
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0 flex items-center space-x-1 ${
                        timeInfo.isUrgent
                          ? 'bg-amber-500 text-white animate-pulse'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      <Clock className="w-3 h-3" />
                      <span>{timeInfo.label}</span>
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-2">
                    {dl.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 line-clamp-2 leading-relaxed">
                    {dl.description}
                  </p>
                </div>

                {/* Bottom Action Footer */}
                <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between gap-2">
                  <span className="text-[10px] text-gray-400 flex items-center space-x-1">
                    <Calendar className="w-3 h-3" />
                    <span>Due: {new Date(dl.dueDate).toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                  </span>

                  <div className="flex items-center space-x-1.5">
                    {onSubmitMilestone && matchingEnrollment && (
                      <button
                        onClick={() => onSubmitMilestone(matchingEnrollment, matchingCourse)}
                        className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] flex items-center space-x-1 transition-all"
                      >
                        <FileCheck className="w-3 h-3" />
                        <span>Submit</span>
                      </button>
                    )}
                    <button
                      onClick={() => handleSimulateDeadlineAlert(dl)}
                      className="px-2 py-1 rounded-lg border border-amber-300 dark:border-amber-700/80 hover:bg-amber-50 dark:hover:bg-amber-950/40 text-amber-700 dark:text-amber-300 font-bold text-[10px] flex items-center space-x-1 transition-all"
                      title="Trigger a real-time reminder chime and toast for this deadline"
                    >
                      <span>Alert Me</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Interactive Real-Time Notification Simulator Toolbar */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-gray-750 dark:via-gray-750 dark:to-gray-750 border border-blue-100 dark:border-gray-700 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h5 className="text-xs font-bold text-gray-900 dark:text-white uppercase tracking-wider">
              Real-Time Event Tester & Simulator
            </h5>
          </div>
          <button
            onClick={toggleSound}
            className="self-start sm:self-auto px-2.5 py-1 rounded-lg bg-white dark:bg-gray-800 text-[11px] font-bold text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 flex items-center space-x-1.5 hover:bg-gray-50 transition-colors"
          >
            {isSoundMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-500" />}
            <span>{isSoundMuted ? 'Chimes Muted' : 'Chimes Enabled'}</span>
          </button>
        </div>

        <p className="text-[11px] text-gray-500 dark:text-gray-400">
          Click any test trigger below to verify real-time toast banners, Web Audio synthesizers, and cross-tab synchronization:
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            onClick={() => handleSimulateDeadlineAlert(deadlines[0] || SEEDED_WORKSHOP_DEADLINES[0])}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center space-x-1.5 transition-all"
          >
            <Clock className="w-3.5 h-3.5" />
            <span>⏰ Send Deadline Alert</span>
          </button>

          <button
            onClick={handleSimulateEnrollmentAlert}
            className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center space-x-1.5 transition-all"
          >
            <BookOpen className="w-3.5 h-3.5" />
            <span>📚 Send Enrollment Approval</span>
          </button>

          <button
            onClick={handleSimulateCertificateAlert}
            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center space-x-1.5 transition-all"
          >
            <Award className="w-3.5 h-3.5" />
            <span>🎓 Issue Realtime Certificate</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentWorkshopDeadlinesWidget;
