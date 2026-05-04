"use client";

import { useState } from "react";
import { 
  ExternalLink, 
  Type as TypeIcon,
  Search,
  Trash2,
  Edit,
  Youtube,
  FileText
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Content {
  id: number;
  title: string;
  category: string;
  contentType: string;
  bodyContent: string;
  createdAt: string;
}

export function ContentListTable({ initialContents }: { initialContents: any[] }) {
  const [contents, setContents] = useState<Content[]>(initialContents);
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const router = useRouter();

  const handleDelete = async (id: number) => {
    if (!confirm("정말로 이 컨텐츠를 삭제하시겠습니까?")) return;

    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setContents(contents.filter(c => c.id !== id));
        router.refresh();
      } else {
        alert("삭제 중 오류가 발생했습니다.");
      }
    } catch (err) {
      console.error(err);
      alert("삭제 중 오류가 발생했습니다.");
    }
  };

  const filteredContents = contents.filter(content => {
    const matchesSearch = content.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === "all" || content.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Filters/Search */}
      <div className="flex flex-col md:flex-row items-center gap-4 bg-slate-900/30 p-4 rounded-2xl border border-white/5">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
          <input 
            type="text" 
            placeholder="제목 검색..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-950/50 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>
        <select 
          className="w-full md:w-48 bg-slate-950/50 border border-slate-800 rounded-xl py-2 px-4 text-sm text-white outline-none focus:ring-2 focus:ring-accent transition-all cursor-pointer"
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
        >
          <option value="all">모든 카테고리</option>
          <option value="news">뉴스</option>
          <option value="info">정보</option>
          <option value="fun">재미</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-slate-900/50 border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/5 text-slate-400 text-sm">
                <th className="px-6 py-4 font-semibold">형식</th>
                <th className="px-6 py-4 font-semibold">제목</th>
                <th className="px-6 py-4 font-semibold">카테고리</th>
                <th className="px-6 py-4 font-semibold">등록일</th>
                <th className="px-6 py-4 font-semibold text-right">관리</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredContents.length > 0 ? (
                filteredContents.map((content) => (
                  <tr key={content.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="p-2 rounded-lg bg-white/5 text-slate-400 inline-flex group-hover:text-accent transition-colors">
                        {content.contentType === "link" ? <ExternalLink size={16} /> : 
                         content.contentType === "youtube" ? <Youtube size={16} className="text-red-500" /> :
                         content.contentType === "pdf" ? <FileText size={16} className="text-orange-400" /> :
                         <TypeIcon size={16} />}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-sm font-medium text-white truncate max-w-[200px] md:max-w-xs">{content.title}</p>
                      {content.contentType === "link" && (
                        <p className="text-xs text-slate-500 truncate max-w-[200px] md:max-w-xs mt-1">{content.bodyContent}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-md bg-accent/10 text-accent text-[10px] font-bold uppercase tracking-wider">
                        {content.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {new Date(content.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
                        <Link href={`/admin/content/edit/${content.id}`}>
                          <button className="p-2 hover:bg-accent/20 rounded-lg text-accent transition-colors" title="수정">
                            <Edit size={16} />
                          </button>
                        </Link>
                        <button 
                          onClick={() => handleDelete(content.id)}
                          className="p-2 hover:bg-red-500/20 rounded-lg text-red-500 transition-colors" 
                          title="삭제"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                    {search ? "검색 결과가 없습니다." : "등록된 컨텐츠가 없습니다."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
