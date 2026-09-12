import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  CartesianGrid,
  ComposedChart,
  Line,
} from 'recharts';
import { NGO, Enrollment } from '../types';
import {
  TrendingUp,
  BarChart3,
  PieChart as PieChartIcon,
  Building2,
  Users,
  Award,
  Sparkles,
  Download,
  Search,
  CheckCircle2,
  Clock,
  Flame,
  Zap,
  BookOpen,
  ArrowUpRight,
  Layers,
  Activity,
} from 'lucide-react';

interface SkillTrendsModuleProps {
  ngos: NGO[];
  enrollments: Enrollment[];
}

const CATEGORY_COLORS: Record<string, string> = {
  Technology: '#3b82f6', // blue
  Healthcare: '#ec4899', // pink
  Environmental: '#10b981', // emerald
  Vocational: '#f59e0b', // amber
  Design: '#8b5cf6', // purple
  Education: '#06b6d4', // cyan
  Community: '#6366f1', // indigo
  General: '#64748b', // slate
};

const PALETTE = [
  '#3b82f6',
  '#10b981',
  '#8b5cf6',
  '#f59e0b',
  '#ec4899',
  '#06b6d4',
  '#6366f1',
  '#14b8a6',
];

interface ProgramAggregate {
  courseId: string;
  courseName: string;
  category: string;
  ngoId: string;
  ngoName: string;
  ngoLocation: string;
  duration: string;
  trainer: string;
  level: string;
  seatsAvailable: number;
  totalApplications: number;
  activeLearners: number;
  completedLearners: number;
  pendingLearners: number;
  rejectedLearners: number;
  totalCapacity: number;
  fillRate: number;
  completionRate: number;
  demandScore: number;
}

