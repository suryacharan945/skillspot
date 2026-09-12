import React from 'react';

interface GlassSkeletonBoxProps {
  className?: string;
  rounded?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | 'full';
  style?: React.CSSProperties;
}

export const GlassSkeletonBox: React.FC<GlassSkeletonBoxProps> = ({
  className = '',
  rounded = 'xl',
  style,
}) => {
  const roundedClasses = {
    sm: 'rounded-sm',
    md: 'rounded-md',
    lg: 'rounded-lg',
    xl: 'rounded-xl',
    '2xl': 'rounded-2xl',
    '3xl': 'rounded-3xl',
    full: 'rounded-full',
  }[rounded];

  return (
    <div
      className={`glass-shimmer ${roundedClasses} ${className}`}
      style={style}
    />
  );
};

// --- 1. NGO CARD SKELETON (Used in Directory Grid on HomePage & Search) ---
export const NgoCardGlassSkeleton: React.FC = () => {
  return (
    <div className="glass-skeleton-card rounded-2xl overflow-hidden flex flex-col transition-all duration-300">
      {/* Shimmer Cover Banner */}
      <div className="h-28 w-full glass-shimmer relative p-4 flex justify-between items-start border-b border-white/20 dark:border-white/5">
        <div className="w-24 h-5 glass-skeleton-pill" />
        <div className="w-16 h-5 glass-skeleton-pill" />
      </div>

      {/* Main Content Area */}
      <div className="p-5 flex-grow flex flex-col pt-0">
        {/* Avatar + Title Row */}
        <div className="flex items-start space-x-3 -mt-8 mb-4">
          <div className="w-16 h-16 rounded-2xl glass-shimmer border-4 border-white dark:border-gray-800 shadow-md shrink-0 ring-2 ring-blue-500/20" />
          <div className="pt-8 flex-1 space-y-2">
            <div className="h-4 w-4/5 glass-shimmer rounded-lg" />
            <div className="h-3 w-1/2 glass-shimmer rounded-md" />
          </div>
        </div>

        {/* Skill Category Badges */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          <div className="h-5 w-20 glass-skeleton-pill" />
          <div className="h-5 w-28 glass-skeleton-pill" />
          <div className="h-5 w-16 glass-skeleton-pill" />
        </div>

        {/* Description Lines */}
        <div className="space-y-2 mb-5 flex-grow">
          <div className="h-3.5 w-full glass-shimmer rounded-md" />
          <div className="h-3.5 w-5/6 glass-shimmer rounded-md" />
          <div className="h-3.5 w-3/4 glass-shimmer rounded-md" />
        </div>

        {/* Programs Teaser Chips */}
        <div className="pt-3 border-t border-gray-200/50 dark:border-gray-700/50 mb-4 space-y-2">
          <div className="h-3 w-28 glass-shimmer rounded" />
          <div className="flex gap-2">
            <div className="h-6 w-32 glass-skeleton-pill" />
            <div className="h-6 w-24 glass-skeleton-pill" />
          </div>
        </div>
      </div>

      {/* Footer / CTA Bar */}
      <div className="p-3.5 bg-gray-50/50 dark:bg-gray-800/50 border-t border-white/40 dark:border-gray-700/50 flex items-center justify-between">
        <div className="h-4 w-24 glass-shimmer rounded-md" />
        <div className="h-7 w-28 glass-shimmer rounded-xl" />
      </div>
    </div>
  );
};

// --- 2. NGO DETAIL PAGE SKELETON (Replaces default spinner on /ngo/:id) ---
export const NgoDetailGlassSkeleton: React.FC = () => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Breadcrumb skeleton */}
      <div className="flex items-center space-x-2">
        <div className="h-4 w-32 glass-shimmer rounded-md" />
        <span className="text-gray-300 dark:text-gray-700">/</span>
        <div className="h-4 w-44 glass-shimmer rounded-md" />
      </div>

      {/* Hero Profile Glass Card */}
      <div className="glass-skeleton-card rounded-3xl overflow-hidden border border-white/60 dark:border-white/10 shadow-xl">
        {/* Cover Banner with shimmering gradients */}
        <div className="h-44 sm:h-60 w-full glass-shimmer relative p-6 flex flex-col justify-between">
          <div className="flex justify-between items-start">
            <div className="w-36 h-6 glass-skeleton-pill" />
            <div className="flex space-x-2">
              <div className="w-24 h-6 glass-skeleton-pill" />
              <div className="w-32 h-6 glass-skeleton-pill" />
            </div>
          </div>
          <div className="w-48 h-4 glass-shimmer rounded" />
        </div>

        {/* Profile Info Row */}
        <div className="p-6 sm:p-8 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between -mt-14 mb-6 gap-4">
            <div className="flex items-end space-x-4">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl glass-shimmer border-4 border-white dark:border-gray-800 shadow-2xl shrink-0 ring-4 ring-blue-500/20" />
              <div className="pb-1 space-y-2.5">
                <div className="h-7 w-64 sm:w-80 glass-shimmer rounded-xl" />
                <div className="h-4 w-48 glass-shimmer rounded-md" />
                <div className="flex items-center space-x-3">
                  <div className="h-4 w-28 glass-shimmer rounded-md" />
                  <div className="h-4 w-24 glass-shimmer rounded-md" />
                </div>
              </div>
            </div>

            <div className="flex space-x-2">
              <div className="h-9 w-40 glass-shimmer rounded-xl" />
              <div className="h-9 w-28 glass-shimmer rounded-xl" />
            </div>
          </div>

          {/* Primary Skill Tracks Shimmer Chips */}
          <div className="p-4 rounded-2xl bg-white/40 dark:bg-gray-800/40 border border-white/60 dark:border-gray-700/60 mb-6 space-y-2.5">
            <div className="h-3 w-40 glass-shimmer rounded" />
            <div className="flex flex-wrap gap-2">
              <div className="h-7 w-44 glass-skeleton-pill" />
              <div className="h-7 w-36 glass-skeleton-pill" />
              <div className="h-7 w-48 glass-skeleton-pill" />
              <div className="h-7 w-32 glass-skeleton-pill" />
            </div>
          </div>

          {/* Mission & Overview */}
          <div className="space-y-3 max-w-3xl">
            <div className="h-4 w-32 glass-shimmer rounded" />
            <div className="h-4 w-full glass-shimmer rounded-md" />
            <div className="h-4 w-11/12 glass-shimmer rounded-md" />
            <div className="h-4 w-4/5 glass-shimmer rounded-md" />
          </div>
        </div>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-gray-200/60 dark:border-gray-700/60 gap-4 pb-1">
        <div className="h-9 w-36 glass-shimmer rounded-xl" />
        <div className="h-9 w-32 glass-shimmer rounded-xl" />
        <div className="h-9 w-36 glass-shimmer rounded-xl" />
      </div>

      {/* Course Cards Grid Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glass-skeleton-card rounded-2xl p-6 border border-white/50 dark:border-gray-700/50 space-y-4"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-1.5 flex-1">
                <div className="h-5 w-3/4 glass-shimmer rounded-lg" />
                <div className="h-3.5 w-1/3 glass-shimmer rounded-md" />
              </div>
              <div className="h-6 w-20 glass-skeleton-pill" />
            </div>

            <div className="space-y-2">
              <div className="h-3.5 w-full glass-shimmer rounded-md" />
              <div className="h-3.5 w-4/5 glass-shimmer rounded-md" />
            </div>

            <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-200/40 dark:border-gray-700/40">
              <div className="h-8 glass-shimmer rounded-lg" />
              <div className="h-8 glass-shimmer rounded-lg" />
              <div className="h-8 glass-shimmer rounded-lg" />
            </div>

            <div className="flex justify-between items-center pt-1">
              <div className="h-5 w-28 glass-shimmer rounded-md" />
              <div className="h-9 w-32 glass-shimmer rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- 3. DASHBOARD SKELETON (Replaces default spinner on Admin & Student Dashboards) ---
interface DashboardGlassSkeletonProps {
  role?: 'admin' | 'student';
}

export const DashboardGlassSkeleton: React.FC<DashboardGlassSkeletonProps> = ({
  role = 'admin',
}) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-300 max-w-7xl mx-auto">
      {/* Top Banner Header Skeleton */}
      <div className="glass-skeleton-card rounded-3xl p-6 sm:p-8 border border-white/60 dark:border-white/10 shadow-lg flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-2.5">
          <div className="flex items-center space-x-2">
            <div className="h-5 w-24 glass-skeleton-pill" />
            <div className="h-5 w-32 glass-skeleton-pill" />
          </div>
          <div className="h-8 w-64 sm:w-96 glass-shimmer rounded-2xl" />
          <div className="h-4 w-48 sm:w-72 glass-shimmer rounded-lg" />
        </div>

        <div className="flex items-center space-x-3">
          <div className="h-10 w-32 glass-shimmer rounded-2xl" />
          <div className="h-10 w-36 glass-shimmer rounded-2xl" />
        </div>
      </div>

      {/* 4 Analytics Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="glass-skeleton-card rounded-2xl p-5 border border-white/60 dark:border-white/10 shadow-xs flex items-center space-x-4"
          >
            <div className="w-13 h-13 rounded-2xl glass-shimmer shrink-0" />
            <div className="space-y-2 flex-1">
              <div className="h-6 w-16 glass-shimmer rounded-lg" />
              <div className="h-3.5 w-24 glass-shimmer rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Navigation Tabs Bar */}
      <div className="flex gap-3 border-b border-gray-200/60 dark:border-gray-700/60 pb-2 overflow-x-auto">
        <div className="h-9 w-32 glass-shimmer rounded-xl shrink-0" />
        <div className="h-9 w-36 glass-shimmer rounded-xl shrink-0" />
        <div className="h-9 w-28 glass-shimmer rounded-xl shrink-0" />
        <div className="h-9 w-40 glass-shimmer rounded-xl shrink-0" />
      </div>

      {/* Main Table / Roster Grid Skeleton */}
      <div className="glass-skeleton-card rounded-3xl p-6 border border-white/60 dark:border-white/10 shadow-md space-y-4">
        <div className="flex justify-between items-center pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="space-y-1">
            <div className="h-5 w-48 glass-shimmer rounded-lg" />
            <div className="h-3 w-64 glass-shimmer rounded" />
          </div>
          <div className="h-8 w-36 glass-shimmer rounded-xl" />
        </div>

        {/* Shimmer Rows */}
        <div className="space-y-3 pt-2">
          {[1, 2, 3, 4, 5].map((row) => (
            <div
              key={row}
              className="p-4 rounded-2xl bg-white/40 dark:bg-gray-800/40 border border-white/40 dark:border-gray-700/40 flex items-center justify-between gap-4"
            >
              <div className="flex items-center space-x-3.5">
                <div className="w-10 h-10 rounded-xl glass-shimmer shrink-0" />
                <div className="space-y-1.5">
                  <div className="h-4 w-40 sm:w-56 glass-shimmer rounded-md" />
                  <div className="h-3 w-28 sm:w-40 glass-shimmer rounded" />
                </div>
              </div>

              <div className="flex items-center space-x-4">
                <div className="h-6 w-20 glass-skeleton-pill hidden sm:block" />
                <div className="h-4 w-24 glass-shimmer rounded hidden md:block" />
                <div className="h-8 w-20 glass-shimmer rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// --- 4. IMPACT STATS SKELETON (Used on HomePage hero stats) ---
export const ImpactStatsGlassSkeleton: React.FC = () => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {[1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="glass-skeleton-card rounded-2xl p-5 border border-white/60 dark:border-white/10 shadow-sm flex items-center space-x-4"
        >
          <div className="w-12 h-12 rounded-xl glass-shimmer shrink-0" />
          <div className="space-y-2 flex-1">
            <div className="h-7 w-16 glass-shimmer rounded-lg" />
            <div className="h-3.5 w-24 glass-shimmer rounded" />
          </div>
        </div>
      ))}
    </div>
  );
};

