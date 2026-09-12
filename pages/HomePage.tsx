import React, { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useData } from '../data/DataContext';
import NgoCard from '../components/NgoCard';
import NgoCardSkeleton from '../components/NgoCardSkeleton';
import { ImpactStatsGlassSkeleton } from '../components/skeletons/GlassSkeleton';
import DataFetchError from '../components/DataFetchError';
import { NGO } from '../types';
import NgoMapLocator from '../components/NgoMapLocator';
import RegisterNgoModal from '../components/RegisterNgoModal';
import {
  Building2,
  BookOpen,
  Users,
  Award,
  Search,
  MapPin,
  Sparkles,
  LayoutGrid,
  Map,
  ArrowRight,
  CheckCircle2,
  Filter,
  PlusCircle,
  Zap,
  Mic,
  Heart,
  Wrench,
  Compass,
  Briefcase,
} from 'lucide-react';

const HomePage: React.FC = () => {
  const { ngos, enrollments, loading, error } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('All');
  const [locationFilter, setLocationFilter] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const stats = useMemo(() => {
    const totalNgos = ngos.length;
    const totalCourses = ngos.reduce((acc, ngo) => acc + (ngo.courses?.length || 0), 0);
    const approvedEnrollments = enrollments.filter(e => e.status === 'Approved').length;
    const completedCertificates = enrollments.filter(e => e.status === 'Completed').length;
    return { totalNgos, totalCourses, approvedEnrollments, completedCertificates };
  }, [ngos, enrollments]);

  const uniqueNgoTypes = useMemo(() => {
    const types = new Set(ngos.map(ngo => ngo.type));
    return ['All', ...Array.from(types)];
  }, [ngos]);

  const uniqueLocations = useMemo(() => {
    const locations = new Set(ngos.map(ngo => ngo.location));
    return ['', ...Array.from(locations)];
  }, [ngos]);

  const filteredNgos = useMemo(() => {
    return ngos.filter(ngo => {
      if (!ngo) return false;
      const matchesSearch =
        (ngo.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ngo.description || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        ngo.courses?.some(c => (c?.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
      const matchesType = typeFilter === 'All' || ngo.type === typeFilter;
      const matchesLocation = locationFilter === '' || ngo.location === locationFilter;

      return matchesSearch && matchesType && matchesLocation;
    });
  }, [ngos, searchTerm, typeFilter, locationFilter]);

  const scrollToDirectory = () => {
    const element = document.getElementById('directory-section');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => (
            <NgoCardSkeleton key={index} />
          ))}
        </div>
      );
    }

    if (error) {
      return <DataFetchError error={error} />;
    }

    if (filteredNgos.length === 0) {
      return (
        <div className="text-center py-16 px-4 bg-white dark:bg-gray-800 rounded-3xl border border-gray-100 dark:border-gray-700 max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-blue-50 dark:bg-blue-950/40 text-blue-500 rounded-2xl flex items-center justify-center mx-auto text-2xl mb-4">
            🔍
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">No Training Centers Found</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-6">
            We couldn't find any centers matching "{searchTerm || typeFilter}". Try clearing your filters or exploring all available programs.
          </p>
          <button
            onClick={() => {
              setSearchTerm('');
              setTypeFilter('All');
              setLocationFilter('');
            }}
            className="px-5 py-2.5 bg-blue-600 text-white font-bold text-xs rounded-xl hover:bg-blue-700 transition-all shadow-sm"
          >
            Reset All Filters
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNgos.map((ngo: NGO) => (
          <NgoCard key={ngo.id} ngo={ngo} />
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="space-y-12 sm:space-y-16">
        
        {/* --- DYNAMIC HERO SECTION --- */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-950 text-white p-8 sm:p-14 shadow-2xl border border-indigo-500/20">
          
          {/* Animated Background Gradients & Glow Circles */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
          <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none animate-pulse-glow" style={{ animationDelay: '2s' }} />
          
          <div className="relative z-10 max-w-4xl mx-auto text-center space-y-6">
            
            {/* Live Indicator Pill */}
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-semibold shadow-inner">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <span className="text-emerald-300 font-bold">Live Network Active</span>
              <span className="text-white/40">•</span>
              <span className="text-gray-200">2026 Vocational Cohorts Enrolling</span>
            </div>

            {/* Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight sm:leading-none">
              Empowering Real Skills.{' '}
              <span className="bg-gradient-to-r from-blue-400 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
                Building Futures.
              </span>
            </h1>

            {/* Subheading */}
            <p className="text-sm sm:text-lg text-indigo-100/90 max-w-2xl mx-auto font-normal leading-relaxed">
              SkillSpot 2.0 unifies trusted NGOs, practical trade workshops, and verified credentials under one transparent decentralized ecosystem.
            </p>

            {/* Hero CTAs */}
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3.5">
              <button
                onClick={() => setIsRegisterModalOpen(true)}
                className="px-6 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold text-xs sm:text-sm rounded-2xl shadow-lg hover:shadow-emerald-500/25 transition-all duration-200 flex items-center space-x-2 transform hover:-translate-y-0.5"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Register Your NGO</span>
              </button>

              <button
                onClick={scrollToDirectory}
                className="px-6 py-3.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs sm:text-sm rounded-2xl border border-white/20 backdrop-blur-md transition-all duration-200 flex items-center space-x-2"
              >
                <Search className="w-4 h-4" />
                <span>Browse Vocational Programs</span>
              </button>
            </div>

            {/* Quick Feature Pills */}
            <div className="pt-4 flex flex-wrap justify-center items-center gap-4 text-xs text-indigo-200 font-medium">
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Verified Certificates</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Zero Tuition Middlemen</span>
              </span>
              <span className="flex items-center space-x-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Proximity-Based Cohorts</span>
              </span>
            </div>

          </div>
        </div>

        {/* --- VIBRANT IMPACT STATISTICS --- */}
        {loading ? (
          <ImpactStatsGlassSkeleton />
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Card 1: Partner NGOs */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700/80 transition-all flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  {stats.totalNgos}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Partner NGOs</p>
              </div>
            </div>

            {/* Card 2: Active Courses */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700/80 transition-all flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center flex-shrink-0">
                <BookOpen className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  {stats.totalCourses}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Vocational Courses</p>
              </div>
            </div>

            {/* Card 3: Students Enrolled */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700/80 transition-all flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 flex items-center justify-center flex-shrink-0">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 dark:text-white">
                  {stats.approvedEnrollments}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Active Students</p>
              </div>
            </div>

            {/* Card 4: Certificates Issued */}
            <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700/80 transition-all flex items-center space-x-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <p className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400">
                  {stats.completedCertificates}
                </p>
                <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">Certificates Issued</p>
              </div>
            </div>

          </div>
        )}

        {/* --- HOW SKILLSPOT WORKS (STRUCTURED 3-STEP PATHWAY) --- */}
        <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-purple-50/70 dark:from-gray-800/60 dark:via-gray-800/40 dark:to-gray-800/60 rounded-3xl p-8 sm:p-10 border border-blue-100/80 dark:border-gray-700">
          <div className="text-center max-w-xl mx-auto mb-8">
            <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 block mb-1">
              Streamlined Pathway
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              How SkillSpot 2.0 Works
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Connecting eager learners with real-world community workshops in 3 steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Step 1 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                1
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Explore Training Centers</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Filter verified NGOs by field, location distance, and curriculum structure to find hands-on vocational matches.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                2
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Apply for a Cohort</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Submit an enrollment application with your goals. The NGO team reviews and confirms your seat directly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-xs border border-gray-100 dark:border-gray-700 flex flex-col items-center text-center relative group hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white font-bold text-lg flex items-center justify-center mb-4 shadow-sm group-hover:scale-110 transition-transform">
                3
              </div>
              <h3 className="text-base font-bold text-gray-900 dark:text-white mb-2">Master Skills & Get Certified</h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                Complete practical milestones, build your portfolio, and graduate with a cryptographically verifiable certificate.
              </p>
            </div>

          </div>
        </div>

        {/* --- NEXT-GEN VOCATIONAL ECOSYSTEM PILLARS --- */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-indigo-600 dark:text-indigo-400 block mb-0.5">
                Full-Lifecycle Vocational Ecosystem
              </span>
              <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white">
                Career Acceleration & Workshop Network
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Pillar 1: AI Trade Coach */}
            <Link
              to="/coach"
              className="group p-5 bg-gradient-to-br from-blue-500/10 via-indigo-500/5 to-transparent dark:from-blue-950/40 dark:via-indigo-950/20 bg-white dark:bg-gray-800 rounded-3xl border border-blue-200/60 dark:border-blue-800/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Mic className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                  AI Trade Coach & Mock Interview
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Practice OSHA safety questions and technical scenarios with voice feedback & instant resumes.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                <span>Start Practice</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Pillar 2: Employer Portal */}
            <Link
              to="/employers"
              className="group p-5 bg-gradient-to-br from-indigo-500/10 via-purple-500/5 to-transparent dark:from-indigo-950/40 dark:via-purple-950/20 bg-white dark:bg-gray-800 rounded-3xl border border-indigo-200/60 dark:border-indigo-800/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Briefcase className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                  Employer Direct Hiring
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Source verified graduates, review workshop portfolios, and send direct apprenticeship offers.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-indigo-600 dark:text-indigo-400">
                <span>Source Candidates</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            {/* Pillar 3: Workshop & Tool Map */}
            <Link
              to="/workshops"
              className="group p-5 bg-gradient-to-br from-teal-500/10 via-cyan-500/5 to-transparent dark:from-teal-950/40 dark:via-cyan-950/20 bg-white dark:bg-gray-800 rounded-3xl border border-teal-200/60 dark:border-teal-800/40 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                  <Compass className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-gray-900 dark:text-white group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                  Shared Workshop Map
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                  Locate regional maker labs and book time on heavy machinery, test benches, and laser bays.
                </p>
              </div>
              <div className="pt-4 flex items-center text-xs font-bold text-teal-600 dark:text-teal-400">
                <span>Find Labs & Reserve</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>
        </div>

        {/* --- NGO DIRECTORY & PROXIMITY RADAR SECTION --- */}
        <div id="directory-section" className="space-y-6 pt-4">
          
          {/* Header Row + View Mode Switcher */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 dark:border-gray-700 pb-4">
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white tracking-tight">
                  Partner Training Organizations
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300 text-xs font-bold">
                  {filteredNgos.length}
                </span>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Browse verified institutes, workshop curriculums, and open training cohorts.
              </p>
            </div>

            {/* View Mode Toggle (Grid vs Interactive Radar Map) */}
            <div className="inline-flex rounded-xl p-1 bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-inner">
              <button
                onClick={() => setViewMode('grid')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
                <span>Directory Cards</span>
              </button>

              <button
                onClick={() => setViewMode('map')}
                className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  viewMode === 'map'
                    ? 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-300 shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Map className="w-3.5 h-3.5" />
                <span>Proximity Radar Map</span>
              </button>
            </div>
          </div>

          {/* Interactive Search & Filter Toolbar */}
          <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              
              {/* Search input with Lucide Search icon */}
              <div className="relative">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by center name or skill..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border rounded-xl bg-gray-50 text-gray-900 border-gray-200 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/60 dark:text-white dark:border-gray-600 dark:placeholder-gray-400 transition-all"
                />
              </div>

              {/* Type / Domain select */}
              <div className="relative">
                <Filter className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border rounded-xl bg-gray-50 text-gray-900 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/60 dark:text-white dark:border-gray-600 transition-all"
                >
                  {uniqueNgoTypes.map(type => (
                    <option key={type} value={type}>
                      {type === 'All' ? 'All Domain Categories' : type}
                    </option>
                  ))}
                </select>
              </div>

              {/* Location filter */}
              <div className="relative">
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
                <select
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 text-xs border rounded-xl bg-gray-50 text-gray-900 border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700/60 dark:text-white dark:border-gray-600 transition-all"
                >
                  {uniqueLocations.map(location => (
                    <option key={location} value={location}>
                      {location === '' ? 'All Locations / Cities' : location}
                    </option>
                  ))}
                </select>
              </div>

            </div>

            {/* Quick Category Chips */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {['All', 'Education', 'Community Development', 'Environmental', 'Healthcare'].map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setTypeFilter(category)}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    typeFilter === category
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600'
                  }`}
                >
                  {category === 'All' ? '🌟 All Domains' : category}
                </button>
              ))}
            </div>
          </div>

          {/* Main Directory Output: Grid vs Map */}
          {viewMode === 'map' ? (
            <NgoMapLocator ngos={filteredNgos} />
          ) : (
            <div className="mt-6">
              {renderContent()}
            </div>
          )}

        </div>

      </div>

      {/* Structured Multi-Step NGO Registration Modal */}
      <RegisterNgoModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
      />
    </>
  );
};

export default HomePage;
