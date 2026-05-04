"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ContentForm } from "@/components/admin/ContentForm";

export default function EditContentPage() {
  const [initialData, setInitialData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const router = useRouter();
  const params = useParams();
  const id = params.id;

  useEffect(() => {
    async function fetchContent() {
      try {
        const res = await fetch(`/api/admin/content/${id}`);
        if (!res.ok) throw new Error("컨텐츠를 불러올 수 없습니다.");
        const data = await res.json();
        setInitialData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    if (id) fetchContent();
  }, [id]);

  const handleSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/admin/content/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) {
        const result = await res.json();
        throw new Error(result.error || "수정에 실패했습니다.");
      }

      router.push("/admin/content?message=컨텐츠가 수정되었습니다.");
      router.refresh();
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-8 text-center bg-red-500/10 rounded-3xl border border-red-500/20 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <ContentForm
      title="컨텐츠 수정"
      description="등록된 컨텐츠의 정보를 수정합니다."
      submitLabel="수정 완료"
      initialData={initialData}
      onSubmit={handleSubmit}
      isLoading={isSubmitting}
    />
  );
}
