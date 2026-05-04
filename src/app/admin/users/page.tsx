import { prisma } from "@/lib/prisma";
import { Users as UsersIcon, Shield, User as UserIcon, Activity, MessageSquare, ThumbsUp } from "lucide-react";
import Link from "next/link";

export default async function UserManagementPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          reactions: true,
          comments: true,
        }
      }
    }
  });

  const getLeaningColor = (profile: any) => {
    if (!profile) return "bg-slate-500";
    const { red, blue, orange } = profile;
    if (red > blue && red > orange) return "bg-leaning-red";
    if (blue > red && blue > orange) return "bg-leaning-blue";
    if (orange > red && orange > blue) return "bg-leaning-orange";
    return "bg-slate-500";
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-3">
          <UsersIcon className="text-accent" />
          사용자 관리
        </h1>
        <p className="text-slate-400 mt-2">가입된 사용자 정보와 활동 및 성향 리스트입니다.</p>
      </div>

      <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-slate-400 text-sm">
                <th className="px-6 py-4 font-semibold">사용자</th>
                <th className="px-6 py-4 font-semibold">역할</th>
                <th className="px-6 py-4 font-semibold">성향 프로필</th>
                <th className="px-6 py-4 font-semibold">활동 지표</th>
                <th className="px-6 py-4 font-semibold">가입일</th>
                <th className="px-6 py-4 font-semibold text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {users.map((user) => (
                <tr key={user.id} className="hover:bg-white/5 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center text-accent">
                        <UserIcon size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{user.nickname}</p>
                        <p className="text-xs text-slate-500">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      user.role === "admin" ? "bg-red-500/10 text-red-500" : "bg-emerald-500/10 text-emerald-500"
                    }`}>
                      {user.role === "admin" ? <Shield size={10} /> : null}
                      {user.role}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full shadow-[0_0_10px_rgba(255,255,255,0.1)] ${getLeaningColor(user.leaningProfile)}`} />
                      <div className="flex-1 max-w-[120px] h-1.5 bg-white/5 rounded-full overflow-hidden flex">
                        <div style={{ width: `${(user.leaningProfile as any)?.red || 0}%` }} className="bg-leaning-red h-full" />
                        <div style={{ width: `${(user.leaningProfile as any)?.blue || 0}%` }} className="bg-leaning-blue h-full" />
                        <div style={{ width: `${(user.leaningProfile as any)?.orange || 0}%` }} className="bg-leaning-orange h-full" />
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-4 text-slate-400">
                      <div className="flex items-center gap-1.5" title="반응">
                        <ThumbsUp size={14} className="text-slate-500" />
                        <span className="text-xs font-medium">{user._count.reactions}</span>
                      </div>
                      <div className="flex items-center gap-1.5" title="댓글">
                        <MessageSquare size={14} className="text-slate-500" />
                        <span className="text-xs font-medium">{user._count.comments}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-500 font-mono">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link href={`/admin/users/${user.id}`}>
                      <button className="p-2 hover:bg-accent/20 rounded-lg text-accent transition-colors opacity-0 group-hover:opacity-100">
                        <Activity size={18} />
                      </button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
