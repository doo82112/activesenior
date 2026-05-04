"use client";

interface ContentCardProps {
  content: {
    id: number;
    title: string;
    category: string;
    contentType: string;
    bodyContent: string;
    mediaUrl?: string | null;
  };
}

export function ContentCard({ content }: ContentCardProps) {
  const isLink = content.contentType === "link";
  const isPdf = content.contentType === "pdf";
  const isYoutube = content.contentType === "youtube";

  // 유튜브 URL을 임베드용으로 변환하는 헬퍼 함수 (Shorts 지원 포함)
  const getYoutubeEmbedUrl = (url: string) => {
    if (!url) return "";
    // shorts/ 패턴을 포함하도록 정규식 보강
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=|shorts\/)([^#\&\?]*).*/;
    const match = url.match(regExp);
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}?autoplay=1`;
    }
    return url;
  };

  return (
    <div className="relative w-full h-[100dvh] bg-background flex flex-col overflow-hidden">
      <div className="flex-1 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {isLink || isPdf || isYoutube ? (
          <div className="relative w-full h-full pt-10 overflow-hidden">
            {/* 원본 보기 버튼 (PDF 및 외부 링크용) */}
            <div className="absolute top-2 right-4 z-[9000]">
              <a 
                href={content.bodyContent} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800/80 backdrop-blur-sm border border-white/10 rounded-full text-xs text-slate-200 hover:bg-accent hover:text-black transition-all"
              >
                <span>원본 보기</span>
                <Plus size={12} className="rotate-45" />
              </a>
            </div>
            <iframe 
              src={
                isPdf ? `https://docs.google.com/viewer?url=${encodeURIComponent(content.bodyContent)}&embedded=true` : 
                (isYoutube || content.bodyContent.includes("youtube.com") || content.bodyContent.includes("youtu.be")) 
                  ? getYoutubeEmbedUrl(content.bodyContent) 
                  : content.bodyContent
              } 
              className="w-full h-full border-none bg-slate-900 overflow-hidden"
              style={{ minHeight: 'calc(100dvh - 40px)' }}
              title={content.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex flex-col min-h-full">
            {content.mediaUrl && (
              <div className="w-full aspect-video bg-slate-900 overflow-hidden">
                <img src={content.mediaUrl} alt={content.title} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-extrabold text-white leading-tight">{content.title}</h2>
              <div 
                className="text-slate-300 text-lg leading-relaxed space-y-4 article-content"
                dangerouslySetInnerHTML={{ __html: content.bodyContent }}
              />
            </div>
            <div className="h-40" />
          </div>
        )}
      </div>

      <style jsx global>{`
        .article-content img {
          max-width: 100%;
          height: auto;
          border-radius: 1rem;
          margin: 2rem 0;
          box-shadow: 0 10px 30px rgba(0,0,0,0.3);
        }
        .article-content p {
          margin-bottom: 1.5rem;
          line-height: 1.8;
        }
        .article-content h1, .article-content h2, .article-content h3 {
          color: white;
          font-weight: 800;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        .article-content h1 { font-size: 1.875rem; }
        .article-content h2 { font-size: 1.5rem; }
        .article-content a {
          color: #d4af37;
          text-decoration: underline;
        }
        .article-content ul, .article-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1.5rem;
          list-style-type: disc;
        }
      `}</style>
    </div>
  );
}
