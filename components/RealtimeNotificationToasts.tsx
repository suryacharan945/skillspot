import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'motion/react';
import {
  Bell,
  Clock,
  Award,
  BookOpen,
  X,
  ExternalLink,
  Volume2,
  VolumeX,
  Sparkles,
  AlertTriangle,
  ChevronRight,
} from 'lucide-react';
import { Notification } from '../types';
import { subscribeToRealtimeNotifications } from '../services/realtimeNotificationService';
import confetti from 'canvas-confetti';

interface ToastItem {
  id: string;
  notification: Notification;
  timestamp: number;
}

export const RealtimeNotificationToasts: React.FC = () => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [isMuted, setIsMuted] = useState(() => {
    return localStorage.getItem('skillspot_sound_enabled') === 'false';
  });
  const navigate = useNavigate();

  const toggleSound = () => {
    setIsMuted((prev) => {
      const next = !prev;
      localStorage.setItem('skillspot_sound_enabled', next ? 'false' : 'true');
      return next;
    });
  };

  useEffect(() => {
    const unsubscribe = subscribeToRealtimeNotifications((notif: Notification) => {
      // Trigger confetti if it's a certificate issuance!
      if (notif.type === 'certificate') {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.85, x: 0.85 },
            colors: ['#10b981', '#f59e0b', '#3b82f6', '#8b5cf6'],
          });
        } catch (e) {
          // ignore confetti errors
        }
      }

      const toastId = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`;
      setToasts((prev) => [
        { id: toastId, notification: notif, timestamp: Date.now() },
        ...prev.slice(0, 3), // keep maximum 4 toasts visible
      ]);

      // Auto-dismiss after 8 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== toastId));
      }, 8000);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const dismissToast = (toastId: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== toastId));
  };

  const handleActionClick = (toast: ToastItem) => {
    dismissToast(toast.id);
    if (toast.notification.link) {
      navigate(toast.notification.link);
    }
  };

  if (toasts.length === 0) return null;

  return (
    <div
      className="fixed bottom-5 right-5 z-50 flex flex-col space-y-3 max-w-sm sm:max-w-md w-full px-4 pointer-events-none"
      role="region"
      aria-live="polite"
      aria-label="Real-time Notifications"
    >
      <div className="flex items-center justify-end space-x-2 pointer-events-auto pr-1">
        <button
          onClick={toggleSound}
          className="px-2.5 py-1 rounded-full bg-white/90 dark:bg-gray-800/90 shadow-sm border border-gray-200 dark:border-gray-700 text-[10px] font-bold text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white flex items-center space-x-1.5 backdrop-blur-xs transition-colors"
          title={isMuted ? 'Notification sounds muted' : 'Notification sounds enabled'}
        >
          {isMuted ? <VolumeX className="w-3 h-3 text-rose-500" /> : <Volume2 className="w-3 h-3 text-emerald-500" />}
          <span>{isMuted ? 'Sound Off' : 'Sound On'}</span>
        </button>
      </div>

      <AnimatePresence>
        {toasts.map((toast) => {
          const { notification } = toast;
          const isDeadline = notification.type === 'deadline';
          const isCertificate = notification.type === 'certificate';
          const isEnrollment = notification.type === 'enrollment';

          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: 30, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
              className={`pointer-events-auto relative p-4 rounded-2xl shadow-xl border backdrop-blur-md transition-all ${
                isDeadline
                  ? 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700/80 text-amber-950 dark:text-amber-100'
                  : isCertificate
                  ? 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-700/80 text-emerald-950 dark:text-emerald-100'
                  : isEnrollment
                  ? 'bg-blue-500/10 dark:bg-blue-950/40 border-blue-300 dark:border-blue-700/80 text-blue-950 dark:text-blue-100'
                  : 'bg-white/95 dark:bg-gray-800/95 border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100'
              }`}
            >
              <div className="flex items-start space-x-3">
                {/* Icon Column */}
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${
                    isDeadline
                      ? 'bg-amber-500 text-white animate-pulse'
                      : isCertificate
                      ? 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white'
                      : isEnrollment
                      ? 'bg-blue-600 text-white'
                      : 'bg-purple-600 text-white'
                  }`}
                >
                  {isDeadline ? (
                    <Clock className="w-5 h-5" />
                  ) : isCertificate ? (
                    <Award className="w-5 h-5" />
                  ) : isEnrollment ? (
                    <BookOpen className="w-5 h-5" />
                  ) : (
                    <Bell className="w-5 h-5" />
                  )}
                </div>

                {/* Content Column */}
                <div className="flex-1 min-w-0 pr-6">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-0.5 rounded-md text-[9px] font-black uppercase tracking-wider ${
                        isDeadline
                          ? 'bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-200'
                          : isCertificate
                          ? 'bg-emerald-200 dark:bg-emerald-900 text-emerald-900 dark:text-emerald-200'
                          : isEnrollment
                          ? 'bg-blue-200 dark:bg-blue-900 text-blue-900 dark:text-blue-200'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {isDeadline
                        ? 'Workshop Deadline'
                        : isCertificate
                        ? 'Credential Issued'
                        : isEnrollment
                        ? 'Program Enrollment'
                        : 'Real-time Alert'}
                    </span>
                    <span className="text-[10px] text-gray-400 dark:text-gray-400">Just now</span>
                  </div>

                  <h5 className="text-xs sm:text-sm font-bold mt-1 line-clamp-1">
                    {notification.title || (isDeadline ? 'Upcoming Deadline Alert' : isCertificate ? 'Certificate Ready' : 'Enrollment Update')}
                  </h5>

                  <p className="text-xs mt-0.5 text-gray-700 dark:text-gray-300 leading-snug line-clamp-2">
                    {notification.message}
                  </p>

                  {/* Action Buttons */}
                  <div className="mt-2.5 flex items-center space-x-2">
                    <button
                      onClick={() => handleActionClick(toast)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold flex items-center space-x-1 transition-all ${
                        isDeadline
                          ? 'bg-amber-600 hover:bg-amber-700 text-white'
                          : isCertificate
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                          : 'bg-blue-600 hover:bg-blue-700 text-white'
                      }`}
                    >
                      <span>{notification.actionLabel || (isDeadline ? 'View Milestone' : isCertificate ? 'View Certificate' : 'Open Program')}</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => dismissToast(toast.id)}
                      className="px-2 py-1 rounded-lg text-xs font-semibold text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>

                {/* Close Button */}
                <button
                  onClick={() => dismissToast(toast.id)}
                  className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors p-1"
                  aria-label="Dismiss alert"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default RealtimeNotificationToasts;
