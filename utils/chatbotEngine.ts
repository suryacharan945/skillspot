import { NGO, Course, VocationalJob } from '../types';

export interface BotActionCard {
  type: 'ngo' | 'course' | 'job';
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeColor?: 'emerald' | 'blue' | 'amber' | 'purple';
  details?: string[];
  link?: string;
}

export interface BotResponse {
  text: string;
  actionCards?: BotActionCard[];
  suggestions?: string[];
}

/**
 * Builds dynamic context string for Gemini API with live data
 */
export function buildDynamicPromptContext(
  ngos: NGO[],
  jobs: VocationalJob[]
): string {
  const ngoData = (ngos || []).map((ngo) => ({
    id: ngo.id,
    name: ngo?.name || 'Organization',
    mission: ngo?.mission || ngo?.description || '',
    location: ngo?.location || '',
    contact: {
      email: ngo?.contactEmail || ngo?.contact?.email || '',
      phone: ngo?.phone || ngo?.contact?.phone || '',
      website: ngo?.website || ngo?.contact?.website || '',
      address: ngo?.address || '',
    },
    category: ngo?.type || 'Vocational',
    rating: ngo?.rating || 4.5,
    coursesCount: ngo?.courses?.length || 0,
    courses: (ngo?.courses || []).map((c) => ({
      id: c.id,
      name: c?.name || 'Program',
      description: c?.description || '',
      category: c?.category || 'General',
      mode: c?.mode || 'Hybrid',
      duration: c?.duration || '12 weeks',
      seatsAvailable: c?.seatsAvailable || 0,
      prerequisites: c?.prerequisites || 'None',
      certification: c?.certificationType || 'Certificate',
      isFree: c?.tuitionFee === 0 || !c?.tuitionFee,
    })),
  }));

  const jobData = (jobs || []).map((j) => ({
    id: j.id,
    title: j?.title || 'Position',
    company: j?.company || 'Employer',
    location: j?.location || '',
    wage: j?.hourlyWageOrStipend || 'Competitive',
    category: j?.category || 'General',
    skills: j?.requiredSkills || [],
  }));

  return `You are the friendly, intelligent, and highly structured AI Navigator for SkillSpot 2.0.
Your mission is to guide students, job seekers, and partner organizations through vocational education, NGO training programs, job placements, and certifications.

ALWAYS format your answers with clean structural hierarchy:
- Use bold headlines or section titles.
- Use concise bullet points for key details (Course Name, NGO Name, Duration, Mode, Seats, Location).
- Clearly indicate if programs are Free or Sponsored.
- Provide direct recommendations with clear next steps (e.g. "Click the program card below or visit the NGO profile to submit your application").

Here is the LIVE dynamic database of registered NGOs, programs, and jobs:
${JSON.stringify({ ngos: ngoData, jobs: jobData }, null, 2)}`;
}

/**
 * Intelligent Local Semantic Knowledge Engine
 * Completely free, instant, zero external API key required.
 * Dynamically queries the live ngos and jobs state.
 */
