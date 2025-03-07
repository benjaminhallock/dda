const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const { Wellness, Therapist, Session, MentalHealthAdvice } = require('../models/models.js');
const { sendLLMRequest } = require('../services/llmService.js');
const router = express.Router();

// Get wellness metrics for the user
router.get('/metrics', requireUser, async (req, res) => {
  try {
    // Get recent wellness entries
    const recentEntries = await Wellness.find({ user: req.user._id })
      .sort({ date: -1 })
      .limit(7);
    
    // If no entries, return default
    if (recentEntries.length === 0) {
      return res.status(200).json({
        stressScore: 50,
        wellnessScore: 50,
        patterns: [],
        recommendations: [
          {
            _id: '1',
            type: 'default',
            title: 'Get Started',
            description: 'Begin tracking your wellness metrics to receive personalized recommendations.'
          }
        ]
      });
    }
    
    // Calculate averages from recent entries
    const stressScore = Math.round(
      recentEntries.reduce((sum, entry) => sum + entry.stressScore, 0) / recentEntries.length
    );
    
    const wellnessScore = Math.round(
      recentEntries.reduce((sum, entry) => sum + entry.wellnessScore, 0) / recentEntries.length
    );
    
    // Format patterns for chart
    const patterns = recentEntries.reverse().map(entry => ({
      date: entry.date.toISOString().split('T')[0],
      stress: entry.stressScore,
      wellness: entry.wellnessScore
    }));
    
    // Generate recommendations - for a production app, use an LLM or a rule-based system
    // Here we'll just use some basic logic for demo
    let recommendations = [];
    
    if (stressScore > 70) {
      recommendations.push({
        _id: '1',
        type: 'break',
        title: 'Take a Break',
        description: 'High stress patterns detected. Consider a 15-minute break with deep breathing exercises.'
      });
    }
    
    if (wellnessScore < 60) {
      recommendations.push({
        _id: '2',
        type: 'therapy',
        title: 'Therapy Session',
        description: 'Your wellness score is low. Consider scheduling a therapy session for additional support.'
      });
    }
    
    if (stressScore > 50 && wellnessScore < 70) {
      recommendations.push({
        _id: '3',
        type: 'exercise',
        title: 'Physical Activity',
        description: 'Regular physical activity can help reduce stress and improve your overall wellness.'
      });
    }
    
    // If we have no recommendations (scores are good), add a positive one
    if (recommendations.length === 0) {
      recommendations.push({
        _id: '4',
        type: 'positive',
        title: 'Keep it Up!',
        description: 'Your wellness metrics look good. Continue your current practices and routines.'
      });
    }
    
    res.status(200).json({
      stressScore,
      wellnessScore,
      patterns,
      recommendations
    });
  } catch (error) {
    console.error('Error fetching wellness metrics:', error);
    res.status(500).json({ error: 'Failed to fetch wellness metrics' });
  }
});

// Submit wellness check-in
router.post('/check-in', requireUser, async (req, res) => {
  try {
    const { stressScore, wellnessScore, notes } = req.body;
    
    if (stressScore === undefined || wellnessScore === undefined) {
      return res.status(400).json({ error: 'Stress and wellness scores are required' });
    }
    
    // Validate score ranges
    if (stressScore < 0 || stressScore > 100 || wellnessScore < 0 || wellnessScore > 100) {
      return res.status(400).json({ error: 'Scores must be between 0 and 100' });
    }
    
    const entry = new Wellness({
      user: req.user._id,
      stressScore,
      wellnessScore,
      notes: notes || ''
    });
    
    await entry.save();
    
    res.status(201).json({
      success: true,
      message: 'Wellness check-in recorded'
    });
  } catch (error) {
    console.error('Error submitting wellness check-in:', error);
    res.status(500).json({ error: 'Failed to submit wellness check-in' });
  }
});

