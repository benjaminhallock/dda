const mongoose = require('mongoose');
const { Schema } = mongoose;

// Task Schema
const taskSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  budget: {
    min: { type: Number, required: true },
    max: { type: Number, required: true }
  },
  skills: [{ type: String }],
  deadline: { type: Date, required: true },
  status: { type: String, enum: ['open', 'assigned', 'completed', 'cancelled'], default: 'open' },
  employer: { type: Schema.Types.ObjectId, ref: 'User' },
  worker: { type: Schema.Types.ObjectId, ref: 'User' },
  createdAt: { type: Date, default: Date.now }
});

// Bid Schema
const bidSchema = new Schema({
  task: { type: Schema.Types.ObjectId, ref: 'Task', required: true },
  worker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  proposal: { type: String, required: true },
  timeframe: { type: Number, required: true }, // Days to complete
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Payment Schema
const paymentSchema = new Schema({
  sender: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  recipient: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { 
    btc: { type: String, required: true },
    usd: { type: Number, required: true }
  },
  task: { type: Schema.Types.ObjectId, ref: 'Task' },
  status: { type: String, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  txHash: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Timecard Schema
const timecardSchema = new Schema({
  worker: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  employer: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, required: true },
  hours: { type: Number, required: true },
  amount: {
    btc: { type: String, required: true },
    usd: { type: Number, required: true }
  },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

// Wellness Schema
const wellnessSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  date: { type: Date, default: Date.now },
  stressScore: { type: Number, min: 0, max: 100 },
  wellnessScore: { type: Number, min: 0, max: 100 },
  notes: { type: String }
});

// Therapist Schema
const therapistSchema = new Schema({
  name: { type: String, required: true },
  specialization: { type: String, required: true },
  rating: { type: Number, default: 4.5 },
  availability: [{
    date: { type: Date },
    slots: [{ type: String }]
  }]
});

// Session Schema
const sessionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  therapist: { type: Schema.Types.ObjectId, ref: 'Therapist', required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'completed', 'cancelled'], default: 'scheduled' },
  notes: { type: String },
  createdAt: { type: Date, default: Date.now }
});

// Union Schema
const unionSchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  members: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  admins: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now }
});

// Discussion Schema (Forums)
const forumSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  union: { type: Schema.Types.ObjectId, ref: 'Union' }
});

const topicSchema = new Schema({
  forum: { type: Schema.Types.ObjectId, ref: 'Forum', required: true },
  title: { type: String, required: true },
  content: { type: String, required: true },
  author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  replies: [{ 
    author: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  views: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

// Data Monetization Schema
const dataSharingCategorySchema = new Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  paymentRate: { type: Number, required: true } // Payment per month
});

const userDataSharingSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  category: { type: Schema.Types.ObjectId, ref: 'DataSharingCategory', required: true },
  enabled: { type: Boolean, default: false },
  updatedAt: { type: Date, default: Date.now }
});

// Wallet Schema
const walletSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  address: { type: String },
  balance: {
    btc: { type: String, default: "0" },
    usd: { type: Number, default: 0 }
  },
  isConnected: { type: Boolean, default: false }
});

// Job Schema
const jobSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  company: { type: String, required: true },
  location: { type: String, required: true },
  salary: { type: Number, required: true },
  skills: [{ type: String }],
  createdAt: { type: Date, default: Date.now }
});

// Mental Health Advice Schema
const mentalHealthAdviceSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  question: { type: String, required: true },
  advice: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

// Register models
const Task = mongoose.model('Task', taskSchema);
const Bid = mongoose.model('Bid', bidSchema);
const Payment = mongoose.model('Payment', paymentSchema);
const Timecard = mongoose.model('Timecard', timecardSchema);
const Wellness = mongoose.model('Wellness', wellnessSchema);
const Therapist = mongoose.model('Therapist', therapistSchema);
const Session = mongoose.model('Session', sessionSchema);
const Union = mongoose.model('Union', unionSchema);
const Forum = mongoose.model('Forum', forumSchema);
const Topic = mongoose.model('Topic', topicSchema);
const DataSharingCategory = mongoose.model('DataSharingCategory', dataSharingCategorySchema);
const UserDataSharing = mongoose.model('UserDataSharing', userDataSharingSchema);
const Wallet = mongoose.model('Wallet', walletSchema);
const Job = mongoose.model('Job', jobSchema);
const MentalHealthAdvice = mongoose.model('MentalHealthAdvice', mentalHealthAdviceSchema);

module.exports = {
  Task,
  Bid,
  Payment,
  Timecard,
  Wellness,
  Therapist,
  Session,
  Union,
  Forum,
  Topic,
  DataSharingCategory,
  UserDataSharing,
  Wallet,
  Job,
  MentalHealthAdvice
};
