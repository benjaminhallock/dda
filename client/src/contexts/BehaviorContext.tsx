import React, { createContext, useContext, useEffect, useState } from 'react';
import { behaviorTracker, AnxietyScore } from '../services/behaviorTracking';

interface BehaviorContextType {
  anxietyScore: AnxietyScore | null;
  isTracking: boolean;
  startTracking: () => void;
  stopTracking: () => void;
}

const defaultContext: BehaviorContextType = {
  anxietyScore: null,
  isTracking: false,
  startTracking: () => {},
  stopTracking: () => {}
};

const BehaviorContext = createContext<BehaviorContextType>(defaultContext);

export const useBehavior = () => useContext(BehaviorContext);

export const BehaviorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [anxietyScore, setAnxietyScore] = useState<AnxietyScore | null>(null);
  const [isTracking, setIsTracking] = useState(false);

  useEffect(() => {
    const unsubscribe = behaviorTracker.subscribe(score => {
      setAnxietyScore(score);
    });
    
    return () => {
      unsubscribe();
    };
  }, []);

  const startTracking = () => {
    behaviorTracker.startTracking();
    setIsTracking(true);
  };

  const stopTracking = () => {
    behaviorTracker.stopTracking();
    setIsTracking(false);
  };

  return (
    <BehaviorContext.Provider value={{ 
      anxietyScore, 
      isTracking,
      startTracking,
      stopTracking
    }}>
      {children}
    </BehaviorContext.Provider>
  );
};
