import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ContentListTable } from "@/components/admin/ContentListTable";

export default async function ContentListPage() {
  const contents = await prisma.content.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">컨텐츠 관리</h1>
          <p className="text-slate-400 mt-2">등록된 모든 컨텐츠를 확인하고 수정할 수 있습니다.</p>
        </div>
        <Link href="/admin/content/new">
          <Button className="gap-2 w-full sm:w-auto shadow-lg shadow-accent/20">
            <Plus size={18} />
            새 컨텐츠 등록
          </Button>
        </Link>
      </div>

      <ContentListTable initialContents={JSON.parse(JSON.stringify(contents))} />
    </div>
  );
}
