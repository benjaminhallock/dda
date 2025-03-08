import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

export type ExerciseType = "breathing" | "grounding" | "meditation" | "mindfulness";

interface RelaxationExerciseProps {
  type: ExerciseType;
  duration?: number; // in seconds
  onComplete?: () => void;
  className?: string;
}

export function RelaxationExercise({ 
  type, 
  duration = 60, 
  onComplete,
  className
}: RelaxationExerciseProps) {
  const [isActive, setIsActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(duration);
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale" | "rest">("inhale");
  const [phaseTime, setPhaseTime] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;
    
    if (isActive) {
      intervalId = setInterval(() => {
        setTimeRemaining(prev => {
          const newTime = prev - 1;
          if (newTime <= 0) {
            setIsActive(false);
            if (onComplete) onComplete();
            return 0;
          }
          return newTime;
        });
        
        setProgress(prev => {
          const newProgress = prev + (100 / duration);
          return Math.min(newProgress, 100);
        });
        
        // Update breathing phases for breathing exercise
        if (type === "breathing") {
          setPhaseTime(prev => prev + 1);
          
          // 4-4-4-4 breathing pattern (box breathing)
          if (phase === "inhale" && phaseTime >= 4) {
            setPhase("hold");
            setPhaseTime(0);
          } else if (phase === "hold" && phaseTime >= 4) {
            setPhase("exhale");
            setPhaseTime(0);
          } else if (phase === "exhale" && phaseTime >= 4) {
            setPhase("rest");
            setPhaseTime(0);
          } else if (phase === "rest" && phaseTime >= 4) {
            setPhase("inhale");
            setPhaseTime(0);
          }
        }
      }, 1000);
    }
    
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isActive, duration, onComplete, phase, phaseTime, type]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };
  
  const getExerciseContent = () => {
    switch (type) {
      case "breathing":
        return (
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <div 
                className={cn(
                  "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-1000",
                  {
                    "bg-blue-100 scale-100": phase === "inhale",
                    "bg-blue-200 scale-110": phase === "hold",
                    "bg-blue-100 scale-90": phase === "exhale",
                    "bg-gray-100 scale-90": phase === "rest"
                  }
                )}
              >
                <span className="text-lg font-medium capitalize">{phase}</span>
              </div>
            </div>
            <div className="text-sm text-muted-foreground">
              Follow the circle, {phase === "inhale" ? "breathe in" : phase === "exhale" ? "breathe out" : phase === "hold" ? "hold your breath" : "rest"}
            </div>
          </div>
        );
        
      case "grounding":
        return (
          <div className="space-y-4">
            <p>Focus on your senses to ground yourself:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>5 things you can see</strong> around you right now</li>
              <li><strong>4 things you can touch</strong> or feel</li>
              <li><strong>3 things you can hear</strong> in your environment</li>
              <li><strong>2 things you can smell</strong> or like the smell of</li>
              <li><strong>1 thing you can taste</strong> or enjoy the taste of</li>
            </ul>
            <p className="text-sm text-muted-foreground">Take your time with each step, focusing fully on each sensation</p>
          </div>
        );
        
      case "meditation":
        return (
          <div className="space-y-4">
            <p>Find a comfortable sitting position, back straight, shoulders relaxed.</p>
            <div className="space-y-2">
              <p>Close your eyes and breathe naturally.</p>
              <p>Focus on your breath - in and out.</p>
              <p>When your mind wanders, gently bring your attention back.</p>
            </div>
            <p className="text-sm text-muted-foreground italic">Each breath is a new moment. Each exhale releases tension.</p>
          </div>
        );
        
      case "mindfulness":
        return (
          <div className="space-y-4">
            <p>Bring your attention to the present moment:</p>
            <ul className="space-y-2">
              <li>Notice your body - how it feels, where it's tense or relaxed</li>
              <li>Notice your thoughts without judgment - they're just passing by</li>
              <li>Notice your emotions without trying to change them</li>
              <li>Notice your surroundings - colors, shapes, sounds</li>
            </ul>
            <p className="text-sm text-muted-foreground">Simply observe and be aware, without needing to change anything</p>
          </div>
        );
        
      default:
        return <p>Select an exercise type to begin</p>;
    }
  };

  const getExerciseTitle = () => {
    switch (type) {
      case "breathing": return "Box Breathing Exercise";
      case "grounding": return "5-4-3-2-1 Grounding Technique";
      case "meditation": return "Mindful Meditation";
      case "mindfulness": return "Mindfulness Practice";
      default: return "Relaxation Technique";
    }
  };

  const getExerciseDescription = () => {
    switch (type) {
      case "breathing": return "Regulate your breathing to calm your nervous system";
      case "grounding": return "Use your senses to anchor yourself to the present";
      case "meditation": return "Clear your mind and focus on the present moment";
      case "mindfulness": return "Develop awareness of your thoughts and sensations";
      default: return "Practice relaxation techniques to reduce anxiety";
    }
  };

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader>
        <CardTitle>{getExerciseTitle()}</CardTitle>
        <CardDescription>{getExerciseDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        {isActive ? (
          <>
            <div className="mb-6">
              {getExerciseContent()}
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{formatTime(timeRemaining)}</span>
              </div>
              <Progress value={progress} />
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <p className="mb-6">{progress === 100 ? "Exercise completed. Great job!" : "Ready to begin? Press start when you're ready."}</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="justify-between">
        <Button variant="outline" onClick={() => {
          setIsActive(false);
          setProgress(0);
          setTimeRemaining(duration);
          setPhase("inhale");
          setPhaseTime(0);
        }}>
          {progress === 0 ? "Cancel" : "Reset"}
        </Button>
        {!isActive && progress < 100 && (
          <Button onClick={() => setIsActive(true)}>Start</Button>
        )}
        {progress === 100 && (
          <Button onClick={() => {
            setProgress(0);
            setTimeRemaining(duration);
            setPhase("inhale");
            setPhaseTime(0);
          }}>
            Repeat
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
