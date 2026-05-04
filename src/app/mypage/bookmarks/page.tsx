"use client";

import { useState, useEffect } from "react";
import { Bookmark, ArrowLeft, Trash2, ExternalLink, PlayCircle, FileText } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

export default function BookmarkPage() {
  const [bookmarks, setBookmarks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarks() {
      try {
        const res = await fetch("/api/bookmarks");
        if (res.ok) {
          const data = await res.json();
          setBookmarks(data);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchBookmarks();
  }, []);

  const handleRemove = async (contentId: number) => {
    try {
      const res = await fetch("/api/bookmarks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      });
      if (res.ok) {
        setBookmarks(prev => prev.filter(b => b.id !== contentId));
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-slate-500">불러오는 중...</div>;

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-6xl mx-auto space-y-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/">
              <button className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 transition-colors border border-white/5">
                <ArrowLeft size={24} />
              </button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold tracking-tighter">내 저장 목록</h1>
              <p className="text-slate-500 text-sm mt-1">관심 있는 컨텐츠를 한곳에 모았습니다.</p>
            </div>
          </div>
          <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-accent/10 border border-accent/20 rounded-2xl text-accent text-sm font-bold">
            <Bookmark size={16} />
            {bookmarks.length}개 저장됨
          </div>
        </div>

        {/* List */}
        {bookmarks.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {bookmarks.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="group relative bg-slate-900/40 border border-white/5 rounded-[32px] overflow-hidden hover:border-accent/30 transition-all flex flex-col h-full"
                >
                  {/* Category Badge */}
                  <div className="absolute top-4 left-4 z-10 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md border border-white/10 text-[10px] font-bold uppercase tracking-wider text-accent">
                    {item.category}
                  </div>

                  <Link href={`/?id=${item.id}`} className="block flex-1 flex flex-col">
                    {/* Thumbnail / Icon placeholder */}
                    <div className="aspect-video bg-slate-800/50 flex items-center justify-center text-slate-700">
                      {item.contentType === 'link' ? <ExternalLink size={48} /> : <FileText size={48} />}
                    </div>

                    <div className="p-6 flex flex-col flex-1">
                      <h3 className="text-lg font-bold line-clamp-2 mb-2 group-hover:text-accent transition-colors">
                        {item.title}
                      </h3>
                    </div>
                  </Link>
                    
                  <div className="px-6 pb-6 pt-0 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleRemove(item.id)}
                        className="p-2 hover:bg-red-500/10 rounded-xl text-slate-600 hover:text-red-500 transition-colors"
                        title="삭제"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="py-32 text-center space-y-6">
            <div className="w-20 h-20 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto text-slate-700">
              <Bookmark size={40} />
            </div>
            <div>
              <p className="text-xl font-bold text-slate-400">저장된 컨텐츠가 없습니다.</p>
              <p className="text-slate-600 mt-2">메인 피드에서 관심 있는 컨텐츠를 저장해 보세요.</p>
            </div>
            <Link href="/">
              <button className="mt-4 px-8 py-4 bg-accent text-black font-bold rounded-2xl hover:scale-105 transition-transform">
                컨텐츠 보러가기
              </button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
