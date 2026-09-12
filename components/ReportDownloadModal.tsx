import React, { useState } from 'react';
import {
  FileText,
  FileSpreadsheet,
  Download,
  X,
  CheckCircle2,
  TrendingUp,
  Award,
  Layers,
  Sparkles,
  Printer,
  Calendar,
  Shield,
  Loader2,
} from 'lucide-react';
import {
  EnrollmentMonthData,
  CourseDemandData,
  CompetencyData,
  TrackMasteryData,
  ProficiencyTierData,
  generateEnrollmentPdfReport,
  generateEnrollmentCsvReport,
  generateSkillMasteryPdfReport,
  generateSkillMasteryCsvReport,
  generateCombinedPdfReport,
  generateCombinedCsvReport,
  ReportConfig,
} from '../utils/chartReportGenerator';
import { NGO, Enrollment, WorkshopEquipmentItem, PlacementRecord } from '../types';

interface ReportDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
  ngo?: NGO;
  enrollments: Enrollment[];
  equipment?: WorkshopEquipmentItem[];
  placementRecords?: PlacementRecord[];
  timelineData: EnrollmentMonthData[];
  courseDemandData: CourseDemandData[];
  competencyData: CompetencyData[];
  trackMasteryData: TrackMasteryData[];
  proficiencyTierData: ProficiencyTierData[];
  currentTimeRange?: string;
}

