import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../auth/AuthContext';
import { useData } from '../data/DataContext';
import { MockInterviewQuestion, MockInterviewEvaluation, VocationalResumeData } from '../types';
import {
  Sparkles,
  Mic,
  MicOff,
  Volume2,
  Send,
  Award,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Printer,
  ChevronRight,
  ShieldCheck,
  Wrench,
  Clock,
  RotateCcw,
  BookOpen,
  User as UserIcon,
  HelpCircle,
  Zap,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { GoogleGenAI } from '@google/genai';
import { AiEvaluationGlassSkeleton } from '../components/skeletons/GlassSkeleton';

export const CareerCoachPage: React.FC = () => {
  const { user } = useAuth();
  const { mockQuestions, enrollments, portfolioItems, ngos } = useData();

  const [activeTab, setActiveTab] = useState<'interview' | 'resume'>('interview');

  // -------------------------------------------------------------
  // Mock Interview State
  // -------------------------------------------------------------
  const [selectedQuestionId, setSelectedQuestionId] = useState<string>(
    mockQuestions[0]?.id || 'mock-1'
  );
  const [userAnswer, setUserAnswer] = useState<string>('');
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [evaluation, setEvaluation] = useState<MockInterviewEvaluation | null>(null);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [showModelAnswer, setShowModelAnswer] = useState<boolean>(false);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const recognitionRef = useRef<any>(null);

  const activeQuestion =
    mockQuestions.find((q) => q.id === selectedQuestionId) || mockQuestions[0];

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setUserAnswer((prev) => (prev ? prev + ' ' + transcript : transcript));
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, []);

  const handleToggleRecord = () => {
    if (!recognitionRef.current) {
      setSpeechError(
        'Speech recognition is not supported in this browser. Please type your response.'
      );
      return;
    }
    setSpeechError(null);
    if (isRecording) {
      recognitionRef.current.stop();
      setIsRecording(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsRecording(true);
      } catch (err) {
        console.warn('Speech start error:', err);
      }
    }
  };

  // Text to Speech
  const handleSpeakQuestion = () => {
    if (!('speechSynthesis' in window)) {
      alert('Text-to-speech is not supported in this browser.');
      return;
    }
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(activeQuestion.question);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
  };

  // Evaluate Response
  const handleEvaluateAnswer = async () => {
    if (!userAnswer.trim()) return;
    setIsEvaluating(true);
    setEvaluation(null);

    const apiKey = process.env.API_KEY || process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const ai = new GoogleGenAI({ apiKey });
        const prompt = `You are a certified master vocational trade instructor and OSHA safety examiner.
Evaluate this student's response to the following trade interview scenario:

TRADE CATEGORY: ${activeQuestion.tradeCategory}
SCENARIO: ${activeQuestion.scenarioTitle}
QUESTION: ${activeQuestion.question}
REQUIRED SAFETY/KEY POINTS: ${Array.isArray(activeQuestion?.keySafetyPoints) ? activeQuestion.keySafetyPoints.join(', ') : ''}

STUDENT'S ANSWER:
"${userAnswer}"

Please evaluate strictly and return a JSON object with this EXACT structure (no markdown fences, just pure JSON):
{
  "score": <number between 40 and 100>,
  "overallVerdict": "<Brief 1-2 sentence overall summary of candidate readiness>",
  "technicalPrecisionScore": <number between 40 and 100>,
  "safetyComplianceScore": <number between 40 and 100>,
  "communicationScore": <number between 40 and 100>,
  "strengths": ["<strength 1>", "<strength 2>"],
  "improvementTips": ["<actionable tip 1>", "<actionable tip 2>"],
  "modelAnswerAnalysis": "<Comparison of what the candidate answered versus what a senior journeyman would do>"
}`;

        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        const rawText = response.text || '';
        const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        setEvaluation(parsed);
        if (parsed.score >= 80) {
          confetti({ particleCount: 50, spread: 60 });
        }
        setIsEvaluating(false);
        return;
      } catch (e) {
        console.warn('Gemini evaluation fallback engaged:', e);
      }
    }

    // Heuristic Vocational Evaluator Fallback
    setTimeout(() => {
      const lowerAnswer = userAnswer.toLowerCase();
      let matchedSafety = 0;
      activeQuestion.keySafetyPoints.forEach((point) => {
        const words = point.toLowerCase().split(' ');
        const matches = words.filter((w) => w.length > 3 && lowerAnswer.includes(w));
        if (matches.length >= 1) matchedSafety++;
      });

      const lengthScore = Math.min(25, Math.floor(userAnswer.split(' ').length / 3));
      const safetyRatio = matchedSafety / Math.max(1, activeQuestion.keySafetyPoints.length);
      const safetyScore = Math.min(100, Math.round(50 + safetyRatio * 50));
      const techScore = Math.min(100, Math.round(55 + lengthScore + (safetyRatio > 0.5 ? 20 : 5)));
      const commScore = Math.min(100, Math.round(60 + (userAnswer.length > 100 ? 30 : 15)));
      const overall = Math.round((techScore + safetyScore + commScore) / 3);

      const strengths: string[] = [];
      const tips: string[] = [];

      if (safetyScore >= 75) {
        strengths.push('Demonstrated solid OSHA safety awareness and protective equipment protocols.');
      } else {
        tips.push(`Explicitly mention primary PPE and Lockout/Tagout (LOTO) procedures: ${activeQuestion.keySafetyPoints[0] || 'Verify zero energy'}.`);
      }

      if (userAnswer.length > 120) {
        strengths.push('Structured response logically, following step-by-step diagnostic sequence.');
      } else {
        tips.push('Expand your explanation to specify diagnostic tools, measurements, or tolerance limits.');
      }

      tips.push(`Review key workshop code: AWS / NFPA / National Building standards relevant to ${activeQuestion.tradeCategory}.`);

      setEvaluation({
        score: overall,
        overallVerdict:
          overall >= 80
            ? 'Strong, work-ready response demonstrating disciplined technical understanding and workshop safety compliance.'
            : 'Good fundamental understanding. Adding specific diagnostic instrument readings and OSHA protocols will elevate your interview score.',
        technicalPrecisionScore: techScore,
        safetyComplianceScore: safetyScore,
        communicationScore: commScore,
        strengths,
        improvementTips: tips,
        modelAnswerAnalysis:
          'Your answer addressed practical aspects of the scenario. Compare with the model answer to integrate specific measurement tolerances and standards.',
      });

      if (overall >= 80) {
        confetti({ particleCount: 60, spread: 70 });
      }
      setIsEvaluating(false);
    }, 900);
  };

  // -------------------------------------------------------------
  // Vocational Resume State & Logic
  // -------------------------------------------------------------
  const [resumeData, setResumeData] = useState<VocationalResumeData>(() => {
    const studentEnrollment = enrollments.find((e) => e.status === 'Completed') || enrollments[0];
    const studentNgo = ngos.find((n) => n.id === studentEnrollment?.ngoId) || ngos[0];

    return {
      fullName: user?.name || 'Alex Mercer',
      targetTrade: studentEnrollment?.courseName || 'Clean Energy & Solar PV Specialist',
      phone: '(415) 555-0188',
      email: user?.email || 'alex.mercer@trade-pro.net',
      location: 'San Francisco Bay Area, CA',
      verifiedWorkshopHours: 360,
      professionalBio:
        'Certified vocational technician with 360+ hours of accredited hands-on workshop training. Proficient in diagnostic testing, OSHA safety compliance, and practical field installations.',
      primaryCenter: studentNgo?.name || 'SkillSpot Vocational Training Center',
      coreCompetencies: [
        'Lockout / Tagout (LOTO)',
        'CAT-III/IV Multimeter Diagnostics',
        'Blueprint & Schematic Reading',
        'Preventative Maintenance',
        'NFPA 70E / OSHA 10 Compliance',
      ],
      equipmentProficiencies: [
        'Digital Clamp Meters',
        'Torque Wrenches & Precision Calipers',
        'Auto-Darkening Welding Rigs',
        'Laser Level Benchmark Systems',
      ],
      completedCourses: enrollments
        .filter((e) => e.status === 'Completed' || e.status === 'Approved')
        .map((e) => e.courseName),
      certificateHash: studentEnrollment?.certificateId || 'CERT-INNOVATE-001',
      capstoneProjects: portfolioItems.length > 0
        ? portfolioItems.map((p) => ({
            title: p.title || 'Workshop Practical Milestone',
            description: p.description || '',
            toolsUsed: Array.isArray(p.toolsUsed)
              ? p.toolsUsed.join(', ')
              : Array.isArray(p.skillsLearned)
              ? p.skillsLearned.join(', ')
              : (typeof p.toolsUsed === 'string' ? p.toolsUsed : 'Specialized workshop tools'),
          }))
        : [
            {
              title: '50kW Grid-Tied Inverter Simulation & Storage Array',
              description: 'Configured rapid shutdown DC disconnects, tested ground fault isolation resistance, and verified balanced three-phase AC output.',
              toolsUsed: 'CAT IV Multimeter, Megger 1000V Tester, Torque Drivers',
            },
          ],
    };
  });

  const [newCompetency, setNewCompetency] = useState('');

  const handleAddCompetency = () => {
    if (!newCompetency.trim()) return;
    if (!resumeData.coreCompetencies.includes(newCompetency.trim())) {
      setResumeData((prev) => ({
        ...prev,
        coreCompetencies: [...prev.coreCompetencies, newCompetency.trim()],
      }));
    }
    setNewCompetency('');
  };

  const handleRemoveCompetency = (item: string) => {
    setResumeData((prev) => ({
      ...prev,
      coreCompetencies: prev.coreCompetencies.filter((c) => c !== item),
    }));
  };

  const handlePrintResume = () => {
    window.print();
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto pb-16">
      {/* Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-8 text-white shadow-xl">
        <div className="absolute -right-12 -bottom-12 w-64 h-64 rounded-full bg-blue-500/20 blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-xs font-bold text-blue-200">
              <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
              <span>AI Trade Career Accelerator</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              Trade Career Coach & Interview Simulator
            </h1>
            <p className="text-xs sm:text-sm text-blue-100/80 max-w-2xl leading-relaxed">
              Master real-world workshop scenarios, practice spoken technical interviews with live AI evaluation, and generate an ATS-ready vocational trade resume.
            </p>
          </div>

          <div className="flex bg-white/10 backdrop-blur-md p-1.5 rounded-2xl border border-white/20 self-start shrink-0">
            <button
              onClick={() => setActiveTab('interview')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'interview'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <Mic className="w-4 h-4 text-blue-600" />
              <span>Mock Interviewer</span>
            </button>
            <button
              onClick={() => setActiveTab('resume')}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'resume'
                  ? 'bg-white text-gray-900 shadow-md'
                  : 'text-white hover:bg-white/10'
              }`}
            >
              <FileText className="w-4 h-4 text-purple-600" />
              <span>Vocational Resume</span>
            </button>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: Voice & Text Trade Mock Interviewer */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'interview' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Scenario Picker */}
          <div className="lg:col-span-4 space-y-4">
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-gray-700">
                <div className="flex items-center space-x-2">
                  <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300">
                    Trade Scenarios
                  </span>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400">
                  {mockQuestions.length} Available
                </span>
              </div>

              <div className="space-y-2">
                {mockQuestions.map((q) => {
                  const isSelected = q.id === selectedQuestionId;
                  return (
                    <button
                      key={q.id}
                      onClick={() => {
                        setSelectedQuestionId(q.id);
                        setEvaluation(null);
                        setShowModelAnswer(false);
                      }}
                      className={`w-full text-left p-3 rounded-2xl transition-all border ${
                        isSelected
                          ? 'bg-blue-50/80 dark:bg-blue-950/50 border-blue-300 dark:border-blue-700 shadow-xs'
                          : 'bg-gray-50/50 dark:bg-gray-700/30 border-transparent hover:bg-gray-100/70 dark:hover:bg-gray-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-black uppercase text-blue-600 dark:text-blue-400">
                          {q.tradeCategory}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                            q.difficulty === 'Apprentice'
                              ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300'
                              : q.difficulty === 'Journeyman'
                              ? 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                              : 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                          }`}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                      <h4 className="text-xs font-bold text-gray-900 dark:text-white line-clamp-1">
                        {q.scenarioTitle}
                      </h4>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Safety & Compliance Checklist */}
            <div className="bg-gradient-to-br from-amber-500/10 to-orange-500/10 dark:from-amber-950/40 dark:to-orange-950/30 rounded-3xl p-5 border border-amber-200 dark:border-amber-800/40 space-y-3">
              <div className="flex items-center space-x-2 text-amber-800 dark:text-amber-300">
                <ShieldCheck className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                <span className="text-xs font-black uppercase tracking-wider">
                  OSHA & Code Checkpoints
                </span>
              </div>
              <p className="text-[11px] text-gray-600 dark:text-gray-300">
                Senior recruiters look for mention of these mandatory trade criteria:
              </p>
              <ul className="space-y-1.5 text-[11px] text-gray-700 dark:text-gray-300">
                {activeQuestion.keySafetyPoints.map((point, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
                    <span>{point}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column: Scenario Detail, Voice Input & AI Feedback */}
          <div className="lg:col-span-8 space-y-6">
            {/* Scenario Card */}
            <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest">
                    {activeQuestion.tradeCategory} • {activeQuestion.difficulty} Level
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-white mt-0.5">
                    {activeQuestion.scenarioTitle}
                  </h3>
                </div>

                <button
                  onClick={handleSpeakQuestion}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all ${
                    isSpeaking
                      ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300 animate-pulse'
                      : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                  }`}
                  title="Listen to interviewer"
                >
                  <Volume2 className="w-4 h-4 text-blue-500" />
                  <span>{isSpeaking ? 'Stop Reading' : 'Listen Scenario'}</span>
                </button>
              </div>

              {/* Context & Question Prompt */}
              <div className="bg-blue-50/50 dark:bg-blue-950/30 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/40 text-xs text-gray-700 dark:text-gray-300 space-y-2">
                <div className="flex items-center space-x-1.5 text-blue-700 dark:text-blue-300 font-bold">
                  <HelpCircle className="w-3.5 h-3.5" />
                  <span>Interview Prompt:</span>
                </div>
                <p className="text-sm font-medium text-gray-900 dark:text-white leading-relaxed">
                  "{activeQuestion.question}"
                </p>
                <div className="text-[11px] text-gray-500 dark:text-gray-400 pt-1 border-t border-blue-100/50 dark:border-blue-900/30">
                  <span className="font-semibold">Context:</span> {activeQuestion.context}
                </div>
              </div>

              {/* Student Response Area */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-700 dark:text-gray-300 flex items-center space-x-2">
                    <span>Your Answer (Speak or Type)</span>
                    {isRecording && (
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 dark:text-rose-400 text-[10px] font-bold animate-pulse">
                        <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
                        <span>Listening...</span>
                      </span>
                    )}
                  </label>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={handleToggleRecord}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center space-x-1.5 transition-all shadow-xs ${
                        isRecording
                          ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                          : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                      <span>{isRecording ? 'Stop Mic' : 'Speak Answer'}</span>
                    </button>

                    {userAnswer && (
                      <button
                        onClick={() => setUserAnswer('')}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors"
                        title="Clear answer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>

                {speechError && (
                  <p className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                    {speechError}
                  </p>
                )}

                <textarea
                  value={userAnswer}
                  onChange={(e) => setUserAnswer(e.target.value)}
                  placeholder="Example: 'First, I ensure proper PPE including 1000V rated gloves. Next, I verify lockout/tagout on the disconnect switch before testing zero voltage with a verified meter...'"
                  rows={6}
                  className="w-full p-4 text-xs sm:text-sm rounded-2xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 focus:ring-2 focus:ring-blue-500 focus:outline-hidden dark:text-white"
                />

                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <span className="text-[11px] text-gray-400">
                    Word count: {userAnswer.trim() ? userAnswer.trim().split(/\s+/).length : 0} words
                  </span>

                  <button
                    onClick={handleEvaluateAnswer}
                    disabled={!userAnswer.trim() || isEvaluating}
                    className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white text-xs font-bold shadow-md hover:shadow-indigo-500/25 flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isEvaluating ? (
                      <>
                        <span className="w-2 h-2 rounded-full bg-cyan-300 animate-ping" />
                        <span>Synthesizing Feedback...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-cyan-200" />
                        <span>Evaluate with AI Trade Coach</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* AI Evaluation Loading Shimmer Skeleton */}
            {isEvaluating && <AiEvaluationGlassSkeleton />}

            {/* AI Evaluation Results Card */}
            {evaluation && !isEvaluating && (
              <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 border border-indigo-100 dark:border-indigo-900/50 shadow-md space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-700">
                  <div>
                    <div className="flex items-center space-x-2">
                      <Award className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                      <h3 className="text-base font-bold text-gray-900 dark:text-white">
                        AI Coach Performance Evaluation
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {evaluation.overallVerdict}
                    </p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <span className="text-[10px] text-gray-400 font-bold uppercase block">
                        Readiness Score
                      </span>
                      <span
                        className={`text-2xl font-black ${
                          evaluation.score >= 80
                            ? 'text-emerald-600 dark:text-emerald-400'
                            : evaluation.score >= 70
                            ? 'text-amber-600 dark:text-amber-400'
                            : 'text-rose-600 dark:text-rose-400'
                        }`}
                      >
                        {evaluation.score}/100
                      </span>
                    </div>
                  </div>
                </div>

                {/* Criterion Metric Bars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300">Technical Precision</span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {evaluation.technicalPrecisionScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${evaluation.technicalPrecisionScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300">OSHA Safety & LOTO</span>
                      <span className="text-emerald-600 dark:text-emerald-400">
                        {evaluation.safetyComplianceScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${evaluation.safetyComplianceScore}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="bg-gray-50 dark:bg-gray-700/30 p-3.5 rounded-2xl border border-gray-100 dark:border-gray-700">
                    <div className="flex justify-between text-xs font-bold mb-1.5">
                      <span className="text-gray-700 dark:text-gray-300">Clarity & Sequence</span>
                      <span className="text-indigo-600 dark:text-indigo-400">
                        {evaluation.communicationScore}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 dark:bg-gray-600 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${evaluation.communicationScore}%` }}
                      ></div>
                    </div>
                  </div>
                </div>

                {/* Strengths and Tips Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="bg-emerald-50/60 dark:bg-emerald-950/30 p-4 rounded-2xl border border-emerald-100 dark:border-emerald-900/40 space-y-2">
                    <div className="flex items-center space-x-1.5 text-emerald-800 dark:text-emerald-300 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Observed Strengths:</span>
                    </div>
                    <ul className="space-y-1.5 text-gray-700 dark:text-gray-300">
                      {evaluation.strengths.map((str, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-emerald-500 font-bold">•</span>
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-amber-50/60 dark:bg-amber-950/30 p-4 rounded-2xl border border-amber-100 dark:border-amber-900/40 space-y-2">
                    <div className="flex items-center space-x-1.5 text-amber-800 dark:text-amber-300 font-bold">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      <span>Coaching & Remediation Tips:</span>
                    </div>
                    <ul className="space-y-1.5 text-gray-700 dark:text-gray-300">
                      {evaluation.improvementTips.map((tip, i) => (
                        <li key={i} className="flex items-start space-x-1.5">
                          <span className="text-amber-500 font-bold">•</span>
                          <span>{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Expandable Model Answer Comparison */}
                <div className="pt-2">
                  <button
                    onClick={() => setShowModelAnswer(!showModelAnswer)}
                    className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center space-x-1.5"
                  >
                    <span>{showModelAnswer ? 'Hide' : 'Reveal'} Senior Journeyman Model Answer</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        showModelAnswer ? 'rotate-90' : ''
                      }`}
                    />
                  </button>

                  {showModelAnswer && (
                    <div className="mt-3 bg-gray-50 dark:bg-gray-700/40 p-4 rounded-2xl border border-gray-200 dark:border-gray-700 text-xs text-gray-700 dark:text-gray-300 space-y-2">
                      <p className="font-semibold text-gray-900 dark:text-white">
                        Benchmark Response for this scenario:
                      </p>
                      <p className="italic leading-relaxed">
                        "{activeQuestion.sampleModelAnswer}"
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: Vocational Resume & Bio Generator */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'resume' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Form: Edit Resume Details */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100 dark:border-gray-700">
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-purple-600" />
                <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                  Resume Customizer
                </h3>
              </div>
              <span className="text-[10px] text-gray-400 font-medium">Live sync</span>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={resumeData.fullName}
                  onChange={(e) => setResumeData({ ...resumeData, fullName: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Target Vocational Trade Title
                </label>
                <input
                  type="text"
                  value={resumeData.targetTrade}
                  onChange={(e) => setResumeData({ ...resumeData, targetTrade: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                    Phone
                  </label>
                  <input
                    type="text"
                    value={resumeData.phone}
                    onChange={(e) => setResumeData({ ...resumeData, phone: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                    Workshop Hours
                  </label>
                  <input
                    type="number"
                    value={resumeData.verifiedWorkshopHours}
                    onChange={(e) =>
                      setResumeData({
                        ...resumeData,
                        verifiedWorkshopHours: parseInt(e.target.value) || 0,
                      })
                    }
                    className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Professional Bio / Summary
                </label>
                <textarea
                  rows={3}
                  value={resumeData.professionalBio}
                  onChange={(e) =>
                    setResumeData({ ...resumeData, professionalBio: e.target.value })
                  }
                  className="w-full p-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                />
              </div>

              {/* Core Competencies Tagging */}
              <div>
                <label className="text-[11px] font-bold text-gray-600 dark:text-gray-300 block mb-1">
                  Core Trade Competencies
                </label>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {resumeData.coreCompetencies.map((c) => (
                    <span
                      key={c}
                      className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 text-[10px] font-bold"
                    >
                      <span>{c}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveCompetency(c)}
                        className="hover:text-rose-500"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex space-x-2">
                  <input
                    type="text"
                    value={newCompetency}
                    onChange={(e) => setNewCompetency(e.target.value)}
                    placeholder="e.g. Arc Flash Safety, Tig Welding..."
                    className="flex-grow p-2 text-xs rounded-xl border border-gray-200 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-900/50 dark:text-white"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddCompetency();
                      }
                    }}
                  />
                  <button
                    onClick={handleAddCompetency}
                    className="px-3 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors"
                  >
                    Add
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Live Printable 1-Page Trade Resume */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                Recruiter-Ready Preview
              </span>
              <button
                onClick={handlePrintResume}
                className="px-4 py-2 bg-gray-900 hover:bg-black dark:bg-white dark:hover:bg-gray-100 text-white dark:text-gray-900 rounded-xl text-xs font-bold flex items-center space-x-2 shadow-sm transition-all"
              >
                <Printer className="w-4 h-4" />
                <span>Print / Save as PDF</span>
              </button>
            </div>

            {/* Resume Sheet Container */}
            <div
              id="printable-trade-resume"
              className="bg-white text-gray-900 p-8 sm:p-10 rounded-3xl shadow-lg border border-gray-200 space-y-6 font-sans text-xs"
            >
              {/* Top Header */}
              <div className="border-b-2 border-gray-900 pb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <h2 className="text-2xl font-black tracking-tight text-gray-950 uppercase">
                    {resumeData.fullName}
                  </h2>
                  <p className="text-sm font-bold text-blue-700 mt-0.5">
                    {resumeData.targetTrade}
                  </p>
                </div>
                <div className="text-right text-[11px] text-gray-600 space-y-0.5">
                  <p>{resumeData.email}</p>
                  <p>{resumeData.phone}</p>
                  <p>{resumeData.location}</p>
                </div>
              </div>

              {/* Verified Training Badge */}
              <div className="bg-gray-50 p-3.5 rounded-xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-[10px] font-bold text-gray-500 uppercase block">
                      Accredited Vocational Center
                    </span>
                    <span className="text-xs font-bold text-gray-900">
                      {resumeData.primaryCenter}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block">
                    Verified Hours
                  </span>
                  <span className="text-xs font-black text-emerald-700">
                    {resumeData.verifiedWorkshopHours} Practical Hrs
                  </span>
                </div>
              </div>

              {/* Summary */}
              <div className="space-y-1.5">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-950 border-b border-gray-200 pb-1">
                  Professional Profile
                </h4>
                <p className="text-[11.5px] text-gray-700 leading-relaxed">
                  {resumeData.professionalBio}
                </p>
              </div>

              {/* Competencies */}
              <div className="space-y-2">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-950 border-b border-gray-200 pb-1">
                  Core Technical Competencies & Safety
                </h4>
                <div className="flex flex-wrap gap-1.5">
                  {resumeData.coreCompetencies.map((c, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 bg-gray-100 rounded text-[11px] font-medium text-gray-800"
                    >
                      {c}
                    </span>
                  ))}
                </div>
              </div>

              {/* Capstone Projects */}
              <div className="space-y-3">
                <h4 className="text-[11px] font-black uppercase tracking-wider text-gray-950 border-b border-gray-200 pb-1">
                  Verified Capstone Workshop Projects
                </h4>
                <div className="space-y-2.5">
                  {resumeData.capstoneProjects.map((p, idx) => (
                    <div key={idx} className="space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-gray-900 text-xs">{p.title}</span>
                      </div>
                      <p className="text-[11px] text-gray-600">{p.description}</p>
                      <p className="text-[10px] text-gray-500">
                        <span className="font-semibold text-gray-700">Tools & Standards:</span>{' '}
                        {p.toolsUsed}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Credentials Verification Link */}
              <div className="pt-3 border-t border-gray-200 flex items-center justify-between text-[10px] text-gray-500">
                <div className="flex items-center space-x-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>
                    SkillSpot Public Credential Ledger ID:{' '}
                    <strong className="text-gray-800">{resumeData.certificateHash}</strong>
                  </span>
                </div>
                <span>Digitally Verified by Training Instructor</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerCoachPage;
