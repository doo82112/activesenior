"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Shield, BarChart3, Activity, MessageSquare, ThumbsUp, Save, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Link from "next/link";

export default function UserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // Editable fields
  const [nickname, setNickname] = useState("");
  const [role, setRole] = useState("");
  const [red, setRed] = useState(0);
  const [blue, setBlue] = useState(0);
  const [orange, setOrange] = useState(0);

  useEffect(() => {
    async function fetchUser() {
      try {
        const res = await fetch(`/api/admin/users/${params.id}`);
        if (!res.ok) throw new Error("사용자 정보를 불러올 수 없습니다.");
        const data = await res.json();
        setUser(data);
        setNickname(data.nickname);
        setRole(data.role);
        setRed(data.leaningProfile?.red || 0);
        setBlue(data.leaningProfile?.blue || 0);
        setOrange(data.leaningProfile?.orange || 0);
      } catch (error) {
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    }
    if (params.id) fetchUser();
  }, [params.id]);

  const handleSave = async () => {
    if (red + blue + orange !== 100) {
      alert("성향 프로필의 합계는 100이어야 합니다.");
      return;
    }

    setIsSaving(true);
    try {
      const res = await fetch(`/api/admin/users/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname,
          role,
          leaningProfile: { red, blue, orange }
        })
      });

      if (res.ok) {
        alert("정보가 수정되었습니다.");
        router.refresh();
      } else {
        alert("수정 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error(error);
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center animate-pulse text-slate-500">불러오는 중...</div>;
  if (!user) return <div className="p-10 text-center text-red-500">사용자를 찾을 수 없습니다.</div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center gap-4">
        <Link href="/admin/users">
          <button className="p-2 hover:bg-white/5 rounded-xl text-slate-400 transition-colors">
            <ArrowLeft size={20} />
          </button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-white">사용자 상세 관리</h1>
          <p className="text-slate-400 mt-1">{user.email}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Profile & Settings */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-8 space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-accent">
                  <User size={20} />
                  기본 정보
                </h3>
                <Input 
                  label="닉네임" 
                  value={nickname} 
                  onChange={(e) => setNickname(e.target.value)} 
                />
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-400 ml-1">계정 역할</label>
                  <select 
                    value={role} 
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900/50 px-4 text-white focus:ring-2 focus:ring-accent outline-none"
                  >
                    <option value="user">일반 사용자 (USER)</option>
                    <option value="admin">관리자 (ADMIN)</option>
                  </select>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-lg font-semibold flex items-center gap-2 text-accent">
                  <BarChart3 size={20} />
                  성향 프로필 가중치 (%)
                </h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4">
                    <Input type="number" label="Red" value={red} onChange={(e) => setRed(Number(e.target.value))} min="0" max="100" />
                    <Input type="number" label="Blue" value={blue} onChange={(e) => setBlue(Number(e.target.value))} min="0" max="100" />
                    <Input type="number" label="Orange" value={orange} onChange={(e) => setOrange(Number(e.target.value))} min="0" max="100" />
                  </div>
                  <div className="pt-2">
                    <div className="h-4 w-full rounded-full overflow-hidden flex shadow-inner">
                      <div style={{ width: `${red}%` }} className="bg-leaning-red h-full transition-all duration-500" />
                      <div style={{ width: `${blue}%` }} className="bg-leaning-blue h-full transition-all duration-500" />
                      <div style={{ width: `${orange}%` }} className="bg-leaning-orange h-full transition-all duration-500" />
                    </div>
                    <p className={`text-xs mt-2 text-center ${red + blue + orange === 100 ? "text-slate-500" : "text-red-500 font-bold"}`}>
                      합계: {red + blue + orange}% (100% 필요)
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <Button onClick={handleSave} isLoading={isSaving} className="px-8 gap-2">
                <Save size={18} />
                변경사항 저장
              </Button>
            </div>
          </div>

          {/* Activity Section */}
          <div className="space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity size={24} className="text-accent" />
              최근 활동 내역
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Reactions */}
              <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-slate-300">
                  <ThumbsUp size={18} />
                  최근 반응 ({user.reactions.length})
                </h4>
                <div className="space-y-3">
                  {user.reactions.map((r: any) => (
                    <div key={r.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm">
                      <p className="text-white font-medium line-clamp-1">{r.content.title}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full ${r.type === 'like' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {r.type.toUpperCase()}
                        </span>
                        <span className="text-[10px] text-slate-500">{new Date(r.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                  {user.reactions.length === 0 && <p className="text-sm text-slate-600 text-center py-4">활동 기록이 없습니다.</p>}
                </div>
              </div>

              {/* Comments */}
              <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-4">
                <h4 className="font-semibold flex items-center gap-2 text-slate-300">
                  <MessageSquare size={18} />
                  최근 댓글 ({user.comments.length})
                </h4>
                <div className="space-y-3">
                  {user.comments.map((c: any) => (
                    <div key={c.id} className="p-3 rounded-xl bg-white/5 border border-white/5 text-sm group/comment">
                      <p className="text-slate-400 text-[10px] mb-1 truncate">{c.content.title}</p>
                      <p className="text-white line-clamp-2">{c.text}</p>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-[10px] text-slate-600">{new Date(c.createdAt).toLocaleDateString()}</span>
                        <div className="flex gap-2 opacity-0 group-hover/comment:opacity-100 transition-opacity">
                          <button 
                            onClick={async () => {
                              const newText = prompt("댓글 수정:", c.text);
                              if (newText && newText !== c.text) {
                                try {
                                  const res = await fetch(`/api/admin/comments/${c.id}`, {
                                    method: "PUT",
                                    headers: { "Content-Type": "application/json" },
                                    body: JSON.stringify({ text: newText })
                                  });
                                  if (res.ok) {
                                    alert("수정되었습니다.");
                                    window.location.reload();
                                  }
                                } catch (err) { console.error(err); }
                              }
                            }}
                            className="text-accent hover:underline text-[10px]"
                          >
                            수정
                          </button>
                          <button 
                            onClick={async () => {
                              if (confirm("이 댓글을 삭제하시겠습니까?")) {
                                try {
                                  const res = await fetch(`/api/admin/comments/${c.id}`, { method: "DELETE" });
                                  if (res.ok) {
                                    alert("삭제되었습니다.");
                                    window.location.reload();
                                  }
                                } catch (err) { console.error(err); }
                              }
                            }}
                            className="text-red-500 hover:underline text-[10px]"
                          >
                            삭제
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {user.comments.length === 0 && <p className="text-sm text-slate-600 text-center py-4">댓글 기록이 없습니다.</p>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Quick Stats */}
        <div className="space-y-6">
          <div className="bg-slate-900/30 border border-white/5 rounded-3xl p-6 space-y-6">
            <h3 className="font-bold text-white">요약</h3>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">가입일</span>
                <span className="text-white font-mono">{new Date(user.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">총 반응 수</span>
                <span className="text-white">{user.reactions.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">총 댓글 수</span>
                <span className="text-white">{user.comments.length}</span>
              </div>
            </div>
          </div>

          <div className="bg-accent/10 border border-accent/20 rounded-3xl p-6">
            <h4 className="font-bold text-accent mb-2">관리자 노트</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              사용자의 성향 프로필을 직접 수정하면 해당 사용자의 추천 컨텐츠 정렬에 즉시 반영됩니다. 
              부적절한 활동이 발견될 경우 역할을 변경하거나 모니터링하세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
