const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const { Task, Bid, Job } = require('../models/models.js');
const router = express.Router();

// Get available tasks
router.get('/tasks', requireUser, async (req, res) => {
  try {
    const tasks = await Task.find({ status: 'open' })
      .populate('employer', 'name')
      .sort({ createdAt: -1 });
      
    const tasksWithBids = await Promise.all(tasks.map(async task => {
      const bidCount = await Bid.countDocuments({ task: task._id });
      return {
        _id: task._id,
        title: task.title,
        description: task.description,
        budget: task.budget,
        skills: task.skills || [],
        deadline: task.deadline,
        bids: bidCount
      };
    }));
    
    res.status(200).json({ tasks: tasksWithBids });
  } catch (error) {
    console.error('Error fetching marketplace tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Submit a bid
router.post('/tasks/:id/bid', requireUser, async (req, res) => {
  try {
    const { amount, proposal, timeframe } = req.body;
    const taskId = req.params.id;
    
    if (!amount || !proposal || !timeframe) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const task = await Task.findById(taskId);
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    
    if (task.status !== 'open') {
      return res.status(400).json({ error: 'Task is no longer open for bidding' });
    }
    
    // Check if user already has a bid for this task
    const existingBid = await Bid.findOne({
      task: taskId,
      worker: req.user._id
    });
    
    if (existingBid) {
      // Update the existing bid
      existingBid.amount = amount;
      existingBid.proposal = proposal;
      existingBid.timeframe = timeframe;
      await existingBid.save();
      
      return res.status(200).json({
        success: true,
        message: 'Bid updated successfully'
      });
    }
    
    // Create a new bid
    const bid = new Bid({
      task: taskId,
      worker: req.user._id,
      amount,
      proposal,
      timeframe
    });
    
    await bid.save();
    
    res.status(201).json({
      success: true,
      message: 'Bid submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting bid:', error);
    res.status(500).json({ error: 'Failed to submit bid' });
  }
});

// Get user's bids
router.get('/my-bids', requireUser, async (req, res) => {
  try {
    const bids = await Bid.find({ worker: req.user._id })
      .populate({
        path: 'task',
        select: 'title description budget deadline status'
      })
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      bids: bids.map(b => ({
        _id: b._id,
        task: b.task,
        amount: b.amount,
        proposal: b.proposal,
        timeframe: b.timeframe,
        status: b.status,
        createdAt: b.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching user bids:', error);
    res.status(500).json({ error: 'Failed to fetch bids' });
  }
});

// Post a new task (for employers)
router.post('/tasks', requireUser, async (req, res) => {
  try {
    const { title, description, budget, skills, deadline } = req.body;
    
    if (!title || !description || !budget || !deadline) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Check if user role is employer
    if (req.user.role !== 'employer' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only employers can post tasks' });
    }
    
    const task = new Task({
      title,
      description,
      budget: {
        min: budget.min,
        max: budget.max
      },
      skills: skills || [],
      deadline: new Date(deadline),
      employer: req.user._id,
      status: 'open'
    });
    
    await task.save();
    
    res.status(201).json({
      success: true,
      taskId: task._id
    });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ error: 'Failed to create task' });
  }
});

// Get available jobs
router.get('/jobs', requireUser, async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 });
    res.status(200).json({ jobs });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    res.status(500).json({ error: 'Failed to fetch jobs' });
  }
});

// Post a new job
router.post('/jobs', requireUser, async (req, res) => {
  try {
    const { title, description, company, location, salary, skills } = req.body;
    
    if (!title || !description || !company || !location || !salary) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const job = new Job({
      title,
      description,
      company,
      location,
      salary,
      skills: skills || []
    });
    
    await job.save();
    
    res.status(201).json({
      success: true,
      jobId: job._id
    });
  } catch (error) {
    console.error('Error creating job:', error);
    res.status(500).json({ error: 'Failed to create job' });
  }
});

module.exports = router;
