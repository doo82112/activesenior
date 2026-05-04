"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { User, Bookmark, Settings, LogOut, Menu, X, ChevronRight, ShieldCheck } from "lucide-react";
import Link from "next/link";

import { ActionButton } from "./ActionButton";

export function UserMenu() {
  const { data: session } = useSession();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { name: "내 저장 목록", icon: Bookmark, href: "/mypage/bookmarks" },
    { name: "내 정보 관리", icon: Settings, href: "/mypage/profile" },
    ...(session?.user?.role === "admin" ? [{ name: "관리자 페이지", icon: ShieldCheck, href: "/admin" }] : []),
  ];

  return (
    <>
      {/* Floating Menu Trigger Button */}
      <div className="fixed bottom-10 right-8 z-[9000] transform-gpu">
        <ActionButton 
          icon={Menu} 
          onClick={() => setIsOpen(true)} 
          color="hover:bg-accent hover:text-black"
          label="메뉴"
        />
      </div>

      {/* Overlay & Slide-out Menu */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-[10001]"
            />

            {/* Menu Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 h-full w-[320px] bg-slate-950 border-l border-white/5 z-[10002] shadow-[-20px_0_40px_rgba(0,0,0,0.5)] flex flex-col"
            >
              {/* Header */}
              <div className="p-8 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white tracking-tighter">메뉴</h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-xl text-slate-500 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              {/* User Profile Info */}
              <div className="px-8 pb-8">
                {session ? (
                  <div className="p-5 rounded-3xl bg-gradient-to-br from-accent/20 to-purple-500/10 border border-accent/20">
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center text-accent">
                        <User size={24} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{session.user?.name}</p>
                        <p className="text-[10px] text-slate-500 font-mono">{session.user?.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-accent text-[10px] font-bold text-black uppercase">
                        {session.user?.role}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link href="/login" className="block p-5 rounded-3xl bg-white/5 border border-white/10 text-center hover:bg-white/10 transition-colors">
                    <p className="text-white font-bold mb-1">로그인이 필요합니다</p>
                    <p className="text-xs text-slate-500">더 많은 기능을 이용해 보세요</p>
                  </Link>
                )}
              </div>

              {/* Menu Links */}
              <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-white/5 transition-all group"
                  >
                    <item.icon className="text-slate-500 group-hover:text-accent transition-colors" size={20} />
                    <span className="font-medium text-slate-300 group-hover:text-white flex-1">{item.name}</span>
                    <ChevronRight className="text-slate-800 group-hover:text-slate-500 transition-colors" size={16} />
                  </Link>
                ))}

                {session && (
                  <>
                    <div className="mx-6 my-4 border-t border-white/5" />
                    <button
                      onClick={() => {
                        if (confirm("정말로 로그아웃 하시겠습니까?")) {
                          signOut();
                        }
                      }}
                      className="w-full flex items-center gap-4 px-6 py-4 rounded-2xl hover:bg-red-500/10 transition-all group"
                    >
                      <LogOut className="text-slate-500 group-hover:text-red-500 transition-colors" size={20} />
                      <span className="font-medium text-slate-300 group-hover:text-red-500 flex-1 text-left">로그아웃</span>
                    </button>
                  </>
                )}
              </nav>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