export function processLocalQuery(
  rawQuery: string,
  ngos: NGO[],
  jobs: VocationalJob[]
): BotResponse {
  const query = rawQuery.trim().toLowerCase();

  // 1. GREETINGS & INTRODUCTIONS
  if (
    query === 'hi' ||
    query === 'hello' ||
    query === 'hey' ||
    query.startsWith('hello') ||
    query.startsWith('hi ') ||
    query.includes('who are you') ||
    query.includes('what can you do')
  ) {
    const totalCourses = (ngos || []).reduce((acc, n) => acc + (n?.courses?.length || 0), 0);
    return {
      text: `👋 **Welcome to SkillSpot 2.0 AI Navigator!**\n\nI am your live vocational advisor. I am dynamically synchronized with **${(ngos || []).length} partner NGOs** and **${totalCourses} vocational training programs** currently active on the platform.\n\n**Here is what I can help you with:**\n• 🔍 Finding certified vocational courses by trade, category, or location\n• 🏢 Exploring registered NGOs, their missions, and direct contact details\n• ⚡ Checking available cohort seats and waitlist openings\n• 💼 Discovering hiring partner job opportunities\n• 📝 Explaining how to apply, track syllabus milestones, and manage profiles`,
      suggestions: [
        'Available courses',
        'Show all partner NGOs',
        'Courses with open seats',
        'Hiring job opportunities',
        'How do I apply?',
      ],
    };
  }

  // 2. HOW TO APPLY / ENROLL
  if (
    query.includes('how to apply') ||
    query.includes('how to enroll') ||
    query.includes('admission') ||
    query.includes('application process') ||
    query.includes('enroll in a course')
  ) {
    return {
      text: `📝 **How to Apply & Enroll on SkillSpot 2.0:**\n\n**Step 1: Explore Courses**\nBrowse programs by trade (Solar, Welding, Healthcare, Tech, Textiles) and select a certified course.\n\n**Step 2: Check Requirements & Seats**\nReview prerequisites, mode (Online/In-Person/Hybrid), and available cohort seats.\n\n**Step 3: Submit Application**\nClick **"Apply for Course"** on any NGO or course page. Fill in your educational background and submit.\n\n**Step 4: Real-Time Review**\nThe partner NGO reviews your application. You will receive an instant notification once accepted into the cohort!\n\n**Step 5: Track Syllabus & Graduate**\nAccess the Student Dashboard to check off weekly syllabus topics, submit hands-on milestones, and earn your verified diploma certificate.`,
      suggestions: [
        'Explore all courses',
        'Which courses are free?',
        'Courses with open seats',
      ],
    };
  }

  // 3. PROFILE & DETAILS MANAGEMENT (Cover page, profile photo, updating NGO data)
  if (
    query.includes('profile') ||
    query.includes('cover page') ||
    query.includes('profile picture') ||
    query.includes('avatar') ||
    query.includes('update data') ||
    query.includes('edit details') ||
    query.includes('manage details')
  ) {
    return {
      text: `🎨 **Profile & Branding Management:**\n\n**For Organizations & NGO Admins:**\n• **Direct on Profile**: Go to your NGO page and click the **"Edit Organization Profile"** button in the hero banner.\n• **In Admin Studio**: Navigate to the **Admin Studio → "Branding & Profile"** tab to manage:\n  - Organization Name, Mission Statement & Description\n  - Logo Image & High-Resolution Cover Page Banner\n  - Official Contact Email, Phone, Physical Address & Website\n  - Accreditation Badges & Vocational Categories\n\n**For Students & Candidates:**\n• Click on your avatar/name in the top header, or open the **Student Dashboard → "Profile & Identity"** tab.\n• Customize your **Avatar Photo**, **Cover Page Banner**, **Target Career Track**, **Bio**, **Phone**, **Skills**, and **Resume/Portfolio links**.`,
      suggestions: [
        'Show all partner NGOs',
        'How to apply',
        'Available courses',
      ],
    };
  }

  // 4. FREE / TUITION / COST QUERIES
  if (
    query.includes('free') ||
    query.includes('cost') ||
    query.includes('fee') ||
    query.includes('tuition') ||
    query.includes('scholarship') ||
    query.includes('sponsored')
  ) {
    const freeCourses: { ngo: NGO; course: Course }[] = [];
    (ngos || []).forEach((n) => {
      (n?.courses || []).forEach((c) => {
        if (!c.tuitionFee || c.tuitionFee === 0) {
          freeCourses.push({ ngo: n, course: c });
        }
      });
    });

    const actionCards: BotActionCard[] = freeCourses.slice(0, 4).map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course?.name || 'Program',
      subtitle: `${ngo?.name || 'Partner'} • ${ngo?.location || ''}`,
      badge: '100% Free / Sponsored',
      badgeColor: 'emerald',
      details: [
        `Duration: ${course.duration}`,
        `Mode: ${course.mode}`,
        `Seats Available: ${course.seatsAvailable}`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `🎉 **100% Free & Sponsored Vocational Programs:**\n\nSkillSpot 2.0 partners with charitable foundations and corporate CSR sponsors. **All featured vocational courses offer fully funded or free tuition** for eligible students, including certifications and hands-on lab access.\n\nHere are highlighted free vocational programs you can enroll in right now:`,
      actionCards,
      suggestions: [
        'Courses with open seats',
        'Solar technician programs',
        'Tech and coding courses',
      ],
    };
  }

  // 5. OPEN SEATS & ADMISSION AVAILABILITY
  if (
    query.includes('open seat') ||
    query.includes('seats available') ||
    query.includes('seat') ||
    query.includes('available now') ||
    query.includes('vacant') ||
    query.includes('waitlist')
  ) {
    const coursesWithSeats: { ngo: NGO; course: Course }[] = [];
    (ngos || []).forEach((n) => {
      (n?.courses || []).forEach((c) => {
        if (c.seatsAvailable > 0) {
          coursesWithSeats.push({ ngo: n, course: c });
        }
      });
    });

    const actionCards: BotActionCard[] = coursesWithSeats.slice(0, 4).map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course?.name || 'Program',
      subtitle: `${ngo?.name || 'Partner'} • ${ngo?.location || ''}`,
      badge: `${course.seatsAvailable} Seats Available`,
      badgeColor: 'blue',
      details: [
        `Category: ${course.category}`,
        `Duration: ${course.duration}`,
        `Mode: ${course.mode}`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `⚡ **Programs with Immediate Openings (${coursesWithSeats.length} active courses with open seats):**\n\nThese courses currently have open cohort capacity for upcoming batches. Apply early to secure your spot before seats fill up!`,
      actionCards,
      suggestions: [
        'How to apply',
        'Show all partner NGOs',
        'Hiring job opportunities',
      ],
    };
  }

  // 6. JOBS & VOCATIONAL HIRING PLACEMENTS
  if (
    query.includes('job') ||
    query.includes('hiring') ||
    query.includes('placement') ||
    query.includes('salary') ||
    query.includes('wage') ||
    query.includes('career') ||
    query.includes('stipend') ||
    query.includes('work')
  ) {
    const actionCards: BotActionCard[] = jobs.slice(0, 4).map((j) => ({
      type: 'job',
      id: j.id,
      title: j.title,
      subtitle: `${j.company} • ${j.location}`,
      badge: j.hourlyWageOrStipend,
      badgeColor: 'purple',
      details: [
        `Category: ${j.category}`,
        `Required: ${j.requiredSkills.slice(0, 3).join(', ')}`,
      ],
      link: `/jobs`,
    }));

    return {
      text: `💼 **Vocational Job Openings & Hiring Partners:**\n\nSkillSpot 2.0 connects certified graduates directly with local industry employers offering competitive wages and apprenticeships.\n\nHere are highlighted active job listings on our Job Board:`,
      actionCards,
      suggestions: [
        'Explore all courses',
        'Available courses',
        'How to enroll',
      ],
    };
  }

  // 7. SEARCH SPECIFIC NGO (BY NAME OR MATCHING TEXT)
  const matchedNgo = (ngos || []).find((n) => {
    const name = (n?.name || '').toLowerCase();
    const id = (n?.id || '').toLowerCase();
    return (
      query.includes(name) ||
      name.includes(query) ||
      query.includes(id) ||
      (n?.location || '').toLowerCase().includes(query)
    );
  });

  if (matchedNgo && (query.includes('ngo') || query.includes('foundation') || query.includes('institute') || query.includes('center') || query.includes((matchedNgo?.name || '').toLowerCase().split(' ')[0]))) {
    const actionCards: BotActionCard[] = (matchedNgo?.courses || []).map((c) => ({
      type: 'course',
      id: c.id,
      title: c?.name || 'Program',
      subtitle: `${matchedNgo?.name || 'Partner'} • ${c.duration}`,
      badge: c.seatsAvailable > 0 ? `${c.seatsAvailable} Seats` : 'Waitlist Only',
      badgeColor: c.seatsAvailable > 0 ? 'emerald' : 'amber',
      details: [
        `Mode: ${c.mode}`,
        `Category: ${c.category}`,
        `Certification: ${c.certificationType || 'Industry Certificate'}`,
      ],
      link: `/ngo/${matchedNgo.id}`,
    }));

    return {
      text: `🏢 **${matchedNgo?.name || 'Partner Center'}**\n\n📍 **Location:** ${matchedNgo.location} (${matchedNgo.address})\n⭐ **Rating:** ${matchedNgo.rating} / 5.0 (${matchedNgo.reviewCount || 0} reviews)\n🎯 **Type:** ${matchedNgo.type}\n\n**Mission & Impact:**\n${matchedNgo.mission || matchedNgo.description}\n\n**Contact & Connect:**\n• 📧 Email: ${matchedNgo.contactEmail}\n• 📞 Phone: ${matchedNgo.phone || 'Available on request'}\n• 🌐 Website: ${matchedNgo.website || 'Verified Partner'}\n\n**Available Training Programs (${(matchedNgo?.courses || []).length}):**`,
      actionCards,
      suggestions: [
        'How to apply',
        'Other partner NGOs',
        'Courses with open seats',
      ],
    };
  }

  // 8. SEARCH SPECIFIC COURSE / TRADE (e.g. Solar, Welding, Web, Electrician, Plumbing, Healthcare)
  const matchedCourses: { ngo: NGO; course: Course }[] = [];
  (ngos || []).forEach((n) => {
    (n?.courses || []).forEach((c) => {
      const cName = (c?.name || '').toLowerCase();
      const cDesc = (c?.description || '').toLowerCase();
      const cCat = (c?.category || '').toLowerCase();
      if (
        query.split(' ').some((word) => word.length > 2 && (cName.includes(word) || cCat.includes(word) || cDesc.includes(word)))
      ) {
        matchedCourses.push({ ngo: n, course: c });
      }
    });
  });

  if (matchedCourses.length > 0) {
    const actionCards: BotActionCard[] = matchedCourses.slice(0, 4).map(({ ngo, course }) => ({
      type: 'course',
      id: course.id,
      title: course?.name || 'Program',
      subtitle: `${ngo?.name || 'Partner'} • ${ngo?.location || ''}`,
      badge: course.seatsAvailable > 0 ? `${course.seatsAvailable} Open Seats` : 'Waitlist Active',
      badgeColor: course.seatsAvailable > 0 ? 'emerald' : 'amber',
      details: [
        `Duration: ${course.duration}`,
        `Format: ${course.mode}`,
        `Prerequisites: ${course.prerequisites || 'None'}`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `🔍 **Matching Vocational Programs (${matchedCourses.length} found):**\n\nHere are the top courses matching your interest. You can review the duration, learning mode, and seats available below:`,
      actionCards,
      suggestions: [
        'How to enroll',
        'Which courses are free?',
        'Show all partner NGOs',
      ],
    };
  }

  // 9. LIST ALL NGOS
  if (
    query.includes('all ngo') ||
    query.includes('list ngo') ||
    query.includes('show ngo') ||
    query.includes('partner') ||
    query.includes('organizations') ||
    query.includes('centers')
  ) {
    const actionCards: BotActionCard[] = (ngos || []).slice(0, 4).map((ngo) => ({
      type: 'ngo',
      id: ngo.id,
      title: ngo?.name || 'Partner',
      subtitle: `${ngo?.location || ''} • ${ngo?.type || 'Vocational'}`,
      badge: `${(ngo?.courses || []).length} Courses`,
      badgeColor: 'blue',
      details: [
        `Contact: ${ngo?.contactEmail || ''}`,
        `Rating: ${ngo?.rating || 4.5} ★`,
      ],
      link: `/ngo/${ngo.id}`,
    }));

    return {
      text: `🏢 **Registered NGO Vocational Centers (${(ngos || []).length} Partners):**\n\nSkillSpot 2.0 partners with accredited NGOs across diverse vocational fields. Each organization provides hands-on workshop training and direct job placement assistance.\n\nSelect an organization to explore their courses and mission:`,
      actionCards,
      suggestions: [
        'Courses with open seats',
        'How to apply',
        'Available courses',
      ],
    };
  }

  // 10. DEFAULT INTELLIGENT FALLBACK WITH USEFUL DIRECTORY
  const totalCourses = (ngos || []).reduce((acc, n) => acc + (n?.courses?.length || 0), 0);
  const sampleCourses: { ngo: NGO; course: Course }[] = [];
  (ngos || []).forEach((n) => {
    (n?.courses || []).forEach((c) => {
      if (sampleCourses.length < 3) sampleCourses.push({ ngo: n, course: c });
    });
  });

  const actionCards: BotActionCard[] = sampleCourses.map(({ ngo, course }) => ({
    type: 'course',
    id: course.id,
    title: course?.name || 'Program',
    subtitle: `${ngo?.name || 'Partner'} • ${ngo?.location || ''}`,
    badge: `${course.seatsAvailable} Seats`,
    badgeColor: 'emerald',
    details: [`Duration: ${course.duration}`, `Mode: ${course.mode}`],
    link: `/ngo/${ngo.id}`,
  }));

  return {
    text: `💡 **I can help you explore SkillSpot 2.0!**\n\nWe currently feature **${ngos.length} certified NGOs**, **${totalCourses} vocational courses**, and **${jobs.length} industry hiring partners**.\n\nTry asking me about:\n• Specific trades: *"Solar technician"*, *"Welding"*, *"Software"*, *"Electrician"*\n• Partner NGOs: *"Pratham"*, *"TechBridge"*, *"Seva"*, *"Anudip"*\n• Admissions & Fees: *"Which courses are free?"*, *"How to apply?"*\n• Openings: *"Seats available"*, *"Job openings"*`,
    actionCards,
    suggestions: [
      'Available courses',
      'Show all partner NGOs',
      'Courses with open seats',
      'Hiring job opportunities',
    ],
  };
}
