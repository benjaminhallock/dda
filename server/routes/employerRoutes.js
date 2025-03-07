const express = require('express');
const { requireUser } = require('./middleware/auth.js');
const { Task, Timecard, Payment, Wallet, User } = require('../models/models.js');
const UserService = require('../services/userService.js');
const router = express.Router();

// Middleware to ensure user is an employer
const requireEmployer = async (req, res, next) => {
  if (req.user.role !== 'employer' && req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Access denied. Employer role required.' });
  }
  next();
};

// Get employer dashboard data
router.get('/dashboard', requireUser, requireEmployer, async (req, res) => {
  try {
    // Get count of workers with assigned tasks from this employer
    const activeWorkers = await Task.countDocuments({ 
      employer: req.user._id, 
      status: 'assigned'
    });
    
    // Get pending payments amount
    const pendingPayments = await Payment.aggregate([
      { 
        $match: { 
          sender: req.user._id,
          status: 'pending'
        }
      },
      {
        $group: {
          _id: null,
          totalBtc: { $sum: "$amount.btc" },
          totalUsd: { $sum: "$amount.usd" }
        }
      }
    ]);
    
    // Get employer wallet
    const wallet = await Wallet.findOne({ user: req.user._id });
    
    res.status(200).json({
      activeWorkers,
      pendingPayments: {
        btc: pendingPayments[0]?.totalBtc || "0",
        usd: pendingPayments[0]?.totalUsd || 0
      },
      walletBalance: wallet ? wallet.balance : { btc: "0", usd: 0 }
    });
  } catch (error) {
    console.error('Error fetching employer dashboard data:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get available workers
router.get('/workers', requireUser, requireEmployer, async (req, res) => {
  try {
    const workers = await User.find({ role: 'worker' })
      .select('_id name profile.skills profile.hourlyRate status');
      
    res.status(200).json({
      workers: workers.map(w => ({
        _id: w._id,
        name: w.name || 'Anonymous Worker',
        skills: w.profile?.skills || [],
        rating: 4.7, // TODO: Implement actual rating system
        hourlyRate: w.profile?.hourlyRate || { btc: "0.001", usd: 42.50 },
        status: w.status || 'offline'
      }))
    });
  } catch (error) {
    console.error('Error fetching workers:', error);
    res.status(500).json({ error: 'Failed to fetch workers' });
  }
});

// Hire a worker
router.post('/hire', requireUser, requireEmployer, async (req, res) => {
  try {
    const { workerId, taskDetails, hours, paymentAmount } = req.body;
    
    if (!workerId || !taskDetails || !hours || !paymentAmount) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    const worker = await User.findById(workerId);
    if (!worker) {
      return res.status(404).json({ error: 'Worker not found' });
    }
    
    // Create a new task
    const task = new Task({
      title: taskDetails,
      description: `Task for ${hours} hours of work`,
      budget: {
        min: paymentAmount.usd * 0.9,
        max: paymentAmount.usd * 1.1
      },
      employer: req.user._id,
      worker: workerId,
      status: 'assigned',
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
    });
    
    await task.save();
    
    res.status(201).json({
      success: true,
      contractId: task._id
    });
  } catch (error) {
    console.error('Error hiring worker:', error);
    res.status(500).json({ error: 'Failed to hire worker' });
  }
});

// Get timecards
router.get('/timecards', requireUser, requireEmployer, async (req, res) => {
  try {
    const timecards = await Timecard.find({ employer: req.user._id })
      .populate('worker', 'name')
      .sort({ date: -1 });
      
    res.status(200).json({
      timecards: timecards.map(t => ({
        _id: t._id,
        workerId: t.worker._id,
        workerName: t.worker.name || 'Anonymous Worker',
        date: t.date,
        hours: t.hours,
        status: t.status,
        amount: t.amount
      }))
    });
  } catch (error) {
    console.error('Error fetching timecards:', error);
    res.status(500).json({ error: 'Failed to fetch timecards' });
  }
});

// Approve timecard
router.post('/timecards/:id/approve', requireUser, requireEmployer, async (req, res) => {
  try {
    const timecard = await Timecard.findOne({ 
      _id: req.params.id,
      employer: req.user._id
    });
    
    if (!timecard) {
      return res.status(404).json({ error: 'Timecard not found' });
    }
    
    timecard.status = 'approved';
    await timecard.save();
    
    // Create a pending payment
    const payment = new Payment({
      sender: req.user._id,
      recipient: timecard.worker,
      amount: timecard.amount,
      status: 'pending'
    });
    
    await payment.save();
    
    res.status(200).json({
      success: true,
      message: 'Timecard approved and payment scheduled'
    });
  } catch (error) {
    console.error('Error approving timecard:', error);
    res.status(500).json({ error: 'Failed to approve timecard' });
  }
});

// Get payment history
router.get('/payments', requireUser, requireEmployer, async (req, res) => {
  try {
    const payments = await Payment.find({ sender: req.user._id })
      .populate('recipient', 'name')
      .sort({ createdAt: -1 });
      
    res.status(200).json({
      transactions: payments.map(p => ({
        _id: p._id,
        date: p.createdAt,
        recipient: p.recipient.name || 'Anonymous Worker',
        amount: p.amount,
        status: p.status,
        txHash: p.txHash || '0x...'
      }))
    });
  } catch (error) {
    console.error('Error fetching payment history:', error);
    res.status(500).json({ error: 'Failed to fetch payment history' });
  }
});

// Process a payment
router.post('/payments/:id/process', requireUser, requireEmployer, async (req, res) => {
  try {
    const payment = await Payment.findOne({
      _id: req.params.id,
      sender: req.user._id,
      status: 'pending'
    });
    
    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Get sender and recipient wallets
    const senderWallet = await Wallet.findOne({ user: req.user._id });
    const recipientWallet = await Wallet.findOne({ user: payment.recipient });
    
    if (!senderWallet || !recipientWallet) {
      return res.status(400).json({ error: 'Wallet not found' });
    }
    
    // Check if sender has enough balance
    const senderBtcBalance = parseFloat(senderWallet.balance.btc);
    const paymentBtcAmount = parseFloat(payment.amount.btc);
    
    if (senderBtcBalance < paymentBtcAmount) {
      return res.status(400).json({ error: 'Insufficient balance' });
    }
    
    // Update wallets (in a real system, this would interact with a blockchain)
    senderWallet.balance.btc = (senderBtcBalance - paymentBtcAmount).toString();
    senderWallet.balance.usd -= payment.amount.usd;
    
    recipientWallet.balance.btc = (parseFloat(recipientWallet.balance.btc) + paymentBtcAmount).toString();
    recipientWallet.balance.usd += payment.amount.usd;
    
    // Update payment status
    payment.status = 'completed';
    payment.txHash = `0x${Math.random().toString(16).substring(2, 15)}`;
    
    // Save all changes
    await Promise.all([
      senderWallet.save(),
      recipientWallet.save(),
      payment.save()
    ]);
    
    res.status(200).json({
      success: true,
      txHash: payment.txHash
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ error: 'Failed to process payment' });
  }
});

module.exports = router;
