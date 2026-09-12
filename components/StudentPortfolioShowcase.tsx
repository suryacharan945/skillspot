import React, { useState } from 'react';
import { StudentPortfolioItem } from '../types';
import { useData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import {
  FolderGit2,
  PlusCircle,
  ExternalLink,
  Trash2,
  Image as ImageIcon,
  Tag,
  Wrench,
  Calendar,
  X,
  Sparkles,
} from 'lucide-react';

const PRESET_IMAGES = [
  {
    label: 'Solar Panel Installation',
    url: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Precision Welding & Metal Fabrication',
    url: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Fine Woodworking & Joinery',
    url: 'https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Web & Mobile Application Software',
    url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=600&auto=format&fit=crop&q=80',
  },
  {
    label: 'Apparel Design & Industrial Tailoring',
    url: 'https://images.unsplash.com/photo-1558769132-cb1aea458c5e?w=600&auto=format&fit=crop&q=80',
  },
];

export const StudentPortfolioShowcase: React.FC = () => {
  const { portfolioItems, setPortfolioItems } = useData();
  const { user } = useAuth();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [activeImagePreview, setActiveImagePreview] = useState<string | null>(null);

  // Form State
  const [projectTitle, setProjectTitle] = useState('');
  const [projectCategory, setProjectCategory] = useState('Clean Energy');
  const [projectDescription, setProjectDescription] = useState('');
  const [projectImageUrl, setProjectImageUrl] = useState(PRESET_IMAGES[0].url);
  const [projectTools, setProjectTools] = useState('Multimeter, MC4 Crimper, Torque Wrench');
  const [projectExternalLink, setProjectExternalLink] = useState('');

  const studentItems = portfolioItems.filter(
    (item) => item.studentId === user?.id || !item.studentId
  );

  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!projectTitle || !user) return;

    const newItem: StudentPortfolioItem = {
      id: `port-${Date.now()}`,
      studentId: user.id,
      title: projectTitle,
      category: projectCategory,
      description: projectDescription,
      imageUrl: projectImageUrl,
      toolsUsed: projectTools
        ? projectTools.split(',').map((t) => t.trim()).filter(Boolean)
        : [],
      externalLink: projectExternalLink || undefined,
      createdAt: new Date().toISOString(),
    };

    setPortfolioItems((prev) => [newItem, ...prev]);
    setIsAddModalOpen(false);

    // Reset form
    setProjectTitle('');
    setProjectDescription('');
    setProjectExternalLink('');
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to remove this project from your showcase?')) {
      setPortfolioItems((prev) => prev.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Student Project Portfolio & Capstone Showcase
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300">
              {studentItems.length} Projects
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Showcase your physical workshop projects, coded prototypes, and tool craft directly to recruiting partners.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add Capstone Project</span>
        </button>
      </div>

      {/* Projects Grid */}
      {studentItems.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-gray-800/50 rounded-2xl border border-dashed border-gray-200 dark:border-gray-700 p-6 space-y-3">
          <FolderGit2 className="w-10 h-10 text-gray-300 mx-auto" />
          <h4 className="text-sm font-bold text-gray-700 dark:text-gray-200">
            No projects added yet
          </h4>
          <p className="text-xs text-gray-400 max-w-sm mx-auto">
            Upload pictures and descriptions of your hands-on assignments to impress employers browsing the job board.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
          >
            Add Your First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studentItems.map((project) => (
            <div
              key={project.id}
              className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-700 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div
                  className="relative h-44 overflow-hidden cursor-pointer bg-gray-100 dark:bg-gray-700"
                  onClick={() => setActiveImagePreview(project.imageUrl)}
                >
                  <img
                    src={project.imageUrl}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
                    {project.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <h4 className="font-bold text-sm text-gray-900 dark:text-white leading-snug">
                    {project.title}
                  </h4>
                  <p className="text-xs text-gray-600 dark:text-gray-300 line-clamp-3 leading-relaxed">
                    {project.description}
                  </p>

                  {/* Tools used */}
                  {project.toolsUsed && project.toolsUsed.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      {project.toolsUsed.map((tool, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-750 text-[10px] font-medium text-gray-600 dark:text-gray-300 flex items-center space-x-1"
                        >
                          <Wrench className="w-2.5 h-2.5 text-blue-500" />
                          <span>{tool}</span>
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 pt-2 border-t border-gray-100 dark:border-gray-700/60 flex items-center justify-between text-xs">
                {project.externalLink ? (
                  <a
                    href={project.externalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center space-x-1"
                  >
                    <span>View Demo / Source</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                ) : (
                  <span className="text-[10px] text-gray-400">Verified Workshop Project</span>
                )}

                <button
                  onClick={() => handleDelete(project.id)}
                  className="p-1 text-gray-400 hover:text-rose-500 rounded-lg hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                  title="Remove Project"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal: Add Capstone Project */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto border border-gray-100 dark:border-gray-700">
            <div className="flex justify-between items-start mb-5 border-b pb-4 dark:border-gray-700">
              <div>
                <span className="text-[11px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
                  Portfolio Artifact
                </span>
                <h3 className="text-xl font-black text-gray-900 dark:text-white mt-1">
                  Add Capstone Project
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProject} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Project Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5kW Grid-Tied Inverter Array Bench"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Vocational Category
                  </label>
                  <select
                    value={projectCategory}
                    onChange={(e) => setProjectCategory(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white font-semibold"
                  >
                    <option value="Clean Energy">Clean Energy</option>
                    <option value="Trades & Construction">Trades & Construction</option>
                    <option value="Technology">Technology</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Culinary Arts">Culinary Arts</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    Tools / Equipment Used
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Mig Welder, Calipers, OSHA Mask"
                    value={projectTools}
                    onChange={(e) => setProjectTools(e.target.value)}
                    className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Select Project Photo Preset or Custom URL
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mb-2">
                  {PRESET_IMAGES.map((preset) => (
                    <button
                      type="button"
                      key={preset.label}
                      onClick={() => setProjectImageUrl(preset.url)}
                      className={`p-1.5 rounded-xl border text-left flex flex-col items-center text-[10px] transition-all ${
                        projectImageUrl === preset.url
                          ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/40 font-bold'
                          : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.label}
                        className="w-full h-12 object-cover rounded-lg mb-1"
                      />
                      <span className="line-clamp-1">{preset.label}</span>
                    </button>
                  ))}
                </div>
                <input
                  type="url"
                  placeholder="Or paste external image URL..."
                  value={projectImageUrl}
                  onChange={(e) => setProjectImageUrl(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Detailed Description *
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Explain the project scope, technical challenges overcome, measurements, and outcome..."
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Live Demo / GitHub / CAD Link (Optional)
                </label>
                <input
                  type="url"
                  placeholder="https://github.com/... or Google Drive link"
                  value={projectExternalLink}
                  onChange={(e) => setProjectExternalLink(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-md"
                >
                  Save to Showcase
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Image Preview Lightbox */}
      {activeImagePreview && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setActiveImagePreview(null)}
        >
          <img
            src={activeImagePreview}
            alt="Project full view"
            className="max-h-[85vh] max-w-full rounded-2xl shadow-2xl object-contain"
          />
        </div>
      )}
    </div>
  );
};

export default StudentPortfolioShowcase;
