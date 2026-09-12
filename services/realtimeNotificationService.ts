import { supabase } from '../lib/supabaseClient';
import { Notification, WorkshopDeadline, Enrollment } from '../types';

// Browser Broadcast Channel for Cross-Tab Realtime Synchronization
const CHANNEL_NAME = 'skillspot_realtime_channel';
let broadcastChannel: BroadcastChannel | null = null;
try {
  if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
    broadcastChannel = new BroadcastChannel(CHANNEL_NAME);
  }
} catch (e) {
  console.warn('BroadcastChannel not supported in this environment', e);
}

// In-memory listener subscribers
type NotificationCallback = (notification: Notification) => void;
const subscribers = new Set<NotificationCallback>();

// Web Audio API Audio Chime Synthesizer
let audioCtx: AudioContext | null = null;

export const playNotificationSound = (type: 'deadline' | 'enrollment' | 'certificate' | 'default' = 'default') => {
  if (typeof window === 'undefined') return;
  const soundEnabled = localStorage.getItem('skillspot_sound_enabled') !== 'false';
  if (!soundEnabled) return;

  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    if (!audioCtx) {
      audioCtx = new AudioContextClass();
    }

    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'certificate') {
      // Fanfare celebration chime (C5 -> E5 -> G5 -> C6)
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(659.25, now + 0.1); // E5
      osc.frequency.setValueAtTime(783.99, now + 0.2); // G5
      osc.frequency.setValueAtTime(1046.5, now + 0.3); // C6
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
      osc.start(now);
      osc.stop(now + 0.65);
    } else if (type === 'deadline') {
      // Alert chime (Double pulse D5 -> F#5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, now); // D5
      osc.frequency.setValueAtTime(739.99, now + 0.12); // F#5
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
      gain.gain.setValueAtTime(0.3, now + 0.14);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);
      osc.start(now);
      osc.stop(now + 0.45);
    } else {
      // Pleasant chime for enrollment / updates (A4 -> E5)
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now); // A4
      osc.frequency.setValueAtTime(659.25, now + 0.08); // E5
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    }
  } catch (e) {
    // AudioContext autoplay restrictions or disabled
  }
};

/**
 * Dispatches a notification across the entire system in real-time:
 * 1. BroadcastChannel (cross-tab)
 * 2. Window CustomEvent (same-tab subscribers)
 * 3. In-memory registered callbacks
 * 4. Audio chime
 */
export const dispatchRealtimeNotification = (notification: Notification) => {
  // 1. In-memory subscribers
  subscribers.forEach((cb) => {
    try {
      cb(notification);
    } catch (err) {
      console.error('Error in notification subscriber callback:', err);
    }
  });

  // 2. Cross-tab BroadcastChannel
  if (broadcastChannel) {
    try {
      broadcastChannel.postMessage({ type: 'NOTIFICATION_DISPATCHED', payload: notification });
    } catch (e) {
      console.warn('Failed to postMessage to BroadcastChannel', e);
    }
  }

  // 3. Window CustomEvent
  if (typeof window !== 'undefined') {
    window.dispatchEvent(
      new CustomEvent('skillspot:notification', {
        detail: notification,
      })
    );
  }

  // 4. Sound feedback
  playNotificationSound(notification.type || 'default');
};

/**
 * Subscribe to real-time notification events
 */
export const subscribeToRealtimeNotifications = (callback: NotificationCallback) => {
  subscribers.add(callback);

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<Notification>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    }
  };

  const handleBroadcastMessage = (event: MessageEvent) => {
    if (event.data?.type === 'NOTIFICATION_DISPATCHED' && event.data?.payload) {
      callback(event.data.payload);
    }
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('skillspot:notification', handleCustomEvent);
  }

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcastMessage);
  }

  return () => {
    subscribers.delete(callback);
    if (typeof window !== 'undefined') {
      window.removeEventListener('skillspot:notification', handleCustomEvent);
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcastMessage);
    }
  };
};