// Get available therapists
router.get('/therapists', requireUser, async (req, res) => {
  try {
    const therapists = await Therapist.find().sort({ rating: -1 });
    
    res.status(200).json({
      therapists: therapists.map(t => ({
        _id: t._id,
        name: t.name,
        specialization: t.specialization,
        availability: t.availability.map(a => ({
          date: a.date,
          slots: a.slots
        })),
        rating: t.rating
      }))
    });
  } catch (error) {
    console.error('Error fetching therapists:', error);
    res.status(500).json({ error: 'Failed to fetch therapists' });
  }
});

// Book a therapy session
router.post('/book-session', requireUser, async (req, res) => {
  try {
    const { therapistId, date, slot } = req.body;
    
    if (!therapistId || !date || !slot) {
      return res.status(400).json({ error: 'Therapist, date and time slot are required' });
    }
    
    const therapist = await Therapist.findById(therapistId);
    if (!therapist) {
      return res.status(404).json({ error: 'Therapist not found' });
    }
    
    // Find the availability for the selected date
    const availabilityIndex = therapist.availability.findIndex(
      a => a.date.toISOString().split('T')[0] === new Date(date).toISOString().split('T')[0]
    );
    
    if (availabilityIndex === -1) {
      return res.status(400).json({ error: 'No availability for the selected date' });
    }
    
    // Check if the slot is available
    if (!therapist.availability[availabilityIndex].slots.includes(slot)) {
      return res.status(400).json({ error: 'Selected time slot is not available' });
    }
    
    // Create the session
    const session = new Session({
      user: req.user._id,
      therapist: therapistId,
      date: new Date(date),
      time: slot,
      status: 'scheduled'
    });
    
    await session.save();
    
    // Remove the booked slot from therapist's availability
    therapist.availability[availabilityIndex].slots = 
      therapist.availability[availabilityIndex].slots.filter(s => s !== slot);
    
    await therapist.save();
    
    res.status(201).json({
      success: true,
      sessionId: session._id,
      confirmationDetails: {
        therapist: therapist.name,
        date,
        time: slot
      }
    });
  } catch (error) {
    console.error('Error booking therapy session:', error);
    res.status(500).json({ error: 'Failed to book therapy session' });
  }
});

// Get user's scheduled sessions
router.get('/my-sessions', requireUser, async (req, res) => {
  try {
    const sessions = await Session.find({ user: req.user._id })
      .populate('therapist', 'name specialization')
      .sort({ date: 1 });
    
    res.status(200).json({
      sessions: sessions.map(s => ({
        _id: s._id,
        therapist: {
          name: s.therapist.name,
          specialization: s.therapist.specialization
        },
        date: s.date,
        time: s.time,
        status: s.status
      }))
    });
  } catch (error) {
    console.error('Error fetching user sessions:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Ask for wellness advice
router.post('/advice', requireUser, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question) {
      return res.status(400).json({ error: 'Question is required' });
    }
    
    // Using LLM service to generate advice
    const prompt = `
      You are a mental health and wellness advisor for workers.
      Provide thoughtful, supportive advice to the following question related to 
      mental health, stress, or workplace wellness.
      Keep your answer helpful, brief, and empathetic.
      
      User's question: ${question}
    `;
    
    let advice;
    try {
      // Try to use LLM service first
      advice = await sendLLMRequest('anthropic', 'claude-instant-1', prompt);
    } catch (llmError) {
      console.error('LLM service error:', llmError);
      // Fallback responses if LLM service fails
      const fallbackResponses = [
        "Taking regular breaks can help manage your stress levels. Try the 25/5 Pomodoro technique.",
        "Physical exercise, even just a short walk, can significantly improve your mental well-being.",
        "Consider talking to a professional therapist if you're feeling overwhelmed consistently.",
        "Mindfulness meditation has been proven to help with stress management and focus.",
        "Setting boundaries between work and personal time is essential for long-term wellness."
      ];
      advice = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];
    }
    
    // Save the advice to the database
    const mentalHealthAdvice = new MentalHealthAdvice({
      user: req.user._id,
      question,
      advice
    });
    
    await mentalHealthAdvice.save();
    
    res.status(200).json({
      advice
    });
  } catch (error) {
    console.error('Error generating wellness advice:', error);
    res.status(500).json({ error: 'Failed to generate advice' });
  }
});

module.exports = router;
