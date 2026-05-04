"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Play, Pause, Music } from "lucide-react";

interface FloatingAudioPlayerProps {
  audioUrl?: string | null;
}

export function FloatingAudioPlayer({ audioUrl }: FloatingAudioPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isReady, setIsReady] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isLongPressTriggered = useRef(false);
  const globalAutoplayRef = useRef(true);
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 컨텐츠(audioUrl)가 변경되면 초기화 및 자동 재생 시도
  useEffect(() => {
    // 이전 타이머가 있다면 즉시 취소 (빠르게 넘길 경우 이전 오디오 재생 방지)
    if (autoplayTimerRef.current) {
      clearTimeout(autoplayTimerRef.current);
      autoplayTimerRef.current = null;
    }

    setIsPlaying(false);
    setProgress(0);
    setIsExpanded(false);
    setIsReady(false);
    
    if (audioUrl && audioRef.current) {
      audioRef.current.load();
      
      // 사용자가 이전에 수동으로 멈춘 상태가 아니라면 1.5초 지연 재생
      if (globalAutoplayRef.current) {
        autoplayTimerRef.current = setTimeout(() => {
          if (audioRef.current) {
            audioRef.current.play().then(() => {
              setIsPlaying(true);
            }).catch((e) => {
              console.log("Autoplay blocked or waiting for user interaction.", e);
              setIsPlaying(false);
            });
          }
        }, 1500);
      }
    }
  }, [audioUrl]);

  // 외부 클릭 감지하여 축소
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (isExpanded && containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsExpanded(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isExpanded]);

  if (!audioUrl) return null;

  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      globalAutoplayRef.current = false; // 사용자 의도로 일시정지 (이후 컨텐츠부터 자동재생 꺼짐)
    } else {
      audioRef.current.play();
      globalAutoplayRef.current = true;  // 사용자 의도로 재생 (이후 컨텐츠부터 자동재생 켜짐)
    }
    setIsPlaying(!isPlaying);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current && audioRef.current.duration) {
      setProgress((audioRef.current.currentTime / audioRef.current.duration) * 100);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (audioRef.current && audioRef.current.duration) {
      const newTime = (Number(e.target.value) / 100) * audioRef.current.duration;
      audioRef.current.currentTime = newTime;
      setProgress(Number(e.target.value));
    }
  };

  // 롱 프레스 감지 로직
  const handlePointerDown = () => {
    isLongPressTriggered.current = false;
    timerRef.current = setTimeout(() => {
      setIsExpanded(true);
      isLongPressTriggered.current = true;
    }, 500); // 0.5초 누르면 확장
  };

  const handlePointerUpOrLeave = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    // 롱 프레스가 발동되었다면 클릭(재생토글) 무시
    if (isLongPressTriggered.current) {
      e.preventDefault();
      return;
    }
    togglePlay();
  };

  return (
    <>
      <audio 
        ref={audioRef} 
        src={audioUrl} 
        onTimeUpdate={handleTimeUpdate}
        onEnded={() => setIsPlaying(false)}
        onCanPlay={() => setIsReady(true)}
      />

      <div 
        className="fixed bottom-[140px] right-8 z-[9000] flex items-center justify-end transform-gpu"
        style={{ width: "280px" }} // 최대 확장 크기 공간 확보
      >
        <motion.div
          ref={containerRef}
          layout
          initial={{ borderRadius: 32 }}
          animate={{ 
            width: isExpanded ? 240 : 64,
            borderRadius: isExpanded ? 32 : 32
          }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className="relative bg-slate-900/80 backdrop-blur-md border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.4)] flex items-center p-1 overflow-hidden h-16"
        >
          {/* 확장 시 나타나는 Seek Bar 영역 */}
          <AnimatePresence>
            {isExpanded && (
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.2 }}
                className="flex-1 px-4 flex items-center"
              >
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={progress}
                  onChange={handleSeek}
                  className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-accent"
                />
              </motion.div>
            )}
          </AnimatePresence>

          {/* 메인 재생/일시정지 버튼 (우측 고정) */}
          <motion.button
            layout
            onPointerDown={handlePointerDown}
            onPointerUp={handlePointerUpOrLeave}
            onPointerLeave={handlePointerUpOrLeave}
            onPointerCancel={handlePointerUpOrLeave}
            onClick={handleClick}
            className={`w-14 h-14 shrink-0 rounded-full flex items-center justify-center transition-colors ${
              isPlaying ? "bg-accent text-black" : "bg-slate-800 text-accent hover:bg-slate-700"
            }`}
            whileTap={{ scale: 0.95 }}
            title="짧게 누르면 재생/일시정지, 길게 누르면 탐색바"
          >
            {isPlaying ? (
              <Pause fill="currentColor" size={24} />
            ) : (
              <Play fill="currentColor" size={24} className="ml-1" />
            )}
            
            {/* 로딩 인디케이터 (버튼 링) */}
            {!isReady && audioUrl && (
              <motion.div 
                className="absolute inset-0 border-2 border-accent border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
              />
            )}
          </motion.button>
        </motion.div>
      </div>
    </>
  );
}
