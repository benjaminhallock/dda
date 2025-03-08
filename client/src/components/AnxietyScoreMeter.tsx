import { useEffect, useState } from "react";
import { Progress } from "@/components/ui/progress";
import { useBehavior } from "@/contexts/BehaviorContext";
import { cn } from "@/lib/utils";

interface AnxietyScoreMeterProps {
  className?: string;
  showLabel?: boolean;
  size?: "sm" | "md" | "lg";
  showTrend?: boolean;
}

export function AnxietyScoreMeter({ 
  className, 
  showLabel = true, 
  size = "md",
  showTrend = true
}: AnxietyScoreMeterProps) {
  const { anxietyScore } = useBehavior();
  const [score, setScore] = useState<number>(50);

  useEffect(() => {
    if (anxietyScore) {
      setScore(anxietyScore.score);
    }
  }, [anxietyScore]);

  // Determine color based on score
  const getProgressColor = (score: number) => {
    if (score < 30) return "bg-green-500";
    if (score < 50) return "bg-lime-500";
    if (score < 70) return "bg-yellow-500";
    if (score < 85) return "bg-orange-500";
    return "bg-red-500";
  };

  // Get label text based on score
  const getLabelText = (score: number) => {
    if (score < 30) return "Calm";
    if (score < 50) return "Relaxed";
    if (score < 70) return "Mild Anxiety";
    if (score < 85) return "Anxious";
    return "High Anxiety";
  };

  // Get trend indicator
  const getTrendIndicator = () => {
    if (!anxietyScore || !showTrend) return null;
    
    if (anxietyScore.trend === 'improving') {
      return <span className="text-green-500 text-xs">↓ Improving</span>;
    } else if (anxietyScore.trend === 'worsening') {
      return <span className="text-red-500 text-xs">↑ Increasing</span>;
    } else {
      return <span className="text-gray-400 text-xs">→ Stable</span>;
    }
  };

  const sizeClasses = {
    sm: "h-1",
    md: "h-2",
    lg: "h-3"
  };

  return (
    <div className={cn("space-y-1", className)}>
      {showLabel && (
        <div className="flex justify-between text-sm">
          <span className="font-medium">{getLabelText(score)}</span>
          <div className="flex items-center gap-2">
            {getTrendIndicator()}
            <span className="font-bold">{score}/100</span>
          </div>
        </div>
      )}
      <Progress 
        value={score} 
        className={cn("w-full", sizeClasses[size])}
        indicatorClassName={getProgressColor(score)}
      />
    </div>
  );
}
