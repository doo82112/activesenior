"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Send } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

interface Comment {
  id: number;
  text: string;
  createdAt: string;
  user: {
    nickname: string;
    leaningProfile: { red: number; blue: number; orange: number };
  };
}

interface CommentPanelProps {
  contentId: number;
  isOpen: boolean;
  onClose: () => void;
}

export function CommentPanel({ contentId, isOpen, onClose }: CommentPanelProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newText, setNewText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      fetchComments();
    }
  }, [isOpen, contentId]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/comments?contentId=${contentId}`);
      if (res.ok) {
        const data = await res.json();
        setComments(data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newText.trim() || isSubmitting) return;

    if (status === "unauthenticated") {
      const message = encodeURIComponent("로그인 후 댓글을 작성할 수 있습니다.");
      router.push(`/login?message=${message}`);
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, text: newText }),
      });

      if (res.ok) {
        const newComment = await res.json();
        setComments([newComment, ...comments]);
        setNewText("");
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDominantColor = (profile: { red: number; blue: number; orange: number }) => {
    if (!profile) return "bg-slate-500";
    const { red, blue, orange } = profile;
    if (red > blue && red > orange) return "bg-leaning-red";
    if (blue > red && blue > orange) return "bg-leaning-blue";
    if (orange > red && orange > blue) return "bg-leaning-orange";
    return "bg-slate-500";
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-[10000] backdrop-blur-sm pointer-events-auto"
          />

          {/* Panel */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[70vh] bg-slate-900 z-[10001] rounded-t-3xl flex flex-col pointer-events-auto border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10">
              <h3 className="text-white font-bold text-lg px-2">댓글 {comments.length}</h3>
              <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-full bg-white/5 transition-colors">
                <X size={20} />
              </button>
            </div>

            {/* Comment List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar flex flex-col-reverse">
              <div ref={bottomRef} />
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 shadow-[0_0_10px_rgba(255,255,255,0.2)] ${getDominantColor(comment.user.leaningProfile)}`} />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-bold text-sm text-slate-200">{comment.user.nickname}</span>
                      <span className="text-xs text-slate-500">{new Date(comment.createdAt).toLocaleDateString()}</span>
                    </div>
                    <p className="text-slate-300 text-sm leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && (
                <div className="h-full flex items-center justify-center text-slate-500 text-sm">
                  첫 번째 댓글을 남겨보세요.
                </div>
              )}
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/10 bg-slate-950 rounded-b-3xl pb-8">
              <form onSubmit={handleSubmit} className="relative">
                <input
                  type="text"
                  value={newText}
                  onChange={(e) => setNewText(e.target.value)}
                  placeholder={status === "unauthenticated" ? "로그인 후 댓글을 작성할 수 있습니다." : "댓글을 입력하세요..."}
                  className="w-full bg-slate-800 text-white rounded-full py-4 pl-6 pr-14 outline-none focus:ring-2 focus:ring-leaning-orange border border-white/5 transition-all"
                  onClick={() => {
                    if (status === "unauthenticated") {
                      const message = encodeURIComponent("로그인 후 댓글을 작성할 수 있습니다.");
                      router.push(`/login?message=${message}`);
                    }
                  }}
                  readOnly={status === "unauthenticated"}
                />
                <button
                  type="submit"
                  disabled={!newText.trim() || isSubmitting || status === "unauthenticated"}
                  className="absolute right-2 top-2 p-2 bg-leaning-orange text-white rounded-full disabled:opacity-50 disabled:bg-slate-700 transition-colors"
                >
                  <Send size={18} />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
