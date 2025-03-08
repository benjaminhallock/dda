const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const { Union, Forum, Topic, Vote } = require('../models/models.js');
const router = express.Router();

// Get all unions
router.get('/', requireUser, async (req, res) => {
  try {
    const unions = await Union.find()
      .sort({ createdAt: -1 });
    
    res.status(200).json({ unions });
  } catch (error) {
    console.error('Error fetching unions:', error);
    res.status(500).json({ error: 'Failed to fetch unions' });
  }
});

// Create a new union
router.post('/', requireUser, async (req, res) => {
  try {
    const { name, description } = req.body;
    
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required' });
    }
    
    const union = new Union({
      name,
      description,
      members: [req.user._id],
      admins: [req.user._id]
    });
    
    await union.save();
    
    res.status(201).json({
      success: true,
      unionId: union._id
    });
  } catch (error) {
    console.error('Error creating union:', error);
    res.status(500).json({ error: 'Failed to create union' });
  }
});

// Get specific union
router.get('/:id', requireUser, async (req, res) => {
  try {
    const union = await Union.findById(req.params.id)
      .populate('members', 'name email status')
      .populate('admins', 'name email');
    
    if (!union) {
      return res.status(404).json({ error: 'Union not found' });
    }
    
    // Check if user is a member
    const isMember = union.members.some(member => member._id.toString() === req.user._id.toString());
    
    if (!isMember) {
      return res.status(403).json({ error: 'You are not a member of this union' });
    }
    
    res.status(200).json({ union });
  } catch (error) {
    console.error('Error fetching union:', error);
    res.status(500).json({ error: 'Failed to fetch union' });
  }
});

// Join a union
router.post('/:id/join', requireUser, async (req, res) => {
  try {
    const union = await Union.findById(req.params.id);
    
    if (!union) {
      return res.status(404).json({ error: 'Union not found' });
    }
    
    // Check if user is already a member
    if (union.members.includes(req.user._id)) {
      return res.status(400).json({ error: 'Already a member' });
    }
    
    union.members.push(req.user._id);
    await union.save();
    
    res.status(200).json({
      success: true,
      message: 'Joined union successfully'
    });
  } catch (error) {
    console.error('Error joining union:', error);
    res.status(500).json({ error: 'Failed to join union' });
  }
});

// Leave a union
router.post('/:id/leave', requireUser, async (req, res) => {
  try {
    const union = await Union.findById(req.params.id);
    
    if (!union) {
      return res.status(404).json({ error: 'Union not found' });
    }
    
    // Cannot leave if you're the only admin
    if (
      union.admins.length === 1 && 
      union.admins[0].toString() === req.user._id.toString()
    ) {
      return res.status(400).json({ 
        error: 'Cannot leave union as the only admin. Transfer admin role first.' 
      });
    }
    
    union.members = union.members.filter(m => m.toString() !== req.user._id.toString());
    union.admins = union.admins.filter(a => a.toString() !== req.user._id.toString());
    await union.save();
    
    res.status(200).json({
      success: true,
      message: 'Left union successfully'
    });
  } catch (error) {
    console.error('Error leaving union:', error);
    res.status(500).json({ error: 'Failed to leave union' });
  }
});

// Get union forums
router.get('/:id/forums', requireUser, async (req, res) => {
  try {
    const union = await Union.findById(req.params.id);
    
    if (!union) {
      return res.status(404).json({ error: 'Union not found' });
    }
    
    // Check if user is a member
    if (!union.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not a member of this union' });
    }
    
    const forums = await Forum.find({ union: req.params.id });
    
    res.status(200).json({ forums });
  } catch (error) {
    console.error('Error fetching union forums:', error);
    res.status(500).json({ error: 'Failed to fetch forums' });
  }
});

// Create a forum in a union
router.post('/:id/forums', requireUser, async (req, res) => {
  try {
    const { title, description } = req.body;
    
    const union = await Union.findById(req.params.id);
    
    if (!union) {
      return res.status(404).json({ error: 'Union not found' });
    }
    
    // Check if user is an admin
    if (!union.admins.includes(req.user._id)) {
      return res.status(403).json({ error: 'Only union admins can create forums' });
    }
    
    const forum = new Forum({
      title,
      description,
      union: req.params.id
    });
    
    await forum.save();
    
    res.status(201).json({
      success: true,
      forumId: forum._id
    });
  } catch (error) {
    console.error('Error creating forum:', error);
    res.status(500).json({ error: 'Failed to create forum' });
  }
});

