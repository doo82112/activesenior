"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ContentCardProps {
  content: {
    id: number;
    title: string;
    bodyContent: string;
    mediaUrl?: string | null;
    contentType: string;
  };
}

export function ContentCard({ content }: ContentCardProps) {
  const [isMobile, setIsMobile] = useState(false);
  const isLink = content.contentType === "link";
  const isPdf = content.contentType === "pdf";
  const isYoutube = content.contentType === "youtube";

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // 유튜브 URL을 임베드용으로 변환하는 헬퍼 함수
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1&mute=1&playsinline=1`;
    }
    return url;
  };

  return (
    <div className="relative w-full h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className={`flex-1 ${((isLink || isYoutube) || (isPdf && !isMobile)) ? 'overflow-hidden' : 'overflow-y-auto custom-scrollbar'} overflow-x-hidden`}>
        
        {/* [모바일 PDF] 표지 스타일 */}
        {isPdf && isMobile ? (
          <div className="relative w-full h-full flex flex-col items-center justify-center p-6 text-center">
            {content.mediaUrl && (
              <div className="absolute inset-0 z-0">
                <img src={content.mediaUrl} alt="" className="w-full h-full object-cover opacity-20 blur-sm" />
                <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background" />
              </div>
            )}
            <div className="relative z-10 space-y-8 max-w-md">
              <div className="space-y-4">
                <span className="inline-block px-4 py-1 rounded-full bg-accent/20 text-accent text-sm font-bold tracking-wider">
                  PDF DOCUMENT
                </span>
                <h2 className="text-4xl md:text-5xl font-extrabold text-white leading-tight">{content.title}</h2>
                <p className="text-slate-400 text-lg">본 문서는 PDF 형식으로 제공됩니다.<br/>아래 버튼을 눌러 전체 내용을 확인하세요.</p>
              </div>
              <div className="pt-4">
                <Button 
                  onClick={() => window.location.href = content.bodyContent}
                  size="lg"
                  className="w-full sm:w-auto px-12 h-16 text-xl rounded-2xl"
                >
                  문서 전체 읽기
                </Button>
              </div>
            </div>
          </div>
        ) : (isLink || isPdf || isYoutube) ? (
          /* [PC PDF / 링크 / 유튜브] iframe 스타일 */
          <div className="relative w-full h-full pt-10 overflow-hidden flex flex-col">
            {!isPdf && (
              <div className="absolute top-2 right-4 z-[9000]">
                <a href={content.bodyContent} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-full text-xs text-slate-200">
                  <span>원본 보기</span>
                  <Plus size={12} className="rotate-45" />
                </a>
              </div>
            )}
            <div className="flex-1 w-full overflow-hidden">
              <iframe 
                src={isYoutube ? getYoutubeEmbedUrl(content.bodyContent) : content.bodyContent} 
                className="w-full h-full border-none bg-slate-900"
                title={content.title}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        ) : (
          /* [일반 HTML 컨텐츠] */
          <div className="flex flex-col min-h-full">
            {content.mediaUrl && (
              <div className="w-full aspect-video bg-slate-900 overflow-hidden">
                <img src={content.mediaUrl} alt={content.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{content.title}</h2>
              <div className="text-slate-300 text-lg leading-relaxed space-y-4 article-content" dangerouslySetInnerHTML={{ __html: content.bodyContent }} />
            </div>
            <div className="h-40" />
          </div>
        )}
      </div>
      
      <style jsx global>{`
        .article-content img { max-width: 100%; height: auto; border-radius: 1rem; margin: 2rem 0; }
        .article-content p { margin-bottom: 1.5rem; }
      `}</style>
    </div>
  );
}
