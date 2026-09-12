import React, { useState } from 'react';
import { Course, CourseModule } from '../types';

interface CourseSyllabusModalProps {
  course: Course;
  onClose: () => void;
  onEnrollClick?: () => void;
  isEnrolled?: boolean;
}

const CourseSyllabusModal: React.FC<CourseSyllabusModalProps> = ({
  course,
  onClose,
  onEnrollClick,
  isEnrolled
}) => {
  const [expandedModuleId, setExpandedModuleId] = useState<string | null>(
    course.modules && course.modules.length > 0 ? course.modules[0].id : null
  );

  const modules = course.modules || [];
  const totalHours = modules.reduce((sum, m) => sum + (m.durationHours || 12), 0);

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700 animate-fadeIn">
        {/* Modal Header */}
        <div className="p-6 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white flex justify-between items-start">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-white/20 text-white backdrop-blur-sm">
                {course.category}
              </span>
              {course.level && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/80 text-white">
                  {course.level}
                </span>
              )}
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/80 text-white">
                {course.duration}
              </span>
            </div>
            <h2 className="text-2xl font-black">{course.name}</h2>
            <p className="text-xs text-blue-100 mt-1 max-w-xl">
              Instructor: <span className="font-semibold text-white">{course.trainer}</span> • Starts {new Date(course.startDate).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {/* Overview & Credentials */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-xl border border-gray-200 dark:border-gray-700">
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Curriculum Volume</span>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {modules.length} Detailed Modules
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">~{totalHours || 60} estimated study hours</p>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Credential Included</span>
              <p className="text-base font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                <svg className="w-4 h-4 mr-1 inline" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Verifiable Certificate
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{course.certificationBadge || 'SkillSpot Verified'}</p>
            </div>
            <div>
              <span className="text-[11px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Classroom Availability</span>
              <p className="text-base font-bold text-gray-900 dark:text-white">
                {course.seatsAvailable > 0 ? `${course.seatsAvailable} Seats Open` : 'Waitlist Only'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">Cohort size capped at 15</p>
            </div>
          </div>

          {/* Description */}
          <div>
            <h4 className="text-sm font-bold text-gray-900 dark:text-white mb-2">About This Program</h4>
            <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Prerequisites */}
          {course.prerequisites && course.prerequisites.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-950/30 p-4 rounded-xl border border-amber-200 dark:border-amber-800/60">
              <h4 className="text-xs font-bold text-amber-900 dark:text-amber-300 uppercase tracking-wider mb-2 flex items-center">
                <svg className="w-4 h-4 mr-1.5 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Course Prerequisites & Requirements
              </h4>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-amber-800 dark:text-amber-300">
                {course.prerequisites.map((req, idx) => (
                  <li key={idx} className="flex items-start">
                    <span className="mr-1.5 text-amber-500">•</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Module-by-Module Syllabus Accordion */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <h4 className="text-base font-bold text-gray-900 dark:text-white flex items-center">
                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                Weekly Syllabus & Curriculum Breakdown
              </h4>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Click any week to view topics
              </span>
            </div>

            {modules.length === 0 ? (
              <div className="text-center p-6 bg-gray-50 dark:bg-gray-700/30 rounded-xl border border-gray-200 dark:border-gray-700">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Detailed weekly modules are being updated by the NGO instructor. Check back shortly.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {modules.map((mod: CourseModule) => {
                  const isExpanded = expandedModuleId === mod.id;
                  return (
                    <div
                      key={mod.id}
                      className={`border rounded-xl transition-all ${
                        isExpanded
                          ? 'border-blue-500 bg-blue-50/20 dark:bg-blue-900/10 shadow-sm'
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                    >
                      <button
                        onClick={() => setExpandedModuleId(isExpanded ? null : mod.id)}
                        className="w-full flex justify-between items-center p-4 text-left font-medium"
                      >
                        <div className="flex items-center space-x-3">
                          <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                            isExpanded 
                              ? 'bg-blue-600 text-white shadow' 
                              : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                          }`}>
                            W{mod.weekNumber}
                          </span>
                          <div>
                            <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                              {mod.title}
                            </h5>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              Week {mod.weekNumber} • ~{mod.durationHours || 15} hours
                            </p>
                          </div>
                        </div>

                        <svg
                          className={`w-5 h-5 text-gray-400 transform transition-transform ${isExpanded ? 'rotate-180 text-blue-600' : ''}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>

                      {isExpanded && (
                        <div className="px-4 pb-4 pt-1 border-t border-gray-100 dark:border-gray-700/60 space-y-3">
                          <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed">
                            {mod.description}
                          </p>

                          {/* Topics Covered */}
                          <div>
                            <span className="text-[11px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider block mb-1.5">
                              Core Topics Covered:
                            </span>
                            <div className="flex flex-wrap gap-1.5">
                              {mod.topics.map((topic, tIdx) => (
                                <span
                                  key={tIdx}
                                  className="px-2.5 py-1 rounded-md text-xs bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-2xs font-mono"
                                >
                                  ✓ {topic}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Deliverable / Project */}
                          {mod.deliverable && (
                            <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950/30 p-2.5 rounded-lg border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-900 dark:text-emerald-300">
                              <span className="font-bold">Deliverable:</span>
                              <span>{mod.deliverable}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700 flex justify-between items-center">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200"
          >
            Close Syllabus
          </button>

          {onEnrollClick && (
            <button
              onClick={() => {
                onClose();
                onEnrollClick();
              }}
              disabled={isEnrolled}
              className={`px-6 py-2.5 text-xs font-bold rounded-lg text-white transition-all shadow-md ${
                isEnrolled 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700 hover:shadow-lg'
              }`}
            >
              {isEnrolled ? 'Already Enrolled' : 'Apply for this Course'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseSyllabusModal;
