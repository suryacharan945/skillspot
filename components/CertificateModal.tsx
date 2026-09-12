import React, { useEffect, useRef, useState } from 'react';
import confetti from 'canvas-confetti';
import { Enrollment, Course, NGO } from '../types';

interface CertificateModalProps {
  enrollment: Enrollment;
  course?: Course;
  ngo?: NGO;
  onClose: () => void;
}

const CertificateModal: React.FC<CertificateModalProps> = ({
  enrollment,
  course,
  ngo,
  onClose
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [isGeneratingPng, setIsGeneratingPng] = useState(false);
  const certRef = useRef<HTMLDivElement>(null);

  // Trigger celebration confetti upon opening
  useEffect(() => {
    try {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
    } catch (e) {
      console.warn('Confetti effect skipped', e);
    }
  }, []);

  const certId = enrollment.certificateId || `CERT-SKILLSPOT-${enrollment.enrollmentId.replace(/\D/g, '') || '2025'}`;
  const studentName = enrollment.studentName;
  const courseName = enrollment.courseName;
  const ngoName = ngo?.name || 'SkillSpot Partner NGO';
  const trainerName = course?.trainer || 'Lead Instructor';
  const issueDate = enrollment.completedDate 
    ? new Date(enrollment.completedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const honors = enrollment.gradeScore || 'Honors Completion';

  // Copy shareable credential link
  const handleCopyLink = () => {
    const url = `${window.location.origin}/#/verify/${certId}`;
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  // High resolution PNG generation via HTML5 Canvas
  const handleDownloadPng = () => {
    setIsGeneratingPng(true);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1920;
      canvas.height = 1200;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Outer border (Dark Navy)
      ctx.strokeStyle = '#1e3a8a';
      ctx.lineWidth = 16;
      ctx.strokeRect(30, 30, canvas.width - 60, canvas.height - 60);

      // Inner ornate border (Gold)
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 4;
      ctx.strokeRect(48, 48, canvas.width - 96, canvas.height - 96);

      // Thin inner frame
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 2;
      ctx.strokeRect(58, 58, canvas.width - 116, canvas.height - 116);

      // Top Header
      ctx.textAlign = 'center';
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 32px Georgia, serif';
      ctx.fillText('SKILLSPOT 2.0 • CENTRALIZED SKILL ECOSYSTEM', canvas.width / 2, 140);

      ctx.fillStyle = '#d97706';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('OFFICIAL ACCREDITATION & VOCATIONAL EMPOWERMENT', canvas.width / 2, 175);

      // Certificate Title
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 72px Georgia, serif';
      ctx.fillText('Certificate of Completion', canvas.width / 2, 270);

      // Subtitle
      ctx.fillStyle = '#64748b';
      ctx.font = 'italic 26px Georgia, serif';
      ctx.fillText('This is proudly awarded to', canvas.width / 2, 350);

      // Student Name
      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'bold 56px Georgia, serif';
      ctx.fillText(studentName, canvas.width / 2, 440);

      // Underline under name
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(canvas.width / 2 - 280, 465);
      ctx.lineTo(canvas.width / 2 + 280, 465);
      ctx.stroke();

      // Body text
      ctx.fillStyle = '#334155';
      ctx.font = '24px Georgia, serif';
      ctx.fillText('for successfully demonstrating competency, dedicated coursework, and practical mastery in', canvas.width / 2, 530);

      // Course Name
      ctx.fillStyle = '#0f172a';
      ctx.font = 'bold 44px Georgia, serif';
      ctx.fillText(courseName, canvas.width / 2, 600);

      // Organization & Honors
      ctx.fillStyle = '#475569';
      ctx.font = '22px sans-serif';
      ctx.fillText(`Conducted under the auspices of ${ngoName}`, canvas.width / 2, 660);
      
      ctx.fillStyle = '#059669';
      ctx.font = 'bold 22px sans-serif';
      ctx.fillText(`Performance Standing: ${honors}`, canvas.width / 2, 705);

      // Gold Seal in Center-Bottom
      const sealX = canvas.width / 2;
      const sealY = 850;
      const radius = 70;
      
      ctx.beginPath();
      ctx.arc(sealX, sealY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';
      ctx.fill();
      ctx.lineWidth = 6;
      ctx.strokeStyle = '#d97706';
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(sealX, sealY, radius - 10, 0, Math.PI * 2);
      ctx.strokeStyle = '#92400e';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#78350f';
      ctx.font = 'bold 16px sans-serif';
      ctx.fillText('VERIFIED', sealX, sealY - 10);
      ctx.font = 'bold 20px sans-serif';
      ctx.fillText('★ 2025 ★', sealX, sealY + 12);
      ctx.font = 'bold 13px sans-serif';
      ctx.fillText('SKILLSPOT', sealX, sealY + 28);

      // Signatures
      // Left Signature: NGO Director
      const sig1X = 350;
      const sigY = 960;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sig1X - 160, sigY);
      ctx.lineTo(sig1X + 160, sigY);
      ctx.stroke();

      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'italic 28px "Brush Script MT", cursive, sans-serif';
      ctx.fillText('Dr. Eleanor Vance', sig1X, sigY - 15);
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Executive Director', sig1X, sigY + 28);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText(ngoName, sig1X, sigY + 52);

      // Right Signature: Instructor
      const sig2X = canvas.width - 350;
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(sig2X - 160, sigY);
      ctx.lineTo(sig2X + 160, sigY);
      ctx.stroke();

      ctx.fillStyle = '#1e3a8a';
      ctx.font = 'italic 28px "Brush Script MT", cursive, sans-serif';
      ctx.fillText(trainerName, sig2X, sigY - 15);
      ctx.font = 'bold 18px sans-serif';
      ctx.fillStyle = '#0f172a';
      ctx.fillText('Lead Course Instructor', sig2X, sigY + 28);
      ctx.font = '16px sans-serif';
      ctx.fillStyle = '#64748b';
      ctx.fillText('SkillSpot Certified Faculty', sig2X, sigY + 52);

      // Footer Meta
      ctx.fillStyle = '#64748b';
      ctx.font = '16px monospace';
      ctx.fillText(`Certificate ID: ${certId}  •  Issue Date: ${issueDate}`, canvas.width / 2, 1090);
      ctx.font = '14px sans-serif';
      ctx.fillText('Digitally signed and verifiable at skillspot.org/verify', canvas.width / 2, 1120);

      // Trigger download
      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `SkillSpot_Certificate_${certId}.png`;
      link.href = imageUri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Failed to generate PNG:', err);
    } finally {
      setIsGeneratingPng(false);
    }
  };

  // Print / Save to PDF
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden my-auto border border-gray-200 dark:border-gray-700">
        
        {/* Actions Bar (Top) */}
        <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b dark:border-gray-700 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-sm font-bold text-gray-900 dark:text-white">
              Official Credential Awarded
            </span>
            <span className="text-xs text-gray-500 font-mono">({certId})</span>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 flex items-center space-x-1"
              title="Copy public verification link"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              <span>{copiedLink ? 'Copied Link!' : 'Share Link'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white flex items-center space-x-1 shadow-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
              </svg>
              <span>Print / PDF</span>
            </button>

            <button
              onClick={handleDownloadPng}
              disabled={isGeneratingPng}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center space-x-1 shadow-sm disabled:bg-emerald-400"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>{isGeneratingPng ? 'Generating...' : 'Download PNG'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-white"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Printable Certificate Frame */}
        <div className="p-6 md:p-8 bg-gray-100 dark:bg-gray-950 flex justify-center">
          <div
            ref={certRef}
            id="printable-certificate"
            className="w-full max-w-3xl bg-white text-gray-900 p-8 sm:p-12 rounded-xl shadow-xl relative border-[12px] border-blue-900 select-none overflow-hidden"
            style={{
              backgroundImage: 'radial-gradient(#f8fafc 15%, transparent 16%)',
              backgroundSize: '20px 20px'
            }}
          >
            {/* Inner Gold Frame */}
            <div className="border-2 border-amber-600/80 p-6 sm:p-10 relative">
              
              {/* Corner Ornaments */}
              <div className="absolute -top-3 -left-3 w-6 h-6 border-t-4 border-l-4 border-amber-600"></div>
              <div className="absolute -top-3 -right-3 w-6 h-6 border-t-4 border-r-4 border-amber-600"></div>
              <div className="absolute -bottom-3 -left-3 w-6 h-6 border-b-4 border-l-4 border-amber-600"></div>
              <div className="absolute -bottom-3 -right-3 w-6 h-6 border-b-4 border-r-4 border-amber-600"></div>

              {/* Header */}
              <div className="text-center space-y-1">
                <div className="flex justify-center items-center space-x-2 text-blue-900">
                  <svg className="w-8 h-8 text-blue-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <span className="font-serif font-black tracking-widest text-lg text-blue-900">SKILLSPOT 2.0</span>
                </div>
                <p className="text-[10px] sm:text-xs uppercase tracking-widest font-bold text-amber-700">
                  Centralized Skill Ecosystem & Vocational Accreditation
                </p>
                <h1 className="text-2xl sm:text-4xl font-serif font-extrabold text-gray-900 pt-3">
                  Certificate of Completion
                </h1>
                <p className="text-xs sm:text-sm font-serif italic text-gray-500 pt-1">
                  This is proudly awarded to
                </p>
              </div>

              {/* Student Name */}
              <div className="text-center my-6">
                <h2 className="text-2xl sm:text-4xl font-serif font-bold text-blue-950 tracking-wide border-b-2 border-amber-500 inline-block px-8 pb-1">
                  {studentName}
                </h2>
              </div>

              {/* Description & Course */}
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <p className="text-xs sm:text-sm text-gray-600 font-serif leading-relaxed">
                  for successfully fulfilling all rigorous syllabus milestones, coursework examinations, and practical skill proficiencies in
                </p>
                <h3 className="text-lg sm:text-2xl font-bold font-serif text-gray-900">
                  {courseName}
                </h3>
                <p className="text-xs text-gray-500">
                  Offered and accredited by <span className="font-semibold text-gray-800">{ngoName}</span>
                </p>
                <div className="inline-block px-3 py-1 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-semibold rounded-full mt-1">
                  Standing: {honors}
                </div>
              </div>

              {/* Gold Seal & Signatures */}
              <div className="mt-10 pt-6 border-t border-gray-200 grid grid-cols-3 items-end text-center">
                {/* Director Signature */}
                <div>
                  <p className="font-serif italic text-base sm:text-lg text-blue-900 border-b border-gray-400 pb-1">
                    Dr. Eleanor Vance
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-800 mt-1">Executive Director</p>
                  <p className="text-[9px] text-gray-500">{ngoName}</p>
                </div>

                {/* Verification Seal Badge */}
                <div className="flex justify-center items-center">
                  <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 border-4 border-amber-600 shadow-md flex flex-col items-center justify-center text-amber-950">
                    <span className="text-[8px] font-black tracking-widest uppercase">Verified</span>
                    <span className="text-xs sm:text-sm font-black">★ 2025 ★</span>
                    <span className="text-[7px] font-bold">SKILLSPOT</span>
                  </div>
                </div>

                {/* Instructor Signature */}
                <div>
                  <p className="font-serif italic text-base sm:text-lg text-blue-900 border-b border-gray-400 pb-1">
                    {trainerName}
                  </p>
                  <p className="text-[10px] sm:text-xs font-bold text-gray-800 mt-1">Lead Instructor</p>
                  <p className="text-[9px] text-gray-500">Certified Faculty</p>
                </div>
              </div>

              {/* ID and Date Footer */}
              <div className="mt-8 pt-3 border-t border-gray-100 flex flex-wrap justify-between items-center text-[10px] text-gray-500 font-mono">
                <span>ID: {certId}</span>
                <span>Date: {issueDate}</span>
                <span>verify: skillspot.org/verify</span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom note */}
        <div className="p-3 bg-gray-50 dark:bg-gray-800 text-center text-xs text-gray-500 dark:text-gray-400">
          This digital credential is cryptographically stamped and registered on the SkillSpot Centralized Ecosystem registry.
        </div>
      </div>
    </div>
  );
};

export default CertificateModal;
