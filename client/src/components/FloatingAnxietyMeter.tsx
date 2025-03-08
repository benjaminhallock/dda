import { useState, useEffect } from "react";
import { useBehavior } from "@/contexts/BehaviorContext";
import { AnxietyScoreMeter } from "@/components/AnxietyScoreMeter";
import { Button } from "@/components/ui/button";
import { 
  Tooltip, 
  TooltipContent, 
  TooltipTrigger,
  TooltipProvider
} from "@/components/ui/tooltip";
import { Brain, X, Minimize, Maximize } from "lucide-react";

export function FloatingAnxietyMeter() {
  const { anxietyScore, isTracking, startTracking, stopTracking } = useBehavior();
  const [minimized, setMinimized] = useState(false);
  
  useEffect(() => {
    startTracking();
    
    return () => {
      stopTracking();
    };
  }, [startTracking, stopTracking]);
  
  if (!anxietyScore) return null;
  
  if (minimized) {
    return (
      <div className="fixed bottom-20 right-4 z-50">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                size="icon" 
                variant="outline" 
                className="rounded-full h-10 w-10 bg-background border-2 shadow-lg"
                style={{
                  borderColor: getScoreColor(anxietyScore.score)
                }}
                onClick={() => setMinimized(false)}
              >
                <Brain className="h-5 w-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <div className="space-y-2 p-2">
                <p className="font-semibold text-sm">Current Anxiety Level: {anxietyScore.score}</p>
                <AnxietyScoreMeter size="sm" showLabel={false} />
              </div>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    );
  }
  
  return (
    <div className="fixed bottom-20 right-4 w-64 rounded-lg border bg-card text-card-foreground shadow-lg z-50 overflow-hidden">
      <div className="flex items-center justify-between border-b px-3 py-2">
        <div className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          <span className="text-sm font-medium">Emotional Monitor</span>
        </div>
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => setMinimized(true)}
          >
            <Minimize className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8" 
            onClick={() => stopTracking()}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="p-4 space-y-4">
        <AnxietyScoreMeter />
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(anxietyScore.metrics).map(([key, value]) => (
            <div key={key} className="text-xs">
              <div className="flex justify-between mb-1">
                <span className="capitalize">{key}:</span>
                <span>{value}</span>
              </div>
              <div className="w-full bg-secondary rounded-full h-1">
                <div 
                  className="h-1 rounded-full" 
                  style={{ 
                    width: `${value}%`,
                    backgroundColor: getScoreColor(value)
                  }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function getScoreColor(score: number): string {
  if (score < 30) return "#22c55e"; // green-500
  if (score < 50) return "#84cc16"; // lime-500
  if (score < 70) return "#eab308"; // yellow-500
  if (score < 85) return "#f97316"; // orange-500
  return "#ef4444"; // red-500
}
