import { useState, useEffect } from "react";
import { useBehavior } from "@/contexts/BehaviorContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { AnxietyScoreMeter } from "@/components/AnxietyScoreMeter";
import { RelaxationExercise, ExerciseType } from "@/components/RelaxationExercise";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Lightbulb, ArrowRight } from "lucide-react";

// Recommendations based on anxiety levels
const getRecommendations = (score: number) => {
  if (score < 30) {
    return {
      title: "You're doing great!",
      description: "Your emotional state appears calm and balanced.",
      exercises: ["meditation", "mindfulness"],
      tips: [
        "Continue with your current practices",
        "Practice mindfulness to maintain this state",
        "Consider journaling about what's working well for you"
      ]
    };
  } else if (score < 50) {
    return {
      title: "You're relatively calm",
      description: "You show minimal signs of anxiety or stress.",
      exercises: ["mindfulness", "breathing"],
      tips: [
        "Take brief mindfulness breaks throughout your day",
        "Consider short breathing exercises to maintain balance",
        "Stay aware of any changes in your stress levels"
      ]
    };
  } else if (score < 70) {
    return {
      title: "You're showing mild anxiety",
      description: "Your interaction patterns suggest moderate stress levels.",
      exercises: ["breathing", "grounding"],
      tips: [
        "Take a short break from your current task",
        "Practice the 4-4-4 breathing technique",
        "Consider reducing caffeine intake",
        "Try to identify what might be causing stress"
      ]
    };
  } else if (score < 85) {
    return {
      title: "You're experiencing anxiety",
      description: "Your behavior patterns indicate significant anxiety.",
      exercises: ["grounding", "breathing"],
      tips: [
        "Take a longer break from screens",
        "Try grounding exercises to reconnect with your body",
        "Consider going for a short walk",
        "Practice deep breathing to activate your parasympathetic system",
        "If this persists, consider talking to someone you trust"
      ]
    };
  } else {
    return {
      title: "You're highly anxious",
      description: "Your interaction patterns suggest high levels of distress.",
      exercises: ["grounding", "breathing"],
      tips: [
        "Take a significant break from what you're doing",
        "Focus on grounding techniques immediately",
        "If possible, move to a calming environment",
        "Consider reaching out to a support person",
        "Remember that this state is temporary and will pass"
      ]
    };
  }
};

