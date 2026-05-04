"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ContentForm } from "@/components/admin/ContentForm";

export default function NewContentPage() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (data: any) => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "등록에 실패했습니다.");
      }

      router.push("/admin/content?message=컨텐츠가 등록되었습니다.");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ContentForm
      title="새 컨텐츠 등록"
      description="뉴스, 정보, 재미 컨텐츠를 시스템에 추가합니다."
      submitLabel="컨텐츠 등록하기"
      onSubmit={handleSubmit}
      isLoading={isLoading}
    />
  );
}