// --- 5. JOB CARD GLASS SKELETON ---
export const JobCardGlassSkeleton: React.FC = () => {
  return (
    <div className="glass-skeleton-card rounded-2xl p-6 border border-white/60 dark:border-white/10 shadow-sm flex flex-col justify-between space-y-4">
      <div className="space-y-3">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-2 flex-1">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-24 glass-skeleton-pill" />
              <div className="h-5 w-20 glass-skeleton-pill" />
            </div>
            <div className="h-6 w-3/4 glass-shimmer rounded-lg" />
            <div className="h-4 w-1/3 glass-shimmer rounded-md" />
          </div>
          <div className="h-6 w-24 glass-skeleton-pill" />
        </div>

        <div className="space-y-2 pt-2">
          <div className="h-3.5 w-full glass-shimmer rounded" />
          <div className="h-3.5 w-5/6 glass-shimmer rounded" />
        </div>

        <div className="flex flex-wrap gap-1.5 pt-2">
          <div className="h-5 w-16 glass-skeleton-pill" />
          <div className="h-5 w-20 glass-skeleton-pill" />
          <div className="h-5 w-24 glass-skeleton-pill" />
        </div>
      </div>

      <div className="pt-4 border-t border-gray-200/50 dark:border-gray-700/50 flex justify-between items-center">
        <div className="h-5 w-28 glass-shimmer rounded" />
        <div className="h-9 w-28 glass-shimmer rounded-xl" />
      </div>
    </div>
  );
};

