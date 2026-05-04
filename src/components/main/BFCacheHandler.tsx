"use client";

import { useEffect } from "react";

export function BFCacheHandler() {
  useEffect(() => {
    const handlePageShow = (event: PageTransitionEvent) => {
      // 1. event.persisted 체크 (표준 BFCache 감지)
      // 2. performance.navigation.type === 2 체크 (브라우저 히스토리 탐색 감지 보강)
      const isBackNavigation = event.persisted || (
        window.performance && 
        window.performance.navigation.type === 2
      );

      if (isBackNavigation) {
        window.location.reload();
      }
    };
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);

  return null;
}
