"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ContentCard } from "./ContentCard";
import { LeaningGraph } from "./LeaningGraph";
import { ActionButton } from "./ActionButton";
import { FloatingAudioPlayer } from "./FloatingAudioPlayer";
import { UserMenu } from "./UserMenu";
import { ThumbsUp, ThumbsDown, Bookmark, MessageSquare, Plus, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { CommentPanel } from "./CommentPanel";

interface Content {
  id: number;
  title: string;
  category: string;
  contentType: string;
  bodyContent: string;
  mediaUrl?: string | null;
  audioUrl?: string | null;
  createdAt: string | Date;
  leaningTag: any;
  reactionCount: number;
  _count?: {
    reactions: number;
    comments: number;
  };
}

interface InfiniteSliderProps {
  initialContent: Content[];
}

export function InfiniteSlider({ initialContent }: InfiniteSliderProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [contents, setContents] = useState<Content[]>(initialContent);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [activeReaction, setActiveReaction] = useState<"like" | "dislike" | null>(null);
  const [isCommentOpen, setIsCommentOpen] = useState(false);
  const [isMoreOpen, setIsMoreOpen] = useState(false);
  const [bookmarkedIds, setBookmarkedIds] = useState<Set<number>>(new Set());
  const [mounted, setMounted] = useState(false);
  
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    setMounted(true);
    
    if (initialContent && initialContent.length > 0) {
      setContents(initialContent);
      
      const urlParams = new URLSearchParams(window.location.search);
      const urlId = urlParams.get("id");
      const savedId = sessionStorage.getItem("lastViewedId");

      let targetIndex = 0;
      if (urlId) {
        const idx = initialContent.findIndex(c => c.id === Number(urlId));
        if (idx !== -1) targetIndex = idx;
      } else if (savedId) {
        const idx = initialContent.findIndex(c => c.id === Number(savedId));
        if (idx !== -1) targetIndex = idx;
      }
      setCurrentIndex(targetIndex);
    }

    if (status === "authenticated") {
      fetch("/api/bookmarks")
        .then(res => res.json())
        .then(data => {
          if (Array.isArray(data)) {
            const ids = new Set<number>(data.map((b: any) => b.id));
            setBookmarkedIds(ids);
          }
        })
        .catch(err => console.error("Failed to fetch bookmarks:", err));
    }
  }, [initialContent, status]);

  const handleBookmark = async (contentId: number) => {
    if (status === "unauthenticated") {
      const message = encodeURIComponent("로그인이 필요한 서비스입니다.");
      router.push(`/login?message=${message}`);
      return;
    }

    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      });
      if (res.ok) {
        const data = await res.json();
        setBookmarkedIds(prev => {
          const next = new Set(prev);
          if (data.isBookmarked) next.add(contentId);
          else next.delete(contentId);
          return next;
        });
      }
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMoreContents = async () => {
    if (isLoadingMore || !hasMore || contents.length === 0) return;
    setIsLoadingMore(true);

    try {
      const oldestContent = contents.reduce((oldest, current) => {
        const parseDate = (d: any) => {
          if (typeof d === 'string') return Date.parse(d.replace(' ', 'T'));
          return new Date(d).getTime();
        };
        return parseDate(current.createdAt) < parseDate(oldest.createdAt) ? current : oldest;
      });

      let cursor = "";
      if (typeof oldestContent.createdAt === 'string') {
        cursor = oldestContent.createdAt;
      } else {
        try {
          cursor = new Date(oldestContent.createdAt as any).toISOString();
        } catch (e) {
          cursor = new Date().toISOString();
        }
      }

      const res = await fetch(`/api/feed?cursor=${cursor}`);
      if (res.ok) {
        const newContents = await res.json();
        if (newContents.length === 0) {
          setHasMore(false);
        } else {
          setContents(prev => [...prev, ...newContents]);
        }
      }
    } catch (err) {
      console.error("Failed to load more contents:", err);
    } finally {
      setIsLoadingMore(false);
    }
  };

  const paginate = (newDirection: number) => {
    setDirection(newDirection);
    setActiveReaction(null);
    const nextIndex = (currentIndex + newDirection + contents.length) % contents.length;
    
    if (newDirection > 0 && nextIndex >= contents.length - 10 && hasMore && !isLoadingMore) {
      fetchMoreContents();
    }
    
    setCurrentIndex(nextIndex);

    const nextContent = contents[nextIndex];
    if (nextContent) {
      sessionStorage.setItem("lastViewedId", nextContent.id.toString());
      if (window.location.search.includes("id=")) {
        window.history.replaceState(null, '', '/');
      }
    }
  };

  const handleReaction = async (contentId: number, type: "like" | "dislike") => {
    if (status === "unauthenticated") {
      const message = encodeURIComponent("로그인이 필요한 서비스입니다.");
      router.push(`/login?message=${message}`);
      return;
    }

    setActiveReaction(type);
    try {
      const res = await fetch("/api/reactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, type }),
      });

      if (!res.ok) throw new Error("반응 저장 실패");

      setContents(prev => prev.map(c => 
        c.id === contentId ? { ...c, reactionCount: c.reactionCount + 1 } : c
      ));

      setTimeout(() => paginate(1), 400);
    } catch (err) {
      console.error(err);
      setActiveReaction(null);
    }
  };

  if (!mounted) return null;

  const currentContent = contents[currentIndex] || initialContent[0];
  if (!currentContent) return <div className="h-full w-full bg-slate-950 flex items-center justify-center text-white">불러오는 중...</div>;

  return (
    <div className="relative h-[100dvh] w-full overflow-hidden bg-background">
      <LeaningGraph leaning={currentContent.leaningTag as any} reactionCount={currentContent.reactionCount} />

      <div className="h-full w-full relative">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={currentContent.id}
            custom={direction}
            variants={variants}
            initial="enter" animate="center" exit="exit"
            transition={{ x: { type: "spring", stiffness: 300, damping: 30 }, opacity: { duration: 0.2 } }}
            className="absolute inset-0 w-full h-full"
          >
            <ContentCard content={currentContent} />
          </motion.div>
        </AnimatePresence>

        {/* 사이드 클릭 내비게이션 (모든 컨텐츠 타입에 적용) */}
        <div className="absolute inset-y-0 left-0 w-12 sm:w-16 z-[8000] cursor-pointer" onClick={() => paginate(-1)} />
        <div className="absolute inset-y-0 right-0 w-12 sm:w-16 z-[8000] cursor-pointer" onClick={() => paginate(1)} />
      </div>

      <FloatingAudioPlayer audioUrl={currentContent.audioUrl} />
      <UserMenu />

      {/* Global Action Buttons */}
      <div className="fixed bottom-10 left-4 translate-x-0 min-[470px]:left-1/2 min-[470px]:-translate-x-1/2 flex items-center gap-2 min-[470px]:gap-4 min-[655px]:gap-2 min-[725px]:gap-6 z-[10000] transform-gpu pointer-events-none">
        <div className="flex items-center gap-2 min-[470px]:gap-4 min-[655px]:gap-2 min-[725px]:gap-6 pointer-events-auto">
          <ActionButton 
            icon={ChevronLeft} 
            color="bg-slate-800/80 text-white border border-slate-700/50" 
            onClick={() => paginate(-1)} 
            label="이전" 
          />
          
          {/* Desktop View */}
          <div className="hidden min-[655px]:flex items-center gap-2 min-[725px]:gap-6">
            <ActionButton 
              icon={ThumbsDown} color="hover:bg-leaning-blue" activeColor="bg-leaning-blue text-white shadow-[0_0_20px_rgba(59,130,246,0.6)]" 
              isActive={activeReaction === "dislike"} onClick={() => handleReaction(currentContent.id, "dislike")} label="싫어요" 
            />
            <ActionButton 
              icon={ThumbsUp} color="hover:bg-leaning-red" activeColor="bg-leaning-red text-white shadow-[0_0_20px_rgba(239,68,68,0.6)]" 
              isActive={activeReaction === "like"} onClick={() => handleReaction(currentContent.id, "like")} label="좋아요" 
            />
            <ActionButton 
              icon={Bookmark} color="hover:bg-leaning-orange" activeColor="bg-leaning-orange text-white" 
              isActive={bookmarkedIds.has(currentContent.id)} onClick={() => handleBookmark(currentContent.id)} label="저장" 
            />
            <ActionButton 
              icon={MessageSquare} color="hover:bg-slate-400" onClick={() => setIsCommentOpen(true)} 
              label="댓글" badgeCount={currentContent._count?.comments || 0} 
            />
          </div>

          {/* Mobile View Toggle */}
          <div className="flex min-[655px]:hidden items-center relative">
            <ActionButton 
              icon={isMoreOpen ? X : Plus} color="bg-slate-800/80 text-white border border-slate-700/50"
              isActive={isMoreOpen} activeColor="bg-accent text-black shadow-[0_0_20px_rgba(212,175,55,0.4)]"
              onClick={() => setIsMoreOpen(!isMoreOpen)} label={isMoreOpen ? "닫기" : "더보기"} 
            />
          </div>

          <ActionButton 
            icon={ChevronRight} color="bg-slate-800/80 text-white border border-slate-700/50" 
            onClick={() => paginate(1)} label="다음" 
          />
        </div>
      </div>

      {/* Mobile More Menu */}
      <AnimatePresence>
        {isMoreOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 20, scale: 0.8 }}
            className="fixed bottom-32 left-1/2 -translate-x-1/2 flex flex-row items-center gap-3 p-4 bg-slate-900/90 backdrop-blur-md rounded-[2rem] border border-white/10 shadow-2xl z-[10005] transform-gpu"
          >
            <ActionButton icon={ThumbsDown} color="bg-slate-800/50" isActive={activeReaction === "dislike"} onClick={() => { handleReaction(currentContent.id, "dislike"); setIsMoreOpen(false); }} label="싫어요" />
            <ActionButton icon={ThumbsUp} color="bg-slate-800/50" isActive={activeReaction === "like"} onClick={() => { handleReaction(currentContent.id, "like"); setIsMoreOpen(false); }} label="좋아요" />
            <ActionButton icon={Bookmark} color="bg-slate-800/50" isActive={bookmarkedIds.has(currentContent.id)} onClick={() => { handleBookmark(currentContent.id); setIsMoreOpen(false); }} label="저장" />
            <ActionButton icon={MessageSquare} color="bg-slate-800/50" onClick={() => { setIsCommentOpen(true); setIsMoreOpen(false); }} label="댓글" badgeCount={currentContent._count?.comments || 0} />
          </motion.div>
        )}
      </AnimatePresence>

      <CommentPanel isOpen={isCommentOpen} onClose={() => setIsCommentOpen(false)} contentId={currentContent.id} />
    </div>
  );
}

const variants = {
  enter: (direction: number) => ({ x: direction > 0 ? 1000 : -1000, opacity: 0 }),
  center: { zIndex: 1, x: 0, opacity: 1 },
  exit: (direction: number) => ({ zIndex: 0, x: direction < 0 ? 1000 : -1000, opacity: 0 }),
};