export const SkillTrendsModule: React.FC<SkillTrendsModuleProps> = ({ ngos = [], enrollments = [] }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'demand' | 'active' | 'fillRate' | 'completion'>('demand');
  const [displayCount, setDisplayCount] = useState<number>(8);
  const [activeChartTab, setActiveChartTab] = useState<'programs' | 'domains' | 'organizations' | 'capacity'>('programs');

  // 1. Flatten and aggregate all courses across all tenant organizations
  const programAggregates: ProgramAggregate[] = useMemo(() => {
    const list: ProgramAggregate[] = [];

    (ngos || []).forEach((ngo) => {
      const ngoName = ngo?.name || 'Organization';
      const ngoLocation = ngo?.location || 'Regional';

      (ngo?.courses || []).forEach((course) => {
        if (!course) return;

        // Match enrollments by courseId or courseName and optionally ngoId
        const matchingEnrollments = (enrollments || []).filter(
          (e) =>
            (e.courseId === course.id || e.courseName === course.name) &&
            (!e.ngoId || e.ngoId === ngo.id)
        );

        const activeLearners = matchingEnrollments.filter((e) => e.status === 'Approved').length;
        const completedLearners = matchingEnrollments.filter((e) => e.status === 'Completed').length;
        const pendingLearners = matchingEnrollments.filter((e) => e.status === 'Pending').length;
        const rejectedLearners = matchingEnrollments.filter((e) => e.status === 'Rejected').length;
        const totalApplications = matchingEnrollments.length;

        const seatsAvailable = course.seatsAvailable || 0;
        const totalCapacity = Math.max(activeLearners + seatsAvailable, 10);
        const fillRate = Math.min(100, Math.round(((activeLearners + completedLearners) / totalCapacity) * 100));
        const totalFinishedOrActive = activeLearners + completedLearners;
        const completionRate = totalFinishedOrActive > 0 ? Math.round((completedLearners / totalFinishedOrActive) * 100) : 0;

        // Composite demand score: applications weight + capacity pressure
        const demandScore = totalApplications * 10 + activeLearners * 5 + (totalCapacity - seatsAvailable) * 3;

        list.push({
          courseId: course.id,
          courseName: course.name || 'Program',
          category: course.category || 'General',
          ngoId: ngo.id,
          ngoName,
          ngoLocation,
          duration: course.duration || 'Flexible',
          trainer: course.trainer || 'Lead Instructor',
          level: course.level || 'All Levels',
          seatsAvailable,
          totalApplications,
          activeLearners,
          completedLearners,
          pendingLearners,
          rejectedLearners,
          totalCapacity,
          fillRate,
          completionRate,
          demandScore,
        });
      });
    });

    return list;
  }, [ngos, enrollments]);

  // Extract unique categories across all courses
  const categories = useMemo(() => {
    const set = new Set<string>();
    programAggregates.forEach((p) => {
      if (p.category) set.add(p.category);
    });
    return ['All', ...Array.from(set)];
  }, [programAggregates]);

  // Filtered and sorted programs
  const filteredPrograms = useMemo(() => {
    let result = programAggregates.filter((p) => {
      const matchCategory = selectedCategory === 'All' || p.category.toLowerCase() === selectedCategory.toLowerCase();
      const matchSearch =
        !searchQuery.trim() ||
        p.courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ngoName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ngoLocation.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCategory && matchSearch;
    });

    result.sort((a, b) => {
      if (sortBy === 'demand') return b.totalApplications - a.totalApplications || b.demandScore - a.demandScore;
      if (sortBy === 'active') return b.activeLearners - a.activeLearners;
      if (sortBy === 'fillRate') return b.fillRate - a.fillRate;
      if (sortBy === 'completion') return b.completedLearners - a.completedLearners || b.completionRate - a.completionRate;
      return 0;
    });

    return result;
  }, [programAggregates, selectedCategory, searchQuery, sortBy]);

  // Top programs for chart
  const topProgramsChartData = useMemo(() => {
    return filteredPrograms.slice(0, displayCount).map((p) => {
      const shortName = p.courseName.length > 22 ? p.courseName.substring(0, 20) + '…' : p.courseName;
      return {
        id: p.courseId,
        name: shortName,
        fullName: p.courseName,
        ngo: p.ngoName,
        category: p.category,
        'Active Students': p.activeLearners,
        'Graduated / Certified': p.completedLearners,
        'Pending / Waitlist': p.pendingLearners,
        'Available Seats': p.seatsAvailable,
        totalDemand: p.totalApplications,
        fillRate: p.fillRate,
      };
    });
  }, [filteredPrograms, displayCount]);

  // Category aggregate data for Pie/Donut Chart
  const categoryChartData = useMemo(() => {
    const map: Record<string, { name: string; count: number; active: number; completed: number; courses: number }> = {};

    programAggregates.forEach((p) => {
      const cat = p.category || 'General';
      if (!map[cat]) {
        map[cat] = { name: cat, count: 0, active: 0, completed: 0, courses: 0 };
      }
      map[cat].count += p.totalApplications;
      map[cat].active += p.activeLearners;
      map[cat].completed += p.completedLearners;
      map[cat].courses += 1;
    });

    const list = Object.values(map);
    const totalApps = list.reduce((sum, item) => sum + item.count, 0) || 1;

    return list.map((item) => ({
      ...item,
      percentage: Math.round((item.count / totalApps) * 100),
      color: CATEGORY_COLORS[item.name] || '#64748b',
    }));
  }, [programAggregates]);

  // Tenant Organization Distribution Data
  const tenantChartData = useMemo(() => {
    return (ngos || []).map((ngo) => {
      const ngoName = ngo?.name || 'Center';
      const ngoPrograms = programAggregates.filter((p) => p.ngoId === ngo.id);
      const totalApps = ngoPrograms.reduce((sum, p) => sum + p.totalApplications, 0);
      const active = ngoPrograms.reduce((sum, p) => sum + p.activeLearners, 0);
      const completed = ngoPrograms.reduce((sum, p) => sum + p.completedLearners, 0);
      const availableSeats = ngoPrograms.reduce((sum, p) => sum + p.seatsAvailable, 0);

      const shortName = ngoName.length > 18 ? ngoName.substring(0, 16) + '…' : ngoName;

      return {
        id: ngo.id,
        name: shortName,
        fullName: ngoName,
        location: ngo?.location || '',
        'Total Demand': totalApps,
        'Enrolled Cohort': active,
        'Graduates': completed,
        'Open Capacity': availableSeats,
        coursesCount: ngoPrograms.length,
      };
    });
  }, [ngos, programAggregates]);

  // Capacity vs Demand Pressure Data
  const capacityPressureData = useMemo(() => {
    return filteredPrograms.slice(0, 10).map((p) => {
      const shortName = p.courseName.length > 18 ? p.courseName.substring(0, 16) + '…' : p.courseName;
      return {
        name: shortName,
        fullName: p.courseName,
        ngo: p.ngoName,
        Applications: p.totalApplications,
        'Enrolled Learners': p.activeLearners + p.completedLearners,
        'Seat Capacity': p.totalCapacity,
        'Capacity Fill (%)': p.fillRate,
      };
    });
  }, [filteredPrograms]);

  // Top Executive KPIs across all tenants
  const kpis = useMemo(() => {
    const totalApplications = programAggregates.reduce((sum, p) => sum + p.totalApplications, 0);
    const totalActive = programAggregates.reduce((sum, p) => sum + p.activeLearners, 0);
    const totalCompleted = programAggregates.reduce((sum, p) => sum + p.completedLearners, 0);
    const totalSeatsLeft = programAggregates.reduce((sum, p) => sum + p.seatsAvailable, 0);
    const totalPrograms = programAggregates.length;
    const totalTenants = (ngos || []).length;

    // Top program
    const sortedByApps = [...programAggregates].sort((a, b) => b.totalApplications - a.totalApplications);
    const topProgram = sortedByApps[0];

    // Top category
    const sortedCategories = [...categoryChartData].sort((a, b) => b.count - a.count);
    const topCategory = sortedCategories[0];

    // Overall seat fill rate
    const totalCapacity = totalActive + totalSeatsLeft;
    const networkFillRate = totalCapacity > 0 ? Math.round((totalActive / totalCapacity) * 100) : 0;

    return {
      totalApplications,
      totalActive,
      totalCompleted,
      totalSeatsLeft,
      totalPrograms,
      totalTenants,
      topProgramName: topProgram?.courseName || 'Full-Stack Web Development',
      topProgramNgo: topProgram?.ngoName || 'Innovate For Tomorrow',
      topProgramDemand: topProgram?.totalApplications || 0,
      topCategoryName: topCategory?.name || 'Technology',
      topCategoryPercentage: topCategory?.percentage || 0,
      networkFillRate,
    };
  }, [programAggregates, ngos, categoryChartData]);

  // Export CSV Report of Network Skill Trends
  const handleExportCSV = () => {
    const headers = [
      'Rank',
      'Course Name',
      'Category',
      'Tenant Organization',
      'Location',
      'Total Applications',
      'Active Learners',
      'Graduated / Completed',
      'Pending Requests',
      'Seats Available',
      'Capacity Fill Rate (%)',
      'Completion Rate (%)',
      'Duration',
      'Instructor',
    ];

    const rows = filteredPrograms.map((p, index) => [
      index + 1,
      `"${p.courseName.replace(/"/g, '""')}"`,
      `"${p.category}"`,
      `"${p.ngoName.replace(/"/g, '""')}"`,
      `"${p.ngoLocation}"`,
      p.totalApplications,
      p.activeLearners,
      p.completedLearners,
      p.pendingLearners,
      p.seatsAvailable,
      `${p.fillRate}%`,
      `${p.completionRate}%`,
      `"${p.duration}"`,
      `"${p.trainer}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SkillSpot_Cross_Tenant_Skill_Trends_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Module Title Banner & High-Level Overview */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="p-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                <TrendingUp className="w-5 h-5" />
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                Cross-Tenant Skill Trends & Popularity Index
              </h2>
              <span className="hidden sm:inline-flex px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {kpis.totalTenants} Organizations Active
              </span>
            </div>
            <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-1.5 max-w-3xl leading-relaxed">
              Synthesized real-time enrollment velocity, domain demand share, and capacity utilization across all vocational training centers on the network.
            </p>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleExportCSV}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-sm transition-all active:scale-95"
              title="Export complete cross-tenant trends data for grants, workforce boards, and executive reporting"
            >
              <Download className="w-4 h-4" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>

        {/* Global Executive Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4 mt-6">
          <div className="bg-blue-50/60 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40">
            <div className="flex items-center justify-between text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
              <span>#1 Most Popular</span>
              <Flame className="w-4 h-4 text-amber-500" />
            </div>
            <p className="mt-2 text-sm sm:text-base font-black text-gray-900 dark:text-white truncate" title={kpis.topProgramName}>
              {kpis.topProgramName}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 truncate mt-0.5">
              {kpis.topProgramNgo} • {kpis.topProgramDemand} applicants
            </p>
          </div>

          <div className="bg-purple-50/60 dark:bg-purple-950/30 p-4 rounded-2xl border border-purple-100 dark:border-purple-900/40">
            <div className="flex items-center justify-between text-purple-600 dark:text-purple-400 text-xs font-bold uppercase tracking-wider">
              <span>Top Skill Domain</span>
              <Sparkles className="w-4 h-4 text-purple-500" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {kpis.topCategoryName}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {kpis.topCategoryPercentage}% of network learner volume
            </p>
          </div>

          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 p-4 rounded-2xl border border-indigo-100 dark:border-indigo-900/40">
            <div className="flex items-center justify-between text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider">
              <span>Network Volume</span>
              <Users className="w-4 h-4 text-indigo-500" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {kpis.totalApplications}
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {kpis.totalActive} active • {kpis.totalCompleted} certified
            </p>
          </div>

          <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40">
            <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
              <span>Seat Fill Rate</span>
              <Activity className="w-4 h-4 text-emerald-500" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {kpis.networkFillRate}%
            </p>
            <div className="w-full bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full transition-all"
                style={{ width: `${Math.min(100, kpis.networkFillRate)}%` }}
              />
            </div>
          </div>

          <div className="col-span-2 lg:col-span-1 bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/40">
            <div className="flex items-center justify-between text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
              <span>Network Catalog</span>
              <BookOpen className="w-4 h-4 text-amber-500" />
            </div>
            <p className="mt-2 text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
              {kpis.totalPrograms} Programs
            </p>
            <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">
              {kpis.totalSeatsLeft} seats currently open
            </p>
          </div>
        </div>
      </div>

      {/* Interactive Controls & Filters Bar */}
      <div className="bg-white dark:bg-gray-800 p-4 sm:p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-all ${
                selectedCategory === cat
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-gray-100 dark:bg-gray-700/60 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {cat === 'All' ? '🌐 All Disciplines' : cat}
            </button>
          ))}
        </div>

        {/* Search and Sort Dropdown */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-56">
            <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Search skill, center..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <span className="text-[11px] text-gray-400 font-semibold uppercase tracking-wider shrink-0">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full sm:w-auto px-3 py-1.5 text-xs font-semibold rounded-xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-800 dark:text-gray-200 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
            >
              <option value="demand">🔥 Total Applications (Demand)</option>
              <option value="active">👥 Active Enrolled Learners</option>
              <option value="fillRate">⚡ Seat Fill Rate (%)</option>
              <option value="completion">🎓 Verified Completions</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart View Switcher */}
      <div className="flex items-center space-x-2 border-b border-gray-200 dark:border-gray-700 pb-1">
        <button
          onClick={() => setActiveChartTab('programs')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeChartTab === 'programs'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Program Leaderboard</span>
        </button>

        <button
          onClick={() => setActiveChartTab('domains')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeChartTab === 'domains'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <PieChartIcon className="w-4 h-4" />
          <span>Domain Share Breakdown</span>
        </button>

        <button
          onClick={() => setActiveChartTab('organizations')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeChartTab === 'organizations'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Tenant Organization Share</span>
        </button>

        <button
          onClick={() => setActiveChartTab('capacity')}
          className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeChartTab === 'capacity'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Capacity vs Demand Matrix</span>
        </button>
      </div>

      {/* Main Visualizations Container */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        {/* VIEW 1: PROGRAM LEADERBOARD BAR CHART */}
        {activeChartTab === 'programs' && (
          <div>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>
                <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
                  <span>Most Popular Skill Programs Across Network</span>
                  <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 font-medium">
                    Showing Top {Math.min(displayCount, filteredPrograms.length)}
                  </span>
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  Comparison of active student cohorts, graduations, waitlisted applicants, and open workshop capacity.
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <span className="text-xs text-gray-400 font-semibold">Display:</span>
                {[5, 8, 12].map((num) => (
                  <button
                    key={num}
                    onClick={() => setDisplayCount(num)}
                    className={`px-2.5 py-1 text-xs font-bold rounded-lg ${
                      displayCount === num
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
                    }`}
                  >
                    Top {num}
                  </button>
                ))}
              </div>
            </div>

            {topProgramsChartData.length > 0 ? (
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={topProgramsChartData}
                    margin={{ top: 20, right: 20, left: 10, bottom: 60 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                    <XAxis
                      dataKey="name"
                      stroke="#9ca3af"
                      fontSize={11}
                      interval={0}
                      angle={-25}
                      textAnchor="end"
                      height={65}
                    />
                    <YAxis stroke="#9ca3af" fontSize={11} />
                    <Tooltip
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white dark:bg-gray-900 p-4 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 text-xs min-w-[240px]">
                            <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{data.fullName}</p>
                            <p className="text-blue-600 dark:text-blue-400 font-semibold mb-2">
                              🏢 {data.ngo} • {data.category}
                            </p>
                            <div className="space-y-1.5 border-t border-gray-100 dark:border-gray-800 pt-2">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Active Learners:</span>
                                <span className="font-bold text-blue-600 dark:text-blue-400">{data['Active Students']}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Certified Graduates:</span>
                                <span className="font-bold text-emerald-600 dark:text-emerald-400">{data['Graduated / Certified']}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Waitlist / Pending:</span>
                                <span className="font-bold text-amber-500">{data['Pending / Waitlist']}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Remaining Seats:</span>
                                <span className="font-bold text-purple-500">{data['Available Seats']}</span>
                              </div>
                              <div className="flex justify-between pt-1 border-t border-gray-100 dark:border-gray-800">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Total Demand:</span>
                                <span className="font-extrabold text-gray-900 dark:text-white">{data.totalDemand}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="font-semibold text-gray-700 dark:text-gray-300">Capacity Fill:</span>
                                <span className="font-extrabold text-emerald-600">{data.fillRate}%</span>
                              </div>
                            </div>
                          </div>
                        );
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                    <Bar dataKey="Active Students" fill="#3b82f6" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Graduated / Certified" fill="#10b981" stackId="a" radius={[0, 0, 0, 0]} />
                    <Bar dataKey="Pending / Waitlist" fill="#f59e0b" stackId="a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Available Seats" fill="#cbd5e1" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="py-16 text-center text-gray-400 text-xs">
                No skill programs matched your query criteria.
              </div>
            )}
          </div>
        )}

        {/* VIEW 2: DOMAIN SHARE BREAKDOWN */}
        {activeChartTab === 'domains' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-7 h-[360px]">
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-1">
                Vocational Domain Share of Total Demand
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Learner applications categorized by vocational sector across all tenant organizations.
              </p>
              <ResponsiveContainer width="100%" height="90%">
                <PieChart>
                  <Pie
                    data={categoryChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={115}
                    paddingAngle={4}
                    dataKey="count"
                  >
                    {categoryChartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color || PALETTE[index % PALETTE.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-xs">
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{data.name}</p>
                          <p className="text-gray-500 mt-1">Total Demand: <strong className="text-gray-900 dark:text-white">{data.count} applicants</strong> ({data.percentage}%)</p>
                          <p className="text-gray-500">Active Cohorts: <strong className="text-blue-600">{data.active} learners</strong></p>
                          <p className="text-gray-500">Course Offerings: <strong className="text-purple-600">{data.courses} courses</strong></p>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Category Statistics Breakdown Table */}
            <div className="lg:col-span-5 space-y-3">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Domain Metrics Breakdown
              </h4>
              <div className="space-y-2.5">
                {categoryChartData.map((cat) => (
                  <div
                    key={cat.name}
                    className="p-3 rounded-xl bg-gray-50 dark:bg-gray-700/40 border border-gray-100 dark:border-gray-700 flex items-center justify-between"
                  >
                    <div className="flex items-center space-x-2.5">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: cat.color }}
                      />
                      <div>
                        <p className="font-bold text-xs text-gray-900 dark:text-white">{cat.name}</p>
                        <p className="text-[10px] text-gray-500 dark:text-gray-400">
                          {cat.courses} programs across network
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-extrabold text-gray-900 dark:text-white">
                        {cat.count} apps
                      </span>
                      <span className="block text-[10px] font-semibold text-blue-600 dark:text-blue-400">
                        {cat.percentage}% share
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: TENANT ORGANIZATION VOLUME */}
        {activeChartTab === 'organizations' && (
          <div>
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Program Demand & Enrollment Volume by Tenant Center
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Comparative analysis of applicant traffic, active learners, and workshop capacity per organization.
              </p>
            </div>

            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={tenantChartData} margin={{ top: 20, right: 30, left: 10, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} />
                  <YAxis stroke="#9ca3af" fontSize={11} />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-xs">
                          <p className="font-bold text-gray-900 dark:text-white text-sm mb-1">{data.fullName}</p>
                          <p className="text-gray-400 mb-2">📍 {data.location}</p>
                          <div className="space-y-1">
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">Total Demand:</span>
                              <span className="font-bold text-blue-600">{data['Total Demand']}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">Enrolled Learners:</span>
                              <span className="font-bold text-emerald-600">{data['Enrolled Cohort']}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">Certified Graduates:</span>
                              <span className="font-bold text-purple-600">{data['Graduates']}</span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-gray-500">Active Course Offerings:</span>
                              <span className="font-bold text-gray-900 dark:text-white">{data.coursesCount}</span>
                            </div>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar dataKey="Total Demand" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Enrolled Cohort" fill="#10b981" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Graduates" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* VIEW 4: CAPACITY VS DEMAND PRESSURE MATRIX */}
        {activeChartTab === 'capacity' && (
          <div>
            <div className="mb-6">
              <h3 className="text-base font-bold text-gray-900 dark:text-white">
                Capacity vs Demand Pressure Index
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                Identifies programs facing high application bottlenecks (applications vs total available workshop seats).
              </p>
            </div>

            <div className="h-[360px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={capacityPressureData} margin={{ top: 20, right: 30, left: 10, bottom: 50 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" opacity={0.5} />
                  <XAxis dataKey="name" stroke="#9ca3af" fontSize={11} interval={0} angle={-25} textAnchor="end" height={60} />
                  <YAxis yAxisId="left" stroke="#9ca3af" fontSize={11} />
                  <YAxis yAxisId="right" orientation="right" stroke="#10b981" fontSize={11} unit="%" />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (!active || !payload || !payload.length) return null;
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white dark:bg-gray-900 p-3 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 text-xs">
                          <p className="font-bold text-gray-900 dark:text-white text-sm">{data.fullName}</p>
                          <p className="text-gray-400 mb-2">🏢 {data.ngo}</p>
                          <div className="space-y-1">
                            <p className="text-gray-500">Total Applications: <strong className="text-blue-600">{data.Applications}</strong></p>
                            <p className="text-gray-500">Seat Capacity: <strong className="text-gray-900 dark:text-white">{data['Seat Capacity']}</strong></p>
                            <p className="text-gray-500">Capacity Fill: <strong className="text-emerald-600">{data['Capacity Fill (%)']}%</strong></p>
                          </div>
                        </div>
                      );
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                  <Bar yAxisId="left" dataKey="Applications" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar yAxisId="left" dataKey="Enrolled Learners" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  <Line yAxisId="right" type="monotone" dataKey="Capacity Fill (%)" stroke="#10b981" strokeWidth={3} dot={{ r: 4 }} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
      </div>

      {/* DETAILED SKILL PROGRAMS LEADERBOARD TABLE */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-5">
          <div>
            <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center space-x-2">
              <span>Cross-Tenant Skill Program Ranking Table</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 font-bold">
                {filteredPrograms.length} Programs
              </span>
            </h3>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              Comprehensive ledger of vocational curriculum rankings, host tenant organizations, and admissions fill rates.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-100 dark:divide-gray-700 text-left">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-gray-400">
                <th className="pb-3 font-semibold w-12 text-center">Rank</th>
                <th className="pb-3 font-semibold">Program & Trade</th>
                <th className="pb-3 font-semibold">Tenant Organization</th>
                <th className="pb-3 font-semibold">Domain</th>
                <th className="pb-3 font-semibold text-center">Demand</th>
                <th className="pb-3 font-semibold text-center">Active Learners</th>
                <th className="pb-3 font-semibold text-center">Seats Left</th>
                <th className="pb-3 font-semibold text-center">Fill Rate</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/60 text-xs">
              {filteredPrograms.map((p, index) => {
                const isTop3 = index < 3;
                const badgeColor =
                  p.fillRate >= 90
                    ? 'bg-red-50 text-red-700 dark:bg-red-950/50 dark:text-red-300 border-red-200 dark:border-red-800'
                    : p.fillRate >= 60
                    ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                    : 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';

                const statusLabel =
                  p.fillRate >= 90
                    ? '🔥 High Demand / Full'
                    : p.fillRate >= 60
                    ? '⚡ Fast Filling'
                    : '🟢 Open Enrollment';

                return (
                  <tr key={`${p.ngoId}-${p.courseId}`} className="hover:bg-gray-50/70 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-3 text-center">
                      {index === 0 && <span className="text-base">🥇</span>}
                      {index === 1 && <span className="text-base">🥈</span>}
                      {index === 2 && <span className="text-base">🥉</span>}
                      {index > 2 && (
                        <span className="font-mono font-bold text-gray-400">#{index + 1}</span>
                      )}
                    </td>

                    <td className="py-3 pr-3">
                      <div className="font-bold text-gray-900 dark:text-white">
                        {p.courseName}
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-gray-400 mt-0.5">
                        <span>⏱️ {p.duration}</span>
                        <span>•</span>
                        <span>👤 {p.trainer}</span>
                        <span>•</span>
                        <span className="text-blue-500 font-semibold">{p.level}</span>
                      </div>
                    </td>

                    <td className="py-3 pr-3">
                      <div className="font-semibold text-gray-800 dark:text-gray-200 flex items-center space-x-1">
                        <Building2 className="w-3 h-3 text-gray-400 shrink-0" />
                        <span className="truncate max-w-[160px]">{p.ngoName}</span>
                      </div>
                      <p className="text-[10px] text-gray-400">{p.ngoLocation}</p>
                    </td>

                    <td className="py-3">
                      <span
                        className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[p.category] || '#64748b'}15`,
                          color: CATEGORY_COLORS[p.category] || '#64748b',
                        }}
                      >
                        {p.category}
                      </span>
                    </td>

                    <td className="py-3 text-center">
                      <span className="font-extrabold text-gray-900 dark:text-white">
                        {p.totalApplications}
                      </span>
                      <span className="block text-[10px] text-gray-400">apps</span>
                    </td>

                    <td className="py-3 text-center">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">
                        {p.activeLearners}
                      </span>
                      {p.completedLearners > 0 && (
                        <span className="block text-[10px] text-emerald-500">
                          +{p.completedLearners} grad
                        </span>
                      )}
                    </td>

                    <td className="py-3 text-center">
                      <span className={`font-semibold ${p.seatsAvailable === 0 ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                        {p.seatsAvailable}
                      </span>
                    </td>

                    <td className="py-3 text-center">
                      <div className="inline-flex items-center space-x-1.5">
                        <div className="w-12 bg-gray-200 dark:bg-gray-700 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${
                              p.fillRate >= 80 ? 'bg-red-500' : p.fillRate >= 50 ? 'bg-amber-500' : 'bg-emerald-500'
                            }`}
                            style={{ width: `${Math.min(100, p.fillRate)}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300">
                          {p.fillRate}%
                        </span>
                      </div>
                    </td>

                    <td className="py-3 text-right">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border ${badgeColor}`}>
                        {statusLabel}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default SkillTrendsModule;