// Get topics in a forum
router.get('/forums/:forumId/topics', requireUser, async (req, res) => {
  try {
    const forum = await Forum.findById(req.params.forumId)
      .populate('union');
    
    if (!forum) {
      return res.status(404).json({ error: 'Forum not found' });
    }
    
    // Check if user is a member of the union
    const union = await Union.findById(forum.union);
    if (!union.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not a member of this union' });
    }
    
    const topics = await Topic.find({ forum: req.params.forumId })
      .populate('author', 'name')
      .sort({ createdAt: -1 });
    
    res.status(200).json({
      topics: topics.map(t => ({
        _id: t._id,
        title: t.title,
        author: t.author.name,
        replies: t.replies.length,
        views: t.views,
        lastReply: t.replies.length > 0 ? {
          author: t.replies[t.replies.length - 1].author.name,
          date: t.replies[t.replies.length - 1].createdAt
        } : null,
        createdAt: t.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching topics:', error);
    res.status(500).json({ error: 'Failed to fetch topics' });
  }
});

// Create a topic in a forum
router.post('/forums/:forumId/topics', requireUser, async (req, res) => {
  try {
    const { title, content } = req.body;
    
    const forum = await Forum.findById(req.params.forumId)
      .populate('union');
    
    if (!forum) {
      return res.status(404).json({ error: 'Forum not found' });
    }
    
    // Check if user is a member of the union
    const union = await Union.findById(forum.union);
    if (!union.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not a member of this union' });
    }
    
    const topic = new Topic({
      forum: req.params.forumId,
      title,
      content,
      author: req.user._id
    });
    
    await topic.save();
    
    res.status(201).json({
      success: true,
      topicId: topic._id
    });
  } catch (error) {
    console.error('Error creating topic:', error);
    res.status(500).json({ error: 'Failed to create topic' });
  }
});

// Get a specific topic with replies
router.get('/topics/:topicId', requireUser, async (req, res) => {
  try {
    const topic = await Topic.findById(req.params.topicId)
      .populate('author', 'name')
      .populate('forum')
      .populate({
        path: 'replies.author',
        select: 'name'
      });
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    // Check if user is a member of the union
    const forum = await Forum.findById(topic.forum);
    const union = await Union.findById(forum.union);
    if (!union.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not a member of this union' });
    }
    
    // Increment view count
    topic.views += 1;
    await topic.save();
    
    res.status(200).json({ topic });
  } catch (error) {
    console.error('Error fetching topic:', error);
    res.status(500).json({ error: 'Failed to fetch topic' });
  }
});

// Reply to a topic
router.post('/topics/:topicId/reply', requireUser, async (req, res) => {
  try {
    const { content } = req.body;
    
    const topic = await Topic.findById(req.params.topicId)
      .populate('forum');
    
    if (!topic) {
      return res.status(404).json({ error: 'Topic not found' });
    }
    
    // Check if user is a member of the union
    const forum = await Forum.findById(topic.forum);
    const union = await Union.findById(forum.union);
    if (!union.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not a member of this union' });
    }
    
    topic.replies.push({
      author: req.user._id,
      content
    });
    
    await topic.save();
    
    res.status(200).json({
      success: true,
      message: 'Reply added successfully'
    });
  } catch (error) {
    console.error('Error adding reply:', error);
    res.status(500).json({ error: 'Failed to add reply' });
  }
});

// Get union votes
router.get('/:id/votes', requireUser, async (req, res) => {
  try {
    const union = await Union.findById(req.params.id);
    
    if (!union) {
      return res.status(404).json({ error: 'Union not found' });
    }
    
    // Check if user is a member
    if (!union.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not a member of this union' });
    }
    
    const votes = await Vote.find({ union: req.params.id })
      .sort({ createdAt: -1 });
    
    res.status(200).json({ votes });
  } catch (error) {
    console.error('Error fetching union votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

// Submit a vote
router.post('/votes/:id/submit', requireUser, async (req, res) => {
  try {
    const { vote } = req.body;
    
    const voteRecord = await Vote.findById(req.params.id);
    
    if (!voteRecord) {
      return res.status(404).json({ error: 'Vote not found' });
    }
    
    // Check if user is a member of the union
    const union = await Union.findById(voteRecord.union);
    if (!union.members.includes(req.user._id)) {
      return res.status(403).json({ error: 'Not a member of this union' });
    }
    
    // Update vote counts
    if (vote === 'for') {
      voteRecord.votesFor += 1;
    } else if (vote === 'against') {
      voteRecord.votesAgainst += 1;
    } else {
      return res.status(400).json({ error: 'Invalid vote' });
    }
    
    await voteRecord.save();
    
    res.status(200).json({
      success: true,
      message: 'Vote submitted successfully'
    });
  } catch (error) {
    console.error('Error submitting vote:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
});

module.exports = router;
