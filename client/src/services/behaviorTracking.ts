export type BehaviorMetrics = {
  typingSpeed: number; // Characters per minute
  typingPressure: number; // Time key is held down in ms
  typingErrors: number; // Backspaces and corrections
  mouseSpeed: number; // Pixels per second
  mouseClicks: number; // Clicks per minute
  scrollSpeed: number; // Pixels per second
  scrollDirection: number; // Positive is down, negative is up
  scrollJitter: number; // Changes in direction
  focusChanges: number; // Tab/window changes
  timestamp: number;
}

export type AnxietyScore = {
  score: number; // 0-100, where 0 is calm and 100 is highly anxious
  confidence: number; // 0-1, how confident the algorithm is
  metrics: {
    typing: number; // Sub-score for typing behavior
    mouse: number; // Sub-score for mouse behavior
    scrolling: number; // Sub-score for scrolling behavior
    focus: number; // Sub-score for focus behavior
  };
  trend: 'improving' | 'worsening' | 'stable';
  timestamp: number;
}

class BehaviorTracker {
  private typingData: { timestamp: number; key: string; duration: number }[] = [];
  private mouseData: { timestamp: number; x: number; y: number }[] = [];
  private scrollData: { timestamp: number; position: number }[] = [];
  private focusData: { timestamp: number; focused: boolean }[] = [];
  private listeners: ((score: AnxietyScore) => void)[] = [];
  private tracking = false;
  private lastScore: AnxietyScore | null = null;
  private analysisInterval: number | null = null;

  constructor() {
    this.lastScore = {
      score: 50, // Start at neutral
      confidence: 0.5,
      metrics: { typing: 50, mouse: 50, scrolling: 50, focus: 50 },
      trend: 'stable',
      timestamp: Date.now()
    };
  }

  public startTracking(): void {
    if (this.tracking) return;
    
    // Typing tracking
    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
    
    // Mouse tracking
    document.addEventListener('mousemove', this.handleMouseMove);
    document.addEventListener('click', this.handleClick);
    
    // Scroll tracking
    document.addEventListener('scroll', this.handleScroll, true);
    
    // Focus tracking
    window.addEventListener('focus', this.handleFocus);
    window.addEventListener('blur', this.handleBlur);
    
    // Set interval for behavior analysis
    this.analysisInterval = window.setInterval(() => this.analyzeBehavior(), 2000);
    
    this.tracking = true;
  }

  public stopTracking(): void {
    if (!this.tracking) return;
    
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
    document.removeEventListener('mousemove', this.handleMouseMove);
    document.removeEventListener('click', this.handleClick);
    document.removeEventListener('scroll', this.handleScroll, true);
    window.removeEventListener('focus', this.handleFocus);
    window.removeEventListener('blur', this.handleBlur);
    
    if (this.analysisInterval) {
      window.clearInterval(this.analysisInterval);
      this.analysisInterval = null;
    }
    
    this.tracking = false;
  }

