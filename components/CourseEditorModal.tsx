import React, { useState, useEffect } from 'react';
import { Course, CourseModule } from '../types';

interface CourseEditorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (course: Course) => void;
  course: Course | null;
}

const CourseEditorModal: React.FC<CourseEditorModalProps> = ({ isOpen, onClose, onSave, course }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'syllabus'>('details');

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category: '',
    duration: '',
    trainer: '',
    seatsAvailable: '10',
    startDate: new Date().toISOString().split('T')[0],
    level: 'Beginner' as 'Beginner' | 'Intermediate' | 'Advanced' | 'All Levels',
    certificationBadge: '',
  });

  const [prerequisites, setPrerequisites] = useState<string[]>([]);
  const [newPrereqInput, setNewPrereqInput] = useState('');

  const [modules, setModules] = useState<CourseModule[]>([]);
  const [editingModule, setEditingModule] = useState<CourseModule | null>(null);

  // New module subform state
  const [newModuleTitle, setNewModuleTitle] = useState('');
  const [newModuleDesc, setNewModuleDesc] = useState('');
  const [newModuleTopics, setNewModuleTopics] = useState('');
  const [newModuleDeliverable, setNewModuleDeliverable] = useState('');
  const [newModuleHours, setNewModuleHours] = useState('15');

  const [error, setError] = useState('');
  
  const inputClasses = "w-full px-4 py-2 border rounded-lg bg-white text-gray-900 border-gray-300 placeholder-gray-500 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 text-sm";

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        description: course.description,
        category: course.category,
        duration: course.duration,
        trainer: course.trainer,
        seatsAvailable: String(course.seatsAvailable),
        startDate: course.startDate.split('T')[0],
        level: course.level || 'Beginner',
        certificationBadge: course.certificationBadge || `${course.name} Certificate`,
      });
      setPrerequisites(course.prerequisites || []);
      setModules(course.modules || []);
    } else {
      // Reset for new course
      setFormData({
        name: '', 
        description: '', 
        category: '', 
        duration: '8 Weeks', 
        trainer: '',
        seatsAvailable: '12', 
        startDate: new Date().toISOString().split('T')[0],
        level: 'Beginner',
        certificationBadge: '',
      });
      setPrerequisites([]);
      setModules([]);
    }
    setActiveTab('details');
    setError('');
  }, [course, isOpen]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPrereq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPrereqInput.trim()) return;
    if (!prerequisites.includes(newPrereqInput.trim())) {
      setPrerequisites([...prerequisites, newPrereqInput.trim()]);
    }
    setNewPrereqInput('');
  };

  const handleRemovePrereq = (indexToRemove: number) => {
    setPrerequisites(prerequisites.filter((_, idx) => idx !== indexToRemove));
  };

  // Add / Save Module
  const handleSaveModule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newModuleTitle.trim()) return;

    const topicsArray = newModuleTopics
      .split(',')
      .map(t => t.trim())
      .filter(Boolean);

    if (editingModule) {
      setModules(prev => prev.map(m => m.id === editingModule.id ? {
        ...m,
        title: newModuleTitle.trim(),
        description: newModuleDesc.trim(),
        topics: topicsArray.length > 0 ? topicsArray : ['Core concepts'],
        deliverable: newModuleDeliverable.trim() || undefined,
        durationHours: parseInt(newModuleHours, 10) || 15
      } : m));
      setEditingModule(null);
    } else {
      const newMod: CourseModule = {
        id: `mod-${Date.now()}-${modules.length + 1}`,
        weekNumber: modules.length + 1,
        title: newModuleTitle.trim(),
        description: newModuleDesc.trim(),
        topics: topicsArray.length > 0 ? topicsArray : ['Foundational review'],
        deliverable: newModuleDeliverable.trim() || undefined,
        durationHours: parseInt(newModuleHours, 10) || 15
      };
      setModules([...modules, newMod]);
    }

    // Reset module inputs
    setNewModuleTitle('');
    setNewModuleDesc('');
    setNewModuleTopics('');
    setNewModuleDeliverable('');
    setNewModuleHours('15');
  };

  const handleEditModuleClick = (m: CourseModule) => {
    setEditingModule(m);
    setNewModuleTitle(m.title);
    setNewModuleDesc(m.description);
    setNewModuleTopics(Array.isArray(m.topics) ? m.topics.join(', ') : (m.topics || ''));
    setNewModuleDeliverable(m.deliverable || '');
    setNewModuleHours(String(m.durationHours || 15));
  };

  const handleDeleteModule = (modId: string) => {
    setModules(prev => prev.filter(m => m.id !== modId).map((m, idx) => ({ ...m, weekNumber: idx + 1 })));
    if (editingModule?.id === modId) {
      setEditingModule(null);
      setNewModuleTitle('');
      setNewModuleDesc('');
      setNewModuleTopics('');
      setNewModuleDeliverable('');
    }
  };

  // Auto-generate standard 4-week syllabus template
  const handleGenerateTemplateSyllabus = () => {
    const courseTitle = formData.name || 'Professional Skills';
    const cat = formData.category || 'Skill Development';
    
    const templateModules: CourseModule[] = [
      {
        id: `mod-auto-1-${Date.now()}`,
        weekNumber: 1,
        title: `Foundations of ${cat}`,
        description: `Introduction to the essential terminology, tooling, and workflow practices in ${cat}.`,
        topics: ['Orientation & Safety/Tooling', 'Core Principles', 'Industry Best Practices'],
        deliverable: 'Initial Setup & Assessment Quiz',
        durationHours: 12
      },
      {
        id: `mod-auto-2-${Date.now()}`,
        weekNumber: 2,
        title: 'Core Methodologies & Hands-On Labs',
        description: `Deep dive into the day-to-day execution techniques with guided practical assignments.`,
        topics: ['Intermediate Techniques', 'Problem Solving & Troubleshooting', 'Lab Exercise'],
        deliverable: 'Hands-On Lab Assignment',
        durationHours: 16
      },
      {
        id: `mod-auto-3-${Date.now()}`,
        weekNumber: 3,
        title: 'Advanced Applied Projects',
        description: `Synthesizing real-world community challenges into actionable prototypes and deliverables.`,
        topics: ['Collaborative Workflow', 'Performance Tuning', 'Quality Assurance'],
        deliverable: 'Draft Capstone Project',
        durationHours: 18
      },
      {
        id: `mod-auto-4-${Date.now()}`,
        weekNumber: 4,
        title: 'Capstone Evaluation & Certification Portfolio',
        description: `Final presentation of completed work, feedback review, and industry certification readiness.`,
        topics: ['Portfolio Showcase', 'Peer Review', 'Career Readiness & Credential Defense'],
        deliverable: 'Final Verified Capstone Portfolio',
        durationHours: 14
      }
    ];

    setModules(templateModules);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.category || !formData.startDate) {
      setError('Name, Category, and Start Date are required.');
      return;
    }
    
    const courseData: Course = {
      id: course?.id || `course-${Date.now()}`,
      name: formData.name,
      description: formData.description,
      category: formData.category,
      duration: formData.duration,
      trainer: formData.trainer,
      startDate: formData.startDate,
      seatsAvailable: parseInt(formData.seatsAvailable, 10) || 0,
      level: formData.level,
      certificationBadge: formData.certificationBadge || `${formData.name} Certified`,
      prerequisites: prerequisites,
      modules: modules,
      reviews: course?.reviews || [],
    };

    onSave(courseData);
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-gray-100 dark:border-gray-700">
        
        {/* Header */}
        <div className="p-6 bg-gray-50 dark:bg-gray-700/50 border-b dark:border-gray-700 flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {course ? 'Edit Course & Curriculum' : 'Add New Vocational Course'}
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Configure course details, credentialing badges, and weekly syllabus modules.
            </p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 dark:hover:text-white text-2xl font-bold">&times;</button>
        </div>

        {/* Tab Selector */}
        <div className="flex border-b dark:border-gray-700 bg-gray-100 dark:bg-gray-800/80 px-6 pt-2">
          <button
            type="button"
            onClick={() => setActiveTab('details')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors ${
              activeTab === 'details'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            1. Core Course Details
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('syllabus')}
            className={`pb-3 px-4 text-xs font-bold border-b-2 transition-colors flex items-center space-x-1.5 ${
              activeTab === 'syllabus'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            }`}
          >
            <span>2. Syllabus & Modules</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200">
              {modules.length}
            </span>
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-grow">
          {activeTab === 'details' ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Course Title *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="e.g., Solar Installation & Grid Maintenance"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Course Description *</label>
                <textarea
                  name="description"
                  placeholder="Comprehensive summary of program objectives and vocational outcomes..."
                  value={formData.description}
                  onChange={handleChange}
                  required
                  className={inputClasses}
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Skill Category *</label>
                  <input
                    type="text"
                    name="category"
                    placeholder="e.g., Renewable Energy, Technology, Healthcare"
                    value={formData.category}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Course Duration *</label>
                  <input
                    type="text"
                    name="duration"
                    placeholder="e.g., 6 Weeks, 12 Weeks"
                    value={formData.duration}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Instructor / Trainer Name</label>
                  <input
                    type="text"
                    name="trainer"
                    placeholder="e.g., Maria Santos, PE"
                    value={formData.trainer}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Seats Available *</label>
                  <input
                    type="number"
                    name="seatsAvailable"
                    placeholder="15"
                    value={formData.seatsAvailable}
                    onChange={handleChange}
                    required
                    min="0"
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={formData.startDate}
                    onChange={handleChange}
                    required
                    className={inputClasses}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">Skill Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className={inputClasses}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                    <option value="All Levels">All Levels</option>
                  </select>
                </div>
              </div>

              {/* Certificate badge title */}
              <div>
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Verifiable Certificate Title
                </label>
                <input
                  type="text"
                  name="certificationBadge"
                  placeholder="e.g., Certified Solar PV Technician (Level 1)"
                  value={formData.certificationBadge}
                  onChange={handleChange}
                  className={inputClasses}
                />
                <p className="text-[11px] text-gray-400 mt-1">Printed on the student's official downloadable completion certificate.</p>
              </div>

              {/* Prerequisites Manager */}
              <div className="pt-2">
                <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Prerequisites & Requirements
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newPrereqInput}
                    onChange={e => setNewPrereqInput(e.target.value)}
                    placeholder="e.g. Basic algebra or laptop access"
                    className={inputClasses}
                    onKeyDown={e => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        if (newPrereqInput.trim()) {
                          setPrerequisites([...prerequisites, newPrereqInput.trim()]);
                          setNewPrereqInput('');
                        }
                      }
                    }}
                  />
                  <button
                    type="button"
                    onClick={handleAddPrereq}
                    className="px-4 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-xs font-bold rounded-lg"
                  >
                    Add
                  </button>
                </div>

                {prerequisites.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {prerequisites.map((req, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center px-2.5 py-1 rounded-full text-xs bg-blue-50 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 border border-blue-200 dark:border-blue-700"
                      >
                        <span>{req}</span>
                        <button
                          type="button"
                          onClick={() => handleRemovePrereq(idx)}
                          className="ml-1.5 text-blue-500 hover:text-red-500 font-bold"
                        >
                          &times;
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Syllabus & Modules Management Tab */
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 bg-blue-50 dark:bg-blue-950/30 p-4 rounded-xl border border-blue-200 dark:border-blue-800/50">
                <div>
                  <h4 className="text-sm font-bold text-blue-900 dark:text-blue-300">Curriculum Structure ({modules.length} Modules)</h4>
                  <p className="text-xs text-blue-700 dark:text-blue-400">
                    Break down this course into week-by-week learning goals, hands-on projects, and topics.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateTemplateSyllabus}
                  className="px-3 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow-xs flex items-center space-x-1"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Auto-Fill 4-Week Template</span>
                </button>
              </div>

              {/* Module List */}
              <div className="space-y-3">
                {modules.map((m, idx) => (
                  <div
                    key={m.id}
                    className="p-4 bg-gray-50 dark:bg-gray-700/40 rounded-xl border border-gray-200 dark:border-gray-700 flex justify-between items-start"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                          Week {m.weekNumber}
                        </span>
                        <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                          {m.title}
                        </h5>
                        <span className="text-xs text-gray-400">({m.durationHours || 15} hrs)</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-300">{m.description}</p>
                      <div className="flex flex-wrap gap-1 pt-1">
                        {m.topics.map((t, tIdx) => (
                          <span key={tIdx} className="text-[10px] bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-1.5 py-0.5 rounded border border-gray-200 dark:border-gray-600">
                            {t}
                          </span>
                        ))}
                      </div>
                      {m.deliverable && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium pt-1">
                          📌 Deliverable: {m.deliverable}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-2 ml-4">
                      <button
                        type="button"
                        onClick={() => handleEditModuleClick(m)}
                        className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteModule(m.id)}
                        className="text-xs font-semibold text-red-500 hover:underline"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Add / Edit Module Sub-Form */}
              <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3">
                <h5 className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {editingModule ? `Edit Module (Week ${editingModule.weekNumber})` : `+ Add Module (Week ${modules.length + 1})`}
                </h5>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="sm:col-span-2">
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Module Title</label>
                    <input
                      type="text"
                      placeholder="e.g., Responsive Layouts & Design Tokens"
                      value={newModuleTitle}
                      onChange={e => setNewModuleTitle(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Estimated Hours</label>
                    <input
                      type="number"
                      placeholder="15"
                      value={newModuleHours}
                      onChange={e => setNewModuleHours(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-gray-500 mb-1">Module Description</label>
                  <textarea
                    placeholder="Summary of learning targets and practical competencies..."
                    value={newModuleDesc}
                    onChange={e => setNewModuleDesc(e.target.value)}
                    className={inputClasses}
                    rows={2}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Topics (comma separated)</label>
                    <input
                      type="text"
                      placeholder="Flexbox, CSS Grid, Media Queries"
                      value={newModuleTopics}
                      onChange={e => setNewModuleTopics(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-gray-500 mb-1">Milestone Deliverable</label>
                    <input
                      type="text"
                      placeholder="e.g., Multi-Device Portfolio Landing Page"
                      value={newModuleDeliverable}
                      onChange={e => setNewModuleDeliverable(e.target.value)}
                      className={inputClasses}
                    />
                  </div>
                </div>

                <div className="flex justify-end space-x-2 pt-2">
                  {editingModule && (
                    <button
                      type="button"
                      onClick={() => {
                        setEditingModule(null);
                        setNewModuleTitle('');
                        setNewModuleDesc('');
                        setNewModuleTopics('');
                        setNewModuleDeliverable('');
                      }}
                      className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                    >
                      Cancel Edit
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={handleSaveModule}
                    disabled={!newModuleTitle.trim()}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400"
                  >
                    {editingModule ? 'Update Module' : 'Add Module'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-gray-50 dark:bg-gray-700/50 border-t dark:border-gray-700 flex justify-between items-center">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 dark:bg-gray-600 dark:text-gray-200"
          >
            Cancel
          </button>
          <div className="flex items-center space-x-3">
            {activeTab === 'details' ? (
              <button
                type="button"
                onClick={() => setActiveTab('syllabus')}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
              >
                Next: Syllabus ({modules.length}) →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setActiveTab('details')}
                className="px-5 py-2 text-xs font-bold rounded-lg bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
              >
                ← Back to Details
              </button>
            )}
            <button
              type="button"
              onClick={handleSubmit}
              className="px-6 py-2 text-xs font-bold bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
            >
              {course ? 'Save All Changes' : 'Publish Course & Syllabus'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseEditorModal;
