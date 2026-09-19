const mongoose = require('mongoose');
const SubmissionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  problem: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true
  },
  status: {
    type: String,
    enum: ['Solved', 'Failed'],
    required: true
  },
  attempts: {
    type: Number,
    required: true,
    min: 1
  },
  time_taken: {
    type: Number,
    required: true, // in minutes
    min: 1
  },
  hints_used: {
    type: Number,
    default: 0,
    min: 0
  },
  submitted_at: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Submission', SubmissionSchema);

