import React, { useState } from 'react';
import { Enrollment, Course, AssignmentSubmission } from '../types';
import { useData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import {
  FileCheck,
  Send,
  X,
  CheckCircle2,
  Clock,
  Award,
  Link2,
  UploadCloud,
  FileText,
} from 'lucide-react';

interface AssignmentSubmissionModalProps {
  enrollment: Enrollment;
  course?: Course;
  onClose: () => void;
}

export const AssignmentSubmissionModal: React.FC<AssignmentSubmissionModalProps> = ({
  enrollment,
  course,
  onClose,
}) => {
  const { assignmentSubmissions, setAssignmentSubmissions, setNotifications } = useData();
  const { user } = useAuth();

  const [deliverableTitle, setDeliverableTitle] = useState('');
  const [selectedModuleId, setSelectedModuleId] = useState(
    course?.modules && course.modules.length > 0 ? course.modules[0].id : 'mod-1'
  );
  const [deliverableLink, setDeliverableLink] = useState('');
  const [notes, setNotes] = useState('');
  const [successNotice, setSuccessNotice] = useState(false);

  // Submissions for this enrollment
  const currentSubmissions = assignmentSubmissions.filter(
    (s) => s.enrollmentId === enrollment.enrollmentId
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!deliverableTitle || !user) return;

    const newSub: AssignmentSubmission = {
      id: `sub-${Date.now()}`,
      enrollmentId: enrollment.enrollmentId,
      moduleId: selectedModuleId,
      studentId: user.id,
      studentName: user.name,
      courseId: enrollment.courseId,
      deliverableTitle,
      deliverableUrl: deliverableLink || undefined,
      notes,
      submittedAt: new Date().toISOString(),
      status: 'Under Review',
    };

    setAssignmentSubmissions((prev) => [newSub, ...prev]);

    setNotifications((prev) => [
      {
        id: `notif-${Date.now()}`,
        userId: user.id,
        message: `Milestone submission for "${deliverableTitle}" uploaded to instructor inbox.`,
        link: '/student-dashboard',
        isRead: false,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);

    setSuccessNotice(true);
    setTimeout(() => {
      setSuccessNotice(false);
      setDeliverableTitle('');
      setDeliverableLink('');
      setNotes('');
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-xl w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700 space-y-5">
        <div className="flex justify-between items-start border-b pb-4 dark:border-gray-700">
          <div>
            <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider flex items-center space-x-1">
              <FileCheck className="w-3.5 h-3.5" />
              <span>Vocational Milestone Turn-In</span>
            </span>
            <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
              {enrollment.courseName}
            </h3>
            <p className="text-xs text-gray-500">
              Submit hands-on shop reports, design schematics, or photos of your completed project.
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Previous Submissions Accordion / List */}
        {currentSubmissions.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider block">
              Previous Milestone Turn-Ins ({currentSubmissions.length})
            </span>
            <div className="space-y-2">
              {currentSubmissions.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 bg-gray-50 dark:bg-gray-750 rounded-xl border border-gray-100 dark:border-gray-700 text-xs space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-gray-900 dark:text-white">
                      {sub.deliverableTitle}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        sub.status === 'Approved & Graded'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                      }`}
                    >
                      {sub.status}
                    </span>
                  </div>
                  {sub.grade && (
                    <div className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center space-x-1">
                      <Award className="w-3.5 h-3.5" />
                      <span>Grade: {sub.grade}</span>
                    </div>
                  )}
                  {sub.trainerFeedback && (
                    <p className="p-2 bg-white dark:bg-gray-800 rounded-lg text-[11px] text-gray-600 dark:text-gray-300 border border-emerald-100 dark:border-emerald-900/40">
                      <strong>Trainer Feedback:</strong> {sub.trainerFeedback}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Turn-In Form */}
        <form onSubmit={handleSubmit} className="space-y-4 text-xs pt-2 border-t dark:border-gray-700">
          <span className="text-xs font-bold text-gray-900 dark:text-white block">
            Submit New Assignment Deliverable
          </span>

          {successNotice && (
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 flex items-center space-x-2 border border-emerald-200 dark:border-emerald-800">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Deliverable submitted successfully to course instructor!</span>
            </div>
          )}

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Curriculum Module / Topic
            </label>
            <select
              value={selectedModuleId}
              onChange={(e) => setSelectedModuleId(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold"
            >
              {course?.modules && course.modules.length > 0 ? (
                course.modules.map((m) => (
                  <option key={m.id} value={m.id}>
                    Week {m.weekNumber}: {m.title}
                  </option>
                ))
              ) : (
                <option value="capstone">Final Practical Capstone Examination</option>
              )}
            </select>
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Deliverable Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. PV Array String Sizing Calculation & Single-Line Diagram"
              value={deliverableTitle}
              onChange={(e) => setDeliverableTitle(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Project Drive Link, GitHub, or Video Demo (Optional)
            </label>
            <input
              type="url"
              placeholder="https://drive.google.com/... or https://github.com/..."
              value={deliverableLink}
              onChange={(e) => setDeliverableLink(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
              Submission Summary & Practical Notes
            </label>
            <textarea
              required
              rows={3}
              placeholder="Detail your practical procedure, tools utilized, test measurements, and safety measures applied..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
            />
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
            >
              Close
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md flex items-center space-x-1.5"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit for Instructor Grading</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AssignmentSubmissionModal;