export const ReportDownloadModal: React.FC<ReportDownloadModalProps> = ({
  isOpen,
  onClose,
  ngo,
  enrollments,
  equipment = [],
  placementRecords = [],
  timelineData,
  courseDemandData,
  competencyData,
  trackMasteryData,
  proficiencyTierData,
  currentTimeRange = '90d',
}) => {
  const [activeReportTab, setActiveReportTab] = useState<'all' | 'enrollment' | 'skills'>('all');
  const [auditorNote, setAuditorNote] = useState('');
  const [downloadingStatus, setDownloadingStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const reportConfig: ReportConfig = {
    ngo,
    enrollments,
    equipment,
    placementRecords,
    timeRange: currentTimeRange,
    notes: auditorNote.trim() || undefined,
  };

  const handleDownload = async (
    type: 'enrollment-pdf' | 'enrollment-csv' | 'skills-pdf' | 'skills-csv' | 'combined-pdf' | 'combined-csv'
  ) => {
    try {
      setDownloadingStatus(`Generating ${type.toUpperCase()}...`);
      // Brief yield so the UI loader renders
      await new Promise((r) => setTimeout(r, 150));

      if (type === 'enrollment-pdf') {
        generateEnrollmentPdfReport(timelineData, courseDemandData, reportConfig);
      } else if (type === 'enrollment-csv') {
        generateEnrollmentCsvReport(timelineData, courseDemandData, reportConfig);
      } else if (type === 'skills-pdf') {
        generateSkillMasteryPdfReport(competencyData, trackMasteryData, proficiencyTierData, reportConfig);
      } else if (type === 'skills-csv') {
        generateSkillMasteryCsvReport(competencyData, trackMasteryData, proficiencyTierData, reportConfig);
      } else if (type === 'combined-pdf') {
        generateCombinedPdfReport(
          timelineData,
          courseDemandData,
          competencyData,
          trackMasteryData,
          proficiencyTierData,
          reportConfig
        );
      } else if (type === 'combined-csv') {
        generateCombinedCsvReport(
          timelineData,
          courseDemandData,
          competencyData,
          trackMasteryData,
          proficiencyTierData,
          reportConfig
        );
      }

      setDownloadingStatus('Downloaded successfully!');
      setTimeout(() => {
        setDownloadingStatus(null);
      }, 1400);
    } catch (err) {
      console.error('Download error:', err);
      setDownloadingStatus('Error generating report');
      setTimeout(() => setDownloadingStatus(null), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl border border-gray-100 dark:border-gray-700 max-w-2xl w-full max-h-[92vh] overflow-y-auto flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-start">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Download className="w-5 h-5" />
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-white">
                Download Analytics & Chart Reports
              </h3>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Export high-fidelity PDF documents with embedded chart visualizations or raw CSV spreadsheets for offline audits.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6 flex-1">
          {/* Status Toast Banner */}
          {downloadingStatus && (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 flex items-center space-x-2 text-xs font-bold text-blue-700 dark:text-blue-300 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-blue-600" />
              <span>{downloadingStatus}</span>
            </div>
          )}

          {/* Report Target Selection Tabs */}
          <div className="flex rounded-2xl bg-gray-100 dark:bg-gray-700/60 p-1 text-xs font-bold">
            <button
              onClick={() => setActiveReportTab('all')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeReportTab === 'all'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>All Reports</span>
            </button>
            <button
              onClick={() => setActiveReportTab('enrollment')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeReportTab === 'enrollment'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Enrollment Trends</span>
            </button>
            <button
              onClick={() => setActiveReportTab('skills')}
              className={`flex-1 py-2 rounded-xl transition-all flex items-center justify-center space-x-1.5 ${
                activeReportTab === 'skills'
                  ? 'bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 shadow-xs'
                  : 'text-gray-600 dark:text-gray-400 hover:text-gray-900'
              }`}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Skill Mastery</span>
            </button>
          </div>

          {/* Report Options Cards */}
          <div className="space-y-4">
            {/* Card 1: Enrollment Trends Report */}
            {(activeReportTab === 'all' || activeReportTab === 'enrollment') && (
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 transition-all shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400">
                        <TrendingUp className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Student Enrollment & Retention Report
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        Intake Analytics
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Includes 6-month monthly intake velocity, applicant-to-admitted conversions, retention rates, and course capacity utilization.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handleDownload('enrollment-pdf')}
                      className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                      title="Download formatted Enrollment PDF with vector charts"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF Report</span>
                    </button>
                    <button
                      onClick={() => handleDownload('enrollment-csv')}
                      className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center space-x-1.5 transition-all"
                      title="Download raw Enrollment CSV spreadsheet"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>CSV Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Card 2: Skill Mastery Report */}
            {(activeReportTab === 'all' || activeReportTab === 'skills') && (
              <div className="p-4 rounded-2xl bg-white dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 hover:border-emerald-300 dark:hover:border-emerald-700 transition-all shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400">
                        <Award className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Vocational Skill Mastery & Competency Matrix
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        Practical Rubric
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Includes 6-dimension competency radar benchmarks, curriculum track mastery percentages, and graduation honors distribution.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handleDownload('skills-pdf')}
                      className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white flex items-center justify-center space-x-1.5 transition-all shadow-xs"
                      title="Download formatted Skill Mastery PDF with competency charts"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>PDF Report</span>
                    </button>
                    <button
                      onClick={() => handleDownload('skills-csv')}
                      className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-xl bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center space-x-1.5 transition-all"
                      title="Download raw Skill Mastery CSV spreadsheet"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span>CSV Data</span>
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Card 3: Combined Executive Institutional Package */}
            {activeReportTab === 'all' && (
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:from-indigo-950/30 dark:to-purple-950/30 border border-indigo-200 dark:border-indigo-800 transition-all shadow-xs">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="p-1.5 rounded-lg bg-indigo-600 text-white">
                        <Sparkles className="w-4 h-4" />
                      </span>
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white">
                        Complete Executive Institutional Report Package
                      </h4>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 dark:bg-indigo-900/80 text-indigo-700 dark:text-indigo-200">
                        Multi-Page PDF
                      </span>
                    </div>
                    <p className="text-xs text-gray-600 dark:text-gray-300">
                      Consolidates Enrollment Trajectories, Skill Mastery Matrices, and NGO Operational readiness in a multi-page PDF suitable for board meetings and grant proposals.
                    </p>
                  </div>

                  <div className="flex items-center space-x-2 w-full sm:w-auto shrink-0">
                    <button
                      onClick={() => handleDownload('combined-pdf')}
                      className="flex-1 sm:flex-none px-4 py-2 text-xs font-bold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center space-x-1.5 transition-all shadow-md"
                      title="Download Full Multi-Page PDF"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Executive PDF</span>
                    </button>
                    <button
                      onClick={() => handleDownload('combined-csv')}
                      className="flex-1 sm:flex-none px-3.5 py-2 text-xs font-bold rounded-xl bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-indigo-700 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 flex items-center justify-center space-x-1.5 transition-all"
                      title="Download Comprehensive Raw CSV"
                    >
                      <FileSpreadsheet className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                      <span>Master CSV</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Optional Auditor Note & Customization */}
          <div className="space-y-2 pt-2 border-t border-gray-100 dark:border-gray-700">
            <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-1.5">
              <Shield className="w-3.5 h-3.5 text-blue-500" />
              <span>Optional Auditor / Grant Notes (Stamped into PDF):</span>
            </label>
            <input
              type="text"
              value={auditorNote}
              onChange={(e) => setAuditorNote(e.target.value)}
              placeholder="e.g. Q3 Regional Grant Audit • Verified against physical workshop attendance records"
              className="w-full text-xs px-3.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 text-gray-800 dark:text-gray-200 focus:ring-2 focus:ring-blue-500 outline-hidden transition-all"
            />
          </div>

          {/* Offline Analysis Specs */}
          <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-700 text-[11px] text-gray-500 dark:text-gray-400 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>Standards-compliant A4 vector PDF format & UTF-8 Excel-ready CSVs</span>
            </div>
            <span className="font-mono text-gray-400">v2.4 Engine</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 px-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportDownloadModal;
