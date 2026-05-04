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
    <div className="relative w-full h-full bg-background flex flex-col pt-1">
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLink || isPdf || isYoutube ? (
          <div className="relative w-full h-full pt-10">

            <iframe 
              src={
                isPdf ? `${content.bodyContent}#toolbar=0&navpanes=0` : 
                (isYoutube || content.bodyContent.includes("youtube.com") || content.bodyContent.includes("youtu.be")) 
                  ? getYoutubeEmbedUrl(content.bodyContent) 
                  : content.bodyContent
              } 
              className="w-full h-full border-none bg-slate-900"
              title={content.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex flex-col">
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