// --- 6. AI EVALUATION SKELETON (Used on CareerCoachPage while analyzing) ---
export const AiEvaluationGlassSkeleton: React.FC = () => {
  return (
    <div className="glass-skeleton-card rounded-3xl p-6 border border-indigo-200/60 dark:border-indigo-900/60 shadow-lg space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-200/50 dark:border-gray-700/50">
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 rounded-lg glass-shimmer" />
            <div className="h-5 w-56 glass-shimmer rounded-lg" />
          </div>
          <div className="h-3.5 w-72 glass-shimmer rounded" />
        </div>

        <div className="flex items-center space-x-4">
          <div className="w-20 h-10 rounded-2xl glass-shimmer" />
          <div className="w-24 h-10 rounded-2xl glass-shimmer" />
        </div>
      </div>

      {/* Criteria Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="p-4 rounded-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/50 space-y-2"
          >
            <div className="h-4 w-28 glass-shimmer rounded" />
            <div className="h-3.5 w-full glass-shimmer rounded" />
            <div className="h-3.5 w-4/5 glass-shimmer rounded" />
          </div>
        ))}
      </div>

      {/* Suggested Improvements & Action Steps */}
      <div className="p-4 rounded-2xl bg-white/40 dark:bg-gray-800/40 border border-white/50 dark:border-gray-700/50 space-y-2.5">
        <div className="h-4 w-40 glass-shimmer rounded" />
        <div className="h-3.5 w-11/12 glass-shimmer rounded" />
        <div className="h-3.5 w-5/6 glass-shimmer rounded" />
      </div>
    </div>
  );
};