  public subscribe(callback: (score: AnxietyScore) => void): () => void {
    this.listeners.push(callback);
    
    // Immediately provide current score
    if (this.lastScore) {
      callback(this.lastScore);
    }
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  public getCurrentScore(): AnxietyScore | null {
    return this.lastScore;
  }

  private handleKeyDown = (e: KeyboardEvent) => {
    this.typingData.push({
      timestamp: Date.now(),
      key: e.key,
      duration: 0
    });
  };

  private handleKeyUp = (e: KeyboardEvent) => {
    const keyIndex = this.typingData.findIndex(
      item => item.key === e.key && item.duration === 0
    );
    
    if (keyIndex !== -1) {
      this.typingData[keyIndex].duration = Date.now() - this.typingData[keyIndex].timestamp;
    }
  };

  private handleMouseMove = (e: MouseEvent) => {
    this.mouseData.push({
      timestamp: Date.now(),
      x: e.clientX,
      y: e.clientY
    });
    
    // Limit array size to prevent memory issues
    if (this.mouseData.length > 100) {
      this.mouseData = this.mouseData.slice(-100);
    }
  };

  private handleClick = () => {
    // Record clicks separately for analysis
    this.mouseData.push({
      timestamp: Date.now(),
      x: -1, // Special value to indicate a click
      y: -1
    });
  };

  private handleScroll = () => {
    this.scrollData.push({
      timestamp: Date.now(),
      position: window.scrollY
    });
    
    // Limit array size
    if (this.scrollData.length > 50) {
      this.scrollData = this.scrollData.slice(-50);
    }
  };

  private handleFocus = () => {
    this.focusData.push({
      timestamp: Date.now(),
      focused: true
    });
  };

  private handleBlur = () => {
    this.focusData.push({
      timestamp: Date.now(),
      focused: false
    });
  };

  private analyzeBehavior(): void {
    const now = Date.now();
    const timeWindow = 60000; // Look at last minute of data
    
    // Filter data to recent window
    const recentTyping = this.typingData.filter(item => now - item.timestamp < timeWindow);
    const recentMouse = this.mouseData.filter(item => now - item.timestamp < timeWindow);
    const recentScroll = this.scrollData.filter(item => now - item.timestamp < timeWindow);
    const recentFocus = this.focusData.filter(item => now - item.timestamp < timeWindow);
    
    // Calculate metrics
    const typingMetric = this.calculateTypingMetric(recentTyping);
    const mouseMetric = this.calculateMouseMetric(recentMouse);
    const scrollMetric = this.calculateScrollMetric(recentScroll);
    const focusMetric = this.calculateFocusMetric(recentFocus);
    
    // Combined anxiety score (weighted average)
    const combinedScore = Math.round(
      (typingMetric * 0.3) + 
      (mouseMetric * 0.3) + 
      (scrollMetric * 0.3) + 
      (focusMetric * 0.1)
    );
    
    // Calculate trend
    let trend: 'improving' | 'worsening' | 'stable' = 'stable';
    if (this.lastScore) {
      if (combinedScore < this.lastScore.score - 5) trend = 'improving';
      else if (combinedScore > this.lastScore.score + 5) trend = 'worsening';
    }
    
    // Calculate confidence based on amount of data
    const dataPoints = recentTyping.length + recentMouse.length + recentScroll.length + recentFocus.length;
    const confidence = Math.min(1, dataPoints / 100); // Max confidence at 100+ data points
    
    // Update last score
    this.lastScore = {
      score: combinedScore,
      confidence,
      metrics: {
        typing: typingMetric,
        mouse: mouseMetric,
        scrolling: scrollMetric,
        focus: focusMetric
      },
      trend,
      timestamp: now
    };
    
    // Notify listeners
    this.listeners.forEach(listener => listener(this.lastScore!));
    
    // Clean up old data
    this.cleanupOldData(timeWindow * 2);
  }

  private calculateTypingMetric(typingData: { timestamp: number; key: string; duration: number }[]): number {
    if (typingData.length < 5) return 50; // Not enough data
    
    // Calculate typing speed (characters per minute)
    const typingSpeed = (typingData.length / 60) * 60000 / (Date.now() - typingData[0].timestamp);
    
    // Calculate average key press duration
    const completedKeyPresses = typingData.filter(item => item.duration > 0);
    const avgDuration = completedKeyPresses.length > 0 
      ? completedKeyPresses.reduce((sum, item) => sum + item.duration, 0) / completedKeyPresses.length 
      : 100; // Default
    
    // Count backspaces and deletions (error corrections)
    const corrections = typingData.filter(item => 
      item.key === 'Backspace' || item.key === 'Delete'
    ).length;
    
    // Corrections ratio (higher is more anxious)
    const correctionRatio = corrections / typingData.length;
    
    // Score calculation:
    // Higher typing speed can indicate anxiety (>120 chars/min)
    // Shorter key press duration can indicate tension (<80ms)
    // Higher correction ratio indicates anxiety (>0.1)
    
    let speedScore = 0;
    if (typingSpeed > 150) speedScore = 90;
    else if (typingSpeed > 120) speedScore = 70;
    else if (typingSpeed < 40) speedScore = 80;
    else speedScore = 50;
    
    let durationScore = 0;
    if (avgDuration < 80) durationScore = 80;
    else if (avgDuration > 200) durationScore = 70;
    else durationScore = 50;
    
    let correctionScore = Math.min(100, correctionRatio * 500);
    
    // Combined typing score
    return Math.round((speedScore * 0.4) + (durationScore * 0.3) + (correctionScore * 0.3));
  }

  private calculateMouseMetric(mouseData: { timestamp: number; x: number; y: number }[]): number {
    if (mouseData.length < 10) return 50; // Not enough data
    
    // Count clicks
    const clicks = mouseData.filter(item => item.x === -1).length;
    
    // Filter out clicks for movement analysis
    const movements = mouseData.filter(item => item.x !== -1);
    
    if (movements.length < 5) return 50;
    
    // Calculate mouse speed and jitter
    let totalDistance = 0;
    let directionChanges = 0;
    let lastDirection = { x: 0, y: 0 };
    
    for (let i = 1; i < movements.length; i++) {
      const dx = movements[i].x - movements[i-1].x;
      const dy = movements[i].y - movements[i-1].y;
      const distance = Math.sqrt(dx*dx + dy*dy);
      
      totalDistance += distance;
      
      // Check for direction changes
      if (Math.sign(dx) !== Math.sign(lastDirection.x) && dx !== 0) {
        directionChanges++;
      }
      if (Math.sign(dy) !== Math.sign(lastDirection.y) && dy !== 0) {
        directionChanges++;
      }
      
      lastDirection = { x: dx, y: dy };
    }
    
    // Calculate metrics
    const timeSpan = (movements[movements.length-1].timestamp - movements[0].timestamp) / 1000;
    const avgSpeed = totalDistance / timeSpan; // Pixels per second
    const jitterRatio = timeSpan > 0 ? directionChanges / timeSpan : 0; // Direction changes per second
    
    // Score calculation:
    // Higher speed can indicate anxiety (>500 px/s)
    // More jitter indicates anxiety (>5 changes/s)
    // More clicks can indicate anxiety (>20/min)
    
    let speedScore = 0;
    if (avgSpeed > 800) speedScore = 90;
    else if (avgSpeed > 500) speedScore = 70;
    else if (avgSpeed < 50) speedScore = 60;
    else speedScore = 50;
    
    let jitterScore = Math.min(100, jitterRatio * 10);
    
    let clickScore = 0;
    const clicksPerMinute = (clicks / timeSpan) * 60;
    if (clicksPerMinute > 40) clickScore = 90;
    else if (clicksPerMinute > 20) clickScore = 70;
    else clickScore = 50;
    
    // Combined mouse score
    return Math.round((speedScore * 0.4) + (jitterScore * 0.4) + (clickScore * 0.2));
  }

  private calculateScrollMetric(scrollData: { timestamp: number; position: number }[]): number {
    if (scrollData.length < 5) return 50; // Not enough data
    
    let totalDistance = 0;
    let directionChanges = 0;
    let lastDirection = 0;
    
    for (let i = 1; i < scrollData.length; i++) {
      const change = scrollData[i].position - scrollData[i-1].position;
      totalDistance += Math.abs(change);
      
      // Check for direction changes
      if (Math.sign(change) !== Math.sign(lastDirection) && change !== 0) {
        directionChanges++;
      }
      
      lastDirection = change;
    }
    
    // Calculate metrics
    const timeSpan = (scrollData[scrollData.length-1].timestamp - scrollData[0].timestamp) / 1000;
    const avgScrollSpeed = totalDistance / timeSpan; // Pixels per second
    const scrollJitter = timeSpan > 0 ? directionChanges / timeSpan : 0; // Direction changes per second
    
    // Score calculation:
    // Fast scrolling can indicate anxiety (>500px/s)
    // Frequent direction changes indicates anxiety (>3/s)
    
    let speedScore = 0;
    if (avgScrollSpeed > 1000) speedScore = 90;
    else if (avgScrollSpeed > 500) speedScore = 75;
    else if (avgScrollSpeed < 50) speedScore = 60;
    else speedScore = 50;
    
    let jitterScore = Math.min(100, scrollJitter * 25);
    
    // Combined scroll score
    return Math.round((speedScore * 0.6) + (jitterScore * 0.4));
  }

  private calculateFocusMetric(focusData: { timestamp: number; focused: boolean }[]): number {
    if (focusData.length < 2) return 50; // Not enough data
    
    // Count focus changes
    const changeCount = focusData.length;
    const timeSpan = (focusData[focusData.length-1].timestamp - focusData[0].timestamp) / 60000; // in minutes
    const changesPerMinute = timeSpan > 0 ? changeCount / timeSpan : 0;
    
    // Score calculation:
    // More focus changes can indicate anxiety or distraction (>3/min)
    if (changesPerMinute > 6) return 90;
    if (changesPerMinute > 3) return 70;
    
    return 50;
  }

  private cleanupOldData(maxAge: number): void {
    const cutoff = Date.now() - maxAge;
    this.typingData = this.typingData.filter(item => item.timestamp >= cutoff);
    this.mouseData = this.mouseData.filter(item => item.timestamp >= cutoff);
    this.scrollData = this.scrollData.filter(item => item.timestamp >= cutoff);
    this.focusData = this.focusData.filter(item => item.timestamp >= cutoff);
  }
}

export const behaviorTracker = new BehaviorTracker();