// Supabase Realtime Channel listener
export const initSupabaseRealtimeChannel = (userId: string, onNewNotification: (notif: Notification) => void) => {
  try {
    const channel = supabase
      .channel(`user-notifications-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `userId=eq.${userId}`,
        },
        (payload) => {
          if (payload.new) {
            const newNotif = payload.new as Notification;
            dispatchRealtimeNotification(newNotif);
            onNewNotification(newNotif);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Supabase realtime subscription fallback active', err);
    return () => {};
  }
};

// -------------------------------------------------------------
// Pre-seeded Upcoming Workshop Deadlines Catalog
// -------------------------------------------------------------
const now = new Date();
const inHours = (h: number) => new Date(now.getTime() + h * 60 * 60 * 1000).toISOString();
const inDays = (d: number) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000).toISOString();

export const SEEDED_WORKSHOP_DEADLINES: WorkshopDeadline[] = [
  {
    id: 'dl-1',
    courseId: 'course-1-1',
    courseName: 'Full-Stack Web Development',
    ngoId: 'ngo-1',
    ngoName: 'TechForward Foundation',
    title: 'Sprint 3: REST API & SQL Database Milestone',
    description: 'Submit your deployed Express API repository with migrations and Postman test suite results.',
    dueDate: inHours(28), // tomorrow
    type: 'project',
    priority: 'urgent',
    submissionRequired: true,
  },
  {
    id: 'dl-2',
    courseId: 'course-1-1',
    courseName: 'Full-Stack Web Development',
    ngoId: 'ngo-1',
    ngoName: 'TechForward Foundation',
    title: 'Peer Code Review & Technical Documentation',
    description: 'Review two fellow cohort members pull requests and verify clean component documentation.',
    dueDate: inDays(4),
    type: 'milestone',
    priority: 'high',
    submissionRequired: true,
  },
  {
    id: 'dl-3',
    courseId: 'course-1-2',
    courseName: 'Introduction to UX/UI Design',
    ngoId: 'ngo-1',
    ngoName: 'TechForward Foundation',
    title: 'Interactive Prototype Usability Testing Summary',
    description: 'Conduct 3 guided user walkthroughs using your Figma prototype and document key UX friction points.',
    dueDate: inHours(14), // today/tonight
    type: 'project',
    priority: 'urgent',
    submissionRequired: true,
  },
  {
    id: 'dl-4',
    courseId: 'course-3-1',
    courseName: 'Solar PV Systems Installation & Electrical Safety',
    ngoId: 'ngo-3',
    ngoName: 'GreenCollar Academy',
    title: 'NEC Article 690 & Inverter Wiring Safety Assessment',
    description: 'Mandatory workshop safety assessment before entering the live rooftop simulator station.',
    dueDate: inHours(36),
    type: 'safety_quiz',
    priority: 'urgent',
    submissionRequired: true,
  },
  {
    id: 'dl-5',
    courseId: 'course-3-1',
    courseName: 'Solar PV Systems Installation & Electrical Safety',
    ngoId: 'ngo-3',
    ngoName: 'GreenCollar Academy',
    title: 'Fall Protection Harness & Tool Inspection Sign-off',
    description: 'Physical inspection and logging of personal safety lanyard, harness, and insulated torque wrenches.',
    dueDate: inDays(5),
    type: 'tool_inspection',
    priority: 'normal',
    submissionRequired: false,
  },
  {
    id: 'dl-6',
    courseId: 'course-2-1',
    courseName: 'Certified Nursing Assistant (CNA) Prep',
    ngoId: 'ngo-2',
    ngoName: 'Healthcare Pathways Institute',
    title: 'Vital Signs Clinical Lab Station Competency',
    description: 'Complete hands-on blood pressure, pulse oximetry, and aseptic patient care verification.',
    dueDate: inHours(20),
    type: 'milestone',
    priority: 'urgent',
    submissionRequired: true,
  },
  {
    id: 'dl-7',
    courseId: 'course-4-1',
    courseName: 'Precision CNC Machining & G-Code',
    ngoId: 'ngo-4',
    ngoName: 'Industrial Trades Collective',
    title: 'Tool Offset & Spindle Speed Tolerance Worksheet',
    description: 'Calculate feed rates and enter G-code coordinate parameters for aluminum block prototype.',
    dueDate: inDays(3),
    type: 'milestone',
    priority: 'high',
    submissionRequired: true,
  },
];

/**
 * Calculates human-readable time remaining for a deadline
 */
export const getTimeRemainingText = (dueDateString: string): { label: string; isOverdue: boolean; isUrgent: boolean } => {
  const target = new Date(dueDateString).getTime();
  const current = Date.now();
  const diffMs = target - current;

  if (diffMs <= 0) {
    return { label: 'Due now / past deadline', isOverdue: true, isUrgent: true };
  }

  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);

  if (diffHours < 1) {
    const diffMins = Math.max(1, Math.floor(diffMs / (1000 * 60)));
    return { label: `Due in ${diffMins} min`, isOverdue: false, isUrgent: true };
  }

  if (diffHours < 24) {
    return { label: `Due in ${diffHours}h`, isOverdue: false, isUrgent: true };
  }

  if (diffDays === 1) {
    return { label: 'Due tomorrow', isOverdue: false, isUrgent: true };
  }

  return { label: `Due in ${diffDays} days`, isOverdue: false, isUrgent: diffDays <= 2 };
};

/**
 * Returns upcoming workshop deadlines relevant to a student's active enrollments
 */
export const getStudentUpcomingDeadlines = (
  studentEnrollments: Enrollment[],
  allDeadlines: WorkshopDeadline[] = SEEDED_WORKSHOP_DEADLINES
): WorkshopDeadline[] => {
  const enrolledCourseIds = new Set(studentEnrollments.map((e) => e.courseId));
  const enrolledCourseNames = new Set(studentEnrollments.map((e) => e.courseName.toLowerCase()));

  // Filter deadlines matching enrolled courses
  const matched = allDeadlines.filter(
    (dl) => enrolledCourseIds.has(dl.courseId) || enrolledCourseNames.has(dl.courseName.toLowerCase())
  );

  // If student has courses with no specific deadline, generate one dynamically
  studentEnrollments.forEach((enr) => {
    const hasMatch = matched.some((m) => m.courseId === enr.courseId || m.courseName.toLowerCase() === enr.courseName.toLowerCase());
    if (!hasMatch && enr.status === 'Approved') {
      matched.push({
        id: `gen-dl-${enr.enrollmentId}`,
        courseId: enr.courseId,
        courseName: enr.courseName,
        ngoId: enr.ngoId,
        ngoName: 'Vocational Center',
        title: `Week 3 Practical Workshop Milestone`,
        description: `Hands-on module assessment and practical deliverable verification for ${enr.courseName}.`,
        dueDate: inHours(32),
        type: 'milestone',
        priority: 'high',
        submissionRequired: true,
      });
    }
  });

  return matched.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
};
