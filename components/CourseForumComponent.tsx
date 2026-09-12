import React, { useState } from 'react';
import { CourseForumPost, CourseForumReply } from '../types';
import { useData } from '../data/DataContext';
import { useAuth } from '../auth/AuthContext';
import {
  MessageSquare,
  ThumbsUp,
  CheckCircle,
  Send,
  PlusCircle,
  HelpCircle,
  Clock,
  Sparkles,
  User,
  ShieldCheck,
} from 'lucide-react';

interface CourseForumComponentProps {
  courseId?: string;
  courseName?: string;
}

export const CourseForumComponent: React.FC<CourseForumComponentProps> = ({
  courseId,
  courseName,
}) => {
  const { forumPosts, setForumPosts } = useData();
  const { user } = useAuth();

  const [activeTab, setActiveTab] = useState<'all' | 'unanswered'>('all');
  const [isAsking, setIsAsking] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [newCategory, setNewCategory] = useState(courseName || 'General Vocational Q&A');

  // Reply state
  const [replyingPostId, setReplyingPostId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const displayedPosts = forumPosts.filter((post) => {
    if (courseId && post.courseId && post.courseId !== courseId) {
      return false;
    }
    if (activeTab === 'unanswered') {
      return post.replies.length === 0;
    }
    return true;
  });

  const handleCreatePost = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim() || !user) return;

    const newPost: CourseForumPost = {
      id: `post-${Date.now()}`,
      courseId: courseId || 'general',
      courseName: courseName || newCategory,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role === 'admin' ? 'trainer' : 'student',
      title: newTitle,
      content: newContent,
      createdAt: new Date().toISOString(),
      upvotes: 1,
      replies: [],
    };

    setForumPosts((prev) => [newPost, ...prev]);
    setNewTitle('');
    setNewContent('');
    setIsAsking(false);
  };

  const handleAddReply = (postId: string) => {
    if (!replyContent.trim() || !user) return;

    const newReply: CourseForumReply = {
      id: `rep-${Date.now()}`,
      postId,
      authorId: user.id,
      authorName: user.name,
      authorRole: user.role === 'admin' ? 'trainer' : 'student',
      content: replyContent,
      createdAt: new Date().toISOString(),
      isInstructorSolution: user.role === 'admin',
    };

    setForumPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              replies: [...p.replies, newReply],
            }
          : p
      )
    );

    setReplyContent('');
    setReplyingPostId(null);
  };

  const handleUpvote = (postId: string) => {
    setForumPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, upvotes: p.upvotes + 1 } : p))
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Classroom Forum & Peer Q&A
            </h3>
            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300">
              {displayedPosts.length} Threads
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Ask technical trade questions, troubleshoot tool operations, and receive answers from accredited instructors.
          </p>
        </div>

        <button
          onClick={() => setIsAsking((prev) => !prev)}
          className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center space-x-1.5 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isAsking ? 'Close Form' : 'Ask Question'}</span>
        </button>
      </div>

      {/* Ask Question Form Drawer */}
      {isAsking && (
        <form
          onSubmit={handleCreatePost}
          className="bg-purple-50/50 dark:bg-purple-950/20 p-5 rounded-2xl border border-purple-200 dark:border-purple-800 space-y-3 animate-in fade-in duration-150"
        >
          <span className="text-[11px] font-bold text-purple-700 dark:text-purple-300 uppercase tracking-wider block">
            Start a Technical Discussion
          </span>
          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Question Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Best practice for crimping MC4 connectors in wet weather?"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white font-semibold"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 dark:text-gray-300 mb-1">
              Details & Context *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Provide context, workshop conditions, equipment models used..."
              value={newContent}
              onChange={(e) => setNewContent(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-2 pt-1">
            <button
              type="button"
              onClick={() => setIsAsking(false)}
              className="px-3 py-1.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center space-x-1"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Post Question</span>
            </button>
          </div>
        </form>
      )}

      {/* Threads List */}
      <div className="space-y-4">
        {displayedPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white dark:bg-gray-800 rounded-2xl p-5 border border-gray-100 dark:border-gray-700 shadow-xs space-y-4"
          >
            <div className="flex justify-between items-start gap-3">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    {post.courseName}
                  </span>
                  <span className="text-[11px] text-gray-400">
                    by {post.authorName} ({post.authorRole})
                  </span>
                </div>
                <h4 className="font-bold text-base text-gray-900 dark:text-white">
                  {post.title}
                </h4>
              </div>

              <button
                onClick={() => handleUpvote(post.id)}
                className="flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-gray-50 dark:bg-gray-700/60 border border-gray-200 dark:border-gray-600 text-xs font-bold text-gray-600 dark:text-gray-300 hover:text-purple-600 hover:border-purple-300 transition-colors shrink-0"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                <span>{post.upvotes}</span>
              </button>
            </div>

            <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
              {post.content}
            </p>

            {/* Replies Section */}
            {post.replies.length > 0 && (
              <div className="space-y-2.5 pt-2 border-t border-gray-100 dark:border-gray-700/60">
                <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">
                  Replies ({post.replies.length})
                </span>
                {post.replies.map((reply) => (
                  <div
                    key={reply.id}
                    className={`p-3 rounded-xl text-xs space-y-1 ${
                      reply.isInstructorSolution
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800'
                        : 'bg-gray-50 dark:bg-gray-750 border border-gray-100 dark:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-bold text-gray-800 dark:text-gray-200">
                        <span>{reply.authorName}</span>
                        {reply.isInstructorSolution && (
                          <span className="px-1.5 py-0.2 rounded-md bg-emerald-600 text-white text-[9px] font-bold uppercase tracking-wider flex items-center space-x-0.5">
                            <ShieldCheck className="w-2.5 h-2.5" />
                            <span>Instructor Solution</span>
                          </span>
                        )}
                      </div>
                      <span className="text-[9px] text-gray-400">
                        {new Date(reply.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-[11px]">
                      {reply.content}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Quick Reply Form */}
            {replyingPostId === post.id ? (
              <div className="pt-2 flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Write a response or verified tip..."
                  value={replyContent}
                  onChange={(e) => setReplyContent(e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white"
                />
                <button
                  onClick={() => handleAddReply(post.id)}
                  className="px-3 py-1.5 bg-purple-600 text-white text-xs font-bold rounded-xl flex items-center space-x-1"
                >
                  <Send className="w-3 h-3" />
                  <span>Reply</span>
                </button>
                <button
                  onClick={() => setReplyingPostId(null)}
                  className="px-2 py-1.5 text-xs text-gray-400 hover:text-gray-600"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setReplyingPostId(post.id)}
                className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center space-x-1 pt-1"
              >
                <MessageSquare className="w-3 h-3" />
                <span>Add Reply</span>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseForumComponent;
