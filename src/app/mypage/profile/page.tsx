"use client";

import { useState, useEffect } from "react";
import { User, Shield, BarChart3, Lock, ArrowLeft, Save, ThumbsUp, MessageSquare, Bookmark } from "lucide-react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ProfilePage() {
  const [profile, setProfile] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Form states
  const [nickname, setNickname] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/user/profile");
        if (res.ok) {
          const data = await res.json();
          setProfile(data);
          setNickname(data.nickname);
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfile();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword && newPassword !== confirmPassword) {
      alert("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          currentPassword,
          newPassword
        })
      });

      const result = await res.json();
      if (res.ok) {
        alert("정보가 성공적으로 수정되었습니다.");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        // Refresh profile to update nickname in session if possible (or just local state)
      } else {
        alert(result.error || "수정 중 에러가 발생했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("수정 중 에러가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-slate-500">불러오는 중...</div>;

  if (!profile) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-slate-900/40 border border-white/5 rounded-[40px] p-10 text-center space-y-6">
          <div className="w-20 h-20 bg-white/5 rounded-[40px] flex items-center justify-center mx-auto text-slate-700">
            <Lock size={40} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white">로그인이 필요합니다</h2>
            <p className="text-slate-500 mt-2">회원 정보 관리 기능을 이용하시려면 로그인해 주세요.</p>
          </div>
          <Link href="/login" className="block">
            <Button className="w-full h-14 rounded-2xl font-bold text-base">로그인하러 가기</Button>
          </Link>
          <Link href="/" className="block text-slate-500 hover:text-white text-sm transition-colors">
            메인 화면으로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white p-6 md:p-12">
      <div className="max-w-4xl mx-auto space-y-12">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Link href="/">
            <button className="p-3 hover:bg-white/5 rounded-2xl text-slate-400 transition-colors border border-white/5">
              <ArrowLeft size={24} />
            </button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tighter">내 정보 관리</h1>
            <p className="text-slate-500 text-sm mt-1">계정 정보와 활동 통계를 관리합니다.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Stats Cards */}
          <div className="md:col-span-1 space-y-4">
            <div className="p-6 rounded-[32px] bg-slate-900/40 border border-white/5 space-y-6">
              <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest px-1">활동 요약</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-300">
                    <ThumbsUp size={16} />
                    <span className="text-sm">반응</span>
                  </div>
                  <span className="font-mono text-white">{profile._count?.reactions || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-300">
                    <MessageSquare size={16} />
                    <span className="text-sm">댓글</span>
                  </div>
                  <span className="font-mono text-white">{profile._count?.comments || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 text-slate-300">
                    <Bookmark size={16} />
                    <span className="text-sm">저장</span>
                  </div>
                  <span className="font-mono text-white">{profile.bookmarkCount || 0}</span>
                </div>
              </div>
            </div>

            <div className="p-6 rounded-[32px] bg-accent/5 border border-accent/10 space-y-4">
              <h3 className="font-bold text-accent text-xs uppercase tracking-widest px-1">나의 현재 성향</h3>
              <div className="h-2 w-full bg-black/40 rounded-full overflow-hidden flex">
                <div style={{ width: `${profile.leaningProfile?.red || 33.3}%` }} className="bg-leaning-red h-full" />
                <div style={{ width: `${profile.leaningProfile?.blue || 33.3}%` }} className="bg-leaning-blue h-full" />
                <div style={{ width: `${profile.leaningProfile?.orange || 33.4}%` }} className="bg-leaning-orange h-full" />
              </div>
              <p className="text-[10px] text-slate-500 text-center">활동 데이터가 쌓일수록 더 정확해집니다.</p>
            </div>
          </div>

          {/* Edit Form */}
          <div className="md:col-span-2">
            <form onSubmit={handleUpdateProfile} className="bg-slate-900/40 border border-white/5 rounded-[40px] p-8 md:p-10 space-y-10">
              {/* Basic Info Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <User size={20} className="text-accent" />
                  기본 정보
                </h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs text-slate-500 ml-1">이메일 (변경 불가)</label>
                    <div className="w-full h-14 rounded-2xl bg-white/5 border border-white/5 flex items-center px-5 text-slate-400 font-mono text-sm">
                      {profile.email}
                    </div>
                  </div>
                  <Input 
                    label="닉네임" 
                    value={nickname} 
                    onChange={(e) => setNickname(e.target.value)} 
                    placeholder="사용하실 닉네임을 입력하세요"
                  />
                </div>
              </div>

              {/* Password Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-bold flex items-center gap-2">
                  <Lock size={20} className="text-accent" />
                  비밀번호 변경
                </h3>
                <div className="space-y-4">
                  <Input 
                    type="password" 
                    label="현재 비밀번호" 
                    value={currentPassword} 
                    onChange={(e) => setCurrentPassword(e.target.value)} 
                    placeholder="정보 수정을 위해 현재 비밀번호를 입력하세요"
                  />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Input 
                      type="password" 
                      label="새 비밀번호" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      placeholder="최소 6자 이상"
                    />
                    <Input 
                      type="password" 
                      label="새 비밀번호 확인" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)} 
                      placeholder="비밀번호를 재입력하세요"
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <Button type="submit" isLoading={isSaving} className="px-10 h-14 rounded-2xl gap-2 font-bold text-base">
                  <Save size={20} />
                  정보 수정 완료
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
