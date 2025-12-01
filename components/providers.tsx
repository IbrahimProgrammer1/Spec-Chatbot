"use client";

import { useEffect, useState, type ReactNode } from "react";

interface ProvidersProps {
  children: ReactNode;
}

export function Providers({ children }: ProvidersProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Show a loading skeleton instead of null
  if (!mounted) {
    return (
      <div className="flex flex-col h-screen bg-white dark:bg-slate-950">
        {/* Progress bar skeleton */}
        <div className="w-full border-b p-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-8 bg-slate-200 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
        
        {/* Chat area skeleton */}
        <div className="flex-1 p-4">
          <div className="max-w-4xl mx-auto space-y-4">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              <div className="flex-1 h-20 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
            </div>
          </div>
        </div>
        
        {/* Input skeleton */}
        <div className="border-t p-4">
          <div className="max-w-4xl mx-auto">
            <div className="h-12 bg-slate-200 dark:bg-slate-800 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}