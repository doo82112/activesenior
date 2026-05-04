"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Image as ImageIcon, Type, BarChart3 } from "lucide-react";

interface ContentFormProps {
  initialData?: any;
  onSubmit: (data: any) => Promise<void>;
  isLoading: boolean;
  submitLabel: string;
  title: string;
  description: string;
}

export function ContentForm({ 
  initialData, 
  onSubmit, 
  isLoading, 
  submitLabel,
  title: pageTitle,
  description
}: ContentFormProps) {
  const [title, setTitle] = useState(initialData?.title || "");
  const [category, setCategory] = useState(initialData?.category || "news");
  const [contentType, setContentType] = useState(initialData?.contentType || "html");
  const [mediaUrl, setMediaUrl] = useState(initialData?.mediaUrl || "");
  const [audioUrl, setAudioUrl] = useState(initialData?.audioUrl || "");
  const [bodyContent, setBodyContent] = useState(initialData?.bodyContent || "");
  
  const [red, setRed] = useState(initialData?.leaningTag?.red || 33);
  const [blue, setBlue] = useState(initialData?.leaningTag?.blue || 33);
  const [orange, setOrange] = useState(initialData?.leaningTag?.orange || 34);

  const [error, setError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || "");
      setCategory(initialData.category || "news");
      setContentType(initialData.contentType || "html");
      setMediaUrl(initialData.mediaUrl || "");
      setAudioUrl(initialData.audioUrl || "");
      setBodyContent(initialData.bodyContent || "");
      setRed(initialData.leaningTag?.red || 33);
      setBlue(initialData.leaningTag?.blue || 33);
      setOrange(initialData.leaningTag?.orange || 34);
    }
  }, [initialData]);

  const handleExtract = async () => {
    if (!bodyContent || !bodyContent.startsWith("http")) {
      setError("본문 내용 칸에 유효한 URL을 입력한 후 추출 버튼을 눌러주세요.");
      return;
    }

    setIsExtracting(true);
    setError("");
    try {
      const res = await fetch(`/api/extract?url=${encodeURIComponent(bodyContent)}`);
      if (!res.ok) throw new Error("본문 추출에 실패했습니다.");
      
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // 성공 시 제목과 본문 자동 입력
      if (data.title) setTitle(data.title);
      if (data.content) {
        setBodyContent(data.content);
        setContentType("html"); // 추출 후에는 HTML 모드로 전환
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (red + blue + orange !== 100) {
      setError("성향 분석 점수의 합계는 반드시 100이어야 합니다.");
      return;
    }

    try {
      await onSubmit({
        title,
        category,
        contentType,
        bodyContent,
        mediaUrl,
        audioUrl,
        leaningTag: { red, blue, orange },
      });
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-white">{pageTitle}</h1>
        <p className="text-slate-400 mt-2">{description}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-6 bg-slate-900/30 p-6 rounded-3xl border border-white/5">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-accent">
              <Type size={20} />
              기본 정보
            </h3>
            
            <Input
              label="컨텐츠 제목"
              placeholder="제목을 입력하세요"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">카테고리</label>
                <select
                  className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900/50 px-4 text-white focus:ring-2 focus:ring-accent outline-none transition-all"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                >
                  <option value="news">뉴스</option>
                  <option value="info">정보</option>
                  <option value="fun">재미</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-400 ml-1">컨텐츠 타입</label>
                <select
                  className="w-full h-12 rounded-xl border border-slate-800 bg-slate-900/50 px-4 text-white focus:ring-2 focus:ring-accent outline-none transition-all"
                  value={contentType}
                  onChange={(e) => setContentType(e.target.value)}
                >
                  <option value="html">직접 작성 (HTML)</option>
                  <option value="link">외부 링크 (URL)</option>
                  <option value="pdf">PDF 문서 (URL)</option>
                  <option value="youtube">YouTube 영상</option>
                </select>
              </div>
            </div>

            <Input
              label="미디어 URL (대표 이미지)"
              placeholder="https://..."
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
            />

            <div className="space-y-3">
              <Input
                label="오디오/팟캐스트 URL (MP3 등)"
                placeholder="https://.../audio.mp3"
                value={audioUrl}
                onChange={(e) => setAudioUrl(e.target.value)}
              />
              {audioUrl && (
                <div className="mt-2 p-3 bg-slate-950/50 border border-slate-800 rounded-xl">
                  <p className="text-xs text-slate-400 mb-2 ml-1">미리듣기 테스트</p>
                  <audio controls src={audioUrl} className="w-full h-10 outline-none" />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6 bg-slate-900/30 p-6 rounded-3xl border border-white/5">
            <h3 className="text-lg font-semibold flex items-center gap-2 text-accent">
              <BarChart3 size={20} />
              성향 분석 가중치 (%)
            </h3>
            
            <div className="space-y-4">
              <Input
                type="number"
                label="빨강 (보수/강함 등)"
                value={red}
                onChange={(e) => setRed(Number(e.target.value))}
                min="0"
                max="100"
              />
              <Input
                type="number"
                label="파랑 (진보/유연 등)"
                value={blue}
                onChange={(e) => setBlue(Number(e.target.value))}
                min="0"
                max="100"
              />
              <Input
                type="number"
                label="노랑 (중립/화합 등)"
                value={orange}
                onChange={(e) => setOrange(Number(e.target.value))}
                min="0"
                max="100"
              />
              
              <div className="pt-2">
                <div className="h-4 w-full rounded-full overflow-hidden flex">
                  <div style={{ width: `${red}%` }} className="bg-leaning-red h-full" />
                  <div style={{ width: `${blue}%` }} className="bg-leaning-blue h-full" />
                  <div style={{ width: `${orange}%` }} className="bg-leaning-orange h-full" />
                </div>
                <p className="text-xs text-slate-500 mt-2 text-center">
                  합계: {red + blue + orange}% (반드시 100%여야 함)
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/30 p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex justify-between items-end">
            <label className="text-sm font-medium text-slate-400 ml-1">
              {contentType === "html" ? "본문 내용 (HTML 지원)" : 
               contentType === "pdf" ? "PDF 문서 링크 (URL)" : 
               contentType === "youtube" ? "YouTube 영상 링크 (URL)" : "외부 페이지 링크 (URL)"}
            </label>
            {contentType === "link" && (
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs border-accent text-accent hover:bg-accent hover:text-black"
                onClick={handleExtract}
                isLoading={isExtracting}
              >
                본문 추출하기
              </Button>
            )}
          </div>
          <textarea
            className={`w-full ${contentType === "html" ? "min-h-[300px]" : "min-h-[80px]"} rounded-xl border border-slate-800 bg-slate-900/50 p-4 text-white focus:ring-2 focus:ring-accent outline-none transition-all font-mono text-sm`}
            placeholder={contentType === "html" ? "<p>컨텐츠 내용을 입력하세요...</p>" : 
                         contentType === "pdf" ? "https://example.com/document.pdf" : 
                         contentType === "youtube" ? "https://www.youtube.com/watch?v=..." : "https://example.com/article/123"}
            value={bodyContent}
            onChange={(e) => setBodyContent(e.target.value)}
            required
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            취소
          </Button>
          <Button type="submit" className="px-10 gap-2" isLoading={isLoading}>
            <Save size={18} />
            {submitLabel}
          </Button>
        </div>
      </form>
    </div>
  );
}
