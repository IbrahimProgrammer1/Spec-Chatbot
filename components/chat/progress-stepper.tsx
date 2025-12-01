"use client";

import { Phase, PHASE_LABELS, PHASE_ORDER } from "@/lib/types";
import { Check, Circle, Loader2, Play } from "lucide-react";
import { clsx } from "clsx";

interface ProgressStepperProps {
  currentPhase: Phase;
  isLoading?: boolean;
}

export function ProgressStepper({ currentPhase, isLoading }: ProgressStepperProps) {
  const displayPhases = PHASE_ORDER.filter(
    (p) => p !== "idle" && p !== "complete"
  );

  const currentIndex = PHASE_ORDER.indexOf(currentPhase);

  return (
    <div className="w-full">
      <div className="flex flex-col gap-4">
        {displayPhases.map((phase, index) => {
          const phaseIndex = PHASE_ORDER.indexOf(phase);
          const isComplete = currentIndex > phaseIndex;
          const isCurrent = currentPhase === phase;
          const isPending = currentIndex < phaseIndex;

          return (
            <div key={phase} className="relative">
              {/* Connector Line */}
              {index < displayPhases.length - 1 && (
                <div
                  className={clsx(
                    "absolute left-4 top-8 bottom-[-16px] w-0.5 transition-colors duration-300",
                    {
                      "bg-indigo-200 dark:bg-indigo-900/50": isComplete,
                      "bg-slate-100 dark:bg-slate-800": !isComplete,
                    }
                  )}
                />
              )}

              <div className="flex items-center gap-3 group">
                {/* Icon */}
                <div
                  className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 z-10 ring-4",
                    {
                      "bg-indigo-600 text-white ring-indigo-50 dark:ring-indigo-900/20": isComplete,
                      "bg-white dark:bg-slate-900 border-2 border-indigo-600 text-indigo-600 ring-indigo-50 dark:ring-indigo-900/20": isCurrent,
                      "bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 ring-transparent": isPending,
                    }
                  )}
                >
                  {isComplete ? (
                    <Check className="w-4 h-4" />
                  ) : isCurrent && isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : isCurrent ? (
                    <Play className="w-3 h-3 fill-current" />
                  ) : (
                    <Circle className="w-3 h-3" />
                  )}
                </div>

                {/* Label */}
                <div className="flex flex-col">
                  <span
                    className={clsx(
                      "text-sm font-medium transition-colors duration-200",
                      {
                        "text-indigo-900 dark:text-indigo-100": isCurrent || isComplete,
                        "text-slate-500 dark:text-slate-500": isPending,
                      }
                    )}
                  >
                    {PHASE_LABELS[phase]}
                  </span>
                  {isCurrent && (
                    <span className="text-xs text-indigo-600 dark:text-indigo-400 font-medium animate-fade-in">
                      In Progress
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}