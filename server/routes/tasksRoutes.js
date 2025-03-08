const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const { Task } = require('../models/models.js');
const router = express.Router();

// Get list of tasks for current user
router.get('/', requireUser, async (req, res) => {
  try {
    const tasks = await Task.find({ worker: req.user._id })
      .sort({ createdAt: -1 });
    res.status(200).json({ tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ error: 'Failed to fetch tasks' });
  }
});

// Submit completed task
router.post('/:id/complete', requireUser, async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id, worker: req.user._id });
    if (!task) {
      return res.status(404).json({ error: 'Task not found' });
    }
    task.status = 'completed';
    await task.save();
    res.status(200).json({ success: true, message: 'Task completed successfully' });
  } catch (error) {
    console.error('Error completing task:', error);
    res.status(500).json({ error: 'Failed to complete task' });
  }
});

module.exports = router;
