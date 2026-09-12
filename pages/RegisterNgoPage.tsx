import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import RegisterNgoModal from '../components/RegisterNgoModal';
import { ArrowLeft, Sparkles, Building2, CheckCircle2, ShieldCheck, Layers, Palette } from 'lucide-react';

export const RegisterNgoPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-300">
      {/* Breadcrumb / Back Link */}
      <div className="flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Home Directory</span>
        </Link>
        <span className="text-xs text-gray-400">SkillSpot 2.0 Partner Network</span>
      </div>

      {/* Intro Hero Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-10 text-white shadow-xl relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-semibold text-emerald-300 border border-white/10">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Multi-Tenant Partner Onboarding</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-black tracking-tight">
            Register Your Training Center & Tenant Portal
          </h1>
          <p className="text-xs sm:text-sm text-indigo-100/90 leading-relaxed">
            Set up your organization's custom subdomain, branding palette, vocational tracks, and instructor admin studio in a guided 6-step wizard.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4 text-xs text-indigo-200">
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Custom Tenant Slug & Branding</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Direct Cohort Application Management</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Instant Verified Credentials</span>
            </span>
          </div>
        </div>
      </div>

      {/* Full Page Wizard View */}
      <RegisterNgoModal
        isOpen={true}
        onClose={() => navigate('/')}
        isFullPage={true}
        onRegisteredSuccess={(adminEmail, ngoId) => {
          // Handled within modal actions
        }}
      />
    </div>
  );
};

export default RegisterNgoPage;