export function AiChat() {
  const { anxietyScore, isTracking, startTracking } = useBehavior();
  const [message, setMessage] = useState("");
  const [activeTab, setActiveTab] = useState("monitor");
  const [selectedExercise, setSelectedExercise] = useState<ExerciseType>("breathing");
  const [exerciseDuration, setExerciseDuration] = useState(60); // 60 seconds

  useEffect(() => {
    if (!isTracking) {
      startTracking();
    }
  }, [isTracking, startTracking]);

  // Determine recommendations based on anxiety score
  const recommendations = anxietyScore ? getRecommendations(anxietyScore.score) : null;

  const handleSendMessage = () => {
    if (message.trim()) {
      // In a real implementation, this would send the message to a chatbot API
      // For now, we'll just clear the input
      setMessage("");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">AI Wellness Assistant</h1>
          <p className="text-muted-foreground">
            Monitor your anxiety levels and get personalized relaxation guidance
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="monitor">Emotional Monitor</TabsTrigger>
          <TabsTrigger value="exercises">Relaxation Exercises</TabsTrigger>
          <TabsTrigger value="chat">AI Chat</TabsTrigger>
        </TabsList>
        
        {/* Monitor Tab */}
        <TabsContent value="monitor" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Card className="col-span-full">
              <CardHeader>
                <CardTitle>Your Current Emotional State</CardTitle>
                <CardDescription>
                  Based on analysis of your interaction patterns
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <AnxietyScoreMeter size="lg" />
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    {anxietyScore && Object.entries(anxietyScore.metrics).map(([key, value]) => (
                      <div key={key} className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm font-medium capitalize">{key} Patterns</span>
                          <span className="text-sm font-medium">{value}/100</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2">
                          <div 
                            className="h-2 rounded-full" 
                            style={{ 
                              width: `${value}%`,
                              backgroundColor: value < 30 ? "#22c55e" : 
                                              value < 50 ? "#84cc16" : 
                                              value < 70 ? "#eab308" : 
                                              value < 85 ? "#f97316" : "#ef4444"
                            }}
                          ></div>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          {key === "typing" && "Based on typing speed, pressure, and errors"}
                          {key === "mouse" && "Based on cursor speed, clicks, and movement patterns"}
                          {key === "scrolling" && "Based on scroll speed and direction changes"}
                          {key === "focus" && "Based on tab/window switching frequency"}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {recommendations && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Assessment</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-orange-500" />
                        <h3 className="font-medium">{recommendations.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground">{recommendations.description}</p>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recommended Activities</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {recommendations.exercises.map((exercise) => (
                        <div 
                          key={exercise}
                          className="flex items-center justify-between rounded-lg border p-3 text-sm"
                        >
                          <span className="font-medium capitalize">{exercise} Exercise</span>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-7 gap-1"
                            onClick={() => {
                              setSelectedExercise(exercise as ExerciseType);
                              setActiveTab("exercises");
                            }}
                          >
                            Try <ArrowRight className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Quick Tips</CardTitle>
                    <CardDescription>Personalized suggestions based on your current state</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="grid gap-2 sm:grid-cols-2">
                      {recommendations.tips.map((tip, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Lightbulb className="h-5 w-5 text-yellow-500 mt-0.5 shrink-0" />
                          <span className="text-sm">{tip}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>
        
        {/* Exercises Tab */}
        <TabsContent value="exercises" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Available Exercises</CardTitle>
                <CardDescription>Select an exercise type</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2">
                  {["breathing", "grounding", "meditation", "mindfulness"].map((type) => (
                    <Button
                      key={type}
                      variant={selectedExercise === type ? "default" : "outline"}
                      className="justify-start"
                      onClick={() => setSelectedExercise(type as ExerciseType)}
                    >
                      <span className="capitalize">{type}</span>
                    </Button>
                  ))}
                  <div className="mt-4 space-y-2">
                    <h4 className="text-sm font-medium">Exercise Duration</h4>
                    <div className="flex gap-2">
                      {[60, 120, 180, 300].map((seconds) => (
                        <Button
                          key={seconds}
                          variant={exerciseDuration === seconds ? "default" : "outline"}
                          size="sm"
                          onClick={() => setExerciseDuration(seconds)}
                        >
                          {seconds >= 60 ? `${seconds/60} min` : `${seconds} sec`}
                        </Button>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <div className="md:col-span-1">
              <RelaxationExercise 
                type={selectedExercise} 
                duration={exerciseDuration} 
              />
            </div>
          </div>
        </TabsContent>
        
        {/* Chat Tab */}
        <TabsContent value="chat" className="space-y-4">
          <Card className="flex flex-col h-[calc(100vh-280px)]">
            <CardHeader>
              <CardTitle>AI Wellness Chat</CardTitle>
              <CardDescription>
                Chat with our AI wellness assistant for personalized support
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto pb-2">
              <div className="space-y-4">
                <div className="bg-secondary p-3 rounded-lg max-w-[80%]">
                  <p className="text-sm">
                    Hello! I'm your wellness assistant. Based on your interaction patterns, 
                    I've detected {anxietyScore ? 
                      anxietyScore.score < 50 ? "low levels of anxiety" : 
                      anxietyScore.score < 80 ? "moderate levels of anxiety" : 
                      "high levels of anxiety" 
                    : "your emotional state"}. How can I help you today?
                  </p>
                </div>
                
                {/* In a real implementation, we would show the conversation history here */}
                
              </div>
            </CardContent>
            <div className="border-t p-4 flex gap-2">
              <Textarea 
                className="min-h-10 flex-1"
                placeholder="Type your message..."
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
              />
              <Button onClick={handleSendMessage}>Send</Button>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
