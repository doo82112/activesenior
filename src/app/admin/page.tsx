import { prisma } from "@/lib/prisma";
import { 
  FileText, 
  Users, 
  TrendingUp, 
  Clock,
  ExternalLink,
  Type as TypeIcon
} from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  // DB에서 실제 데이터 가져오기
  const [contentCount, userCount, recentContent] = await Promise.all([
    prisma.content.count(),
    prisma.user.count(),
    prisma.content.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
    }),
  ]);

  const stats = [
    { name: "전체 컨텐츠", value: contentCount.toString(), icon: FileText, color: "text-blue-500" },
    { name: "전체 회원", value: userCount.toString(), icon: Users, color: "text-green-500" },
    { name: "오늘의 반응", value: "0", icon: TrendingUp, color: "text-accent" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">대시보드 요약</h1>
        <p className="text-slate-400 mt-2">서비스의 전반적인 활동 현황입니다.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-slate-900/50 border border-white/5 p-6 rounded-3xl backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                <p className="text-3xl font-bold text-white mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                <stat.icon size={24} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Activity */}
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Clock size={20} className="text-accent" />
            최근 등록된 컨텐츠
          </h3>
          <Link href="/admin/content" className="text-sm text-accent hover:underline">
            전체 보기
          </Link>
        </div>
        
        <div className="divide-y divide-white/5">
          {recentContent.length > 0 ? (
            recentContent.map((content) => (
              <div key={content.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="p-2 rounded-lg bg-white/5 text-slate-400">
                    {content.contentType === "link" ? <ExternalLink size={18} /> : <TypeIcon size={18} />}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{content.title}</p>
                    <p className="text-xs text-slate-500">{new Date(content.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-medium">
                  {content.category}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-slate-500">
              아직 등록된 컨텐츠가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
