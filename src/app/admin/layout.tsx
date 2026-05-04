"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  FilePlus, 
  Settings, 
  Users, 
  LogOut,
  ChevronRight,
  List
} from "lucide-react";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "loading") return;
    if (!session || (session.user as any).role !== "admin") {
      router.push("/login?message=관리자 권한이 필요합니다.");
    }
  }, [session, status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  const menuItems = [
    { name: "대시보드", icon: LayoutDashboard, href: "/admin" },
    { name: "컨텐츠 관리", icon: List, href: "/admin/content" },
    { name: "컨텐츠 등록", icon: FilePlus, href: "/admin/content/new" },
    { name: "사용자 관리", icon: Users, href: "/admin/users" },
    { name: "설정", icon: Settings, href: "/admin/settings" },
  ];

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      {/* Sidebar */}
      <aside className="w-64 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl hidden md:flex flex-col">
        <div className="p-6">
          <Link href="/" className="text-2xl font-bold text-accent tracking-tighter">
            ACTIVESENIOR
          </Link>
        </div>

        <nav className="flex-1 px-4 space-y-2">
          {menuItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors group"
            >
              <item.icon className="text-slate-400 group-hover:text-accent transition-colors" size={20} />
              <span className="font-medium text-slate-300 group-hover:text-white">{item.name}</span>
              <ChevronRight className="ml-auto text-slate-600 group-hover:text-white" size={16} />
            </Link>
          ))}
        </nav>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5">
            <div className="h-10 w-10 rounded-full bg-accent/20 flex items-center justify-center text-accent font-bold">
              {session.user?.name?.[0]}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold truncate">{session.user?.name}</p>
              <p className="text-xs text-slate-500 truncate">관리자</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b border-white/5 flex items-center justify-between px-8 bg-background/50 backdrop-blur-md z-10">
          <h2 className="text-lg font-semibold">관리 대시보드</h2>
          <Button variant="ghost" className="text-slate-400 gap-2">
            <LogOut size={18} />
            로그아웃
          </Button>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}

// Helper Button component for layout
function Button({ children, className, variant, ...props }: any) {
  const variants: any = {
    ghost: "hover:bg-white/5",
  };
  return (
    <button className={`px-4 py-2 rounded-lg transition-colors ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
