import React from 'react';
import { Check } from 'lucide-react';
import { cn } from "@/lib/utils";

export function ProgressSteps({ steps, currentStep }) {
  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between relative">
        {/* Progress Line */}
        <div className="absolute top-5 left-0 right-0 h-0.5 bg-[hsl(var(--border))] -z-10">
          <div
            className="h-full bg-[hsl(var(--accent))] transition-all duration-500"
            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
          />
        </div>

        {/* Steps */}
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={index} className="flex flex-col items-center gap-2 relative bg-white px-2">
              <div
                className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300",
                  isCompleted && "bg-[hsl(var(--accent))] text-[hsl(var(--primary))] shadow-lg",
                  isActive && "bg-[hsl(var(--primary))] text-white shadow-lg scale-110",
                  !isActive && !isCompleted && "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]"
                )}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : stepNumber}
              </div>
              <span
                className={cn(
                  "text-xs font-medium text-center transition-colors",
                  isActive && "text-[hsl(var(--primary))] font-semibold",
                  isCompleted && "text-[hsl(var(--accent))]",
                  !isActive && !isCompleted && "text-[hsl(var(--muted-foreground))]"
                )}
              >
                {step}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}