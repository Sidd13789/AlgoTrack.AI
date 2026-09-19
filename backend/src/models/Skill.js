const mongoose = require('mongoose');
const SkillSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  skills: {
    type: Map,
    of: Number,
   default: {
    'Arrays': 0,
    'Strings': 0,
    'Binary Search': 0,
    'Trees': 0,
    'Graphs': 0,
    'Dynamic Programming': 0,
    'Linked List': 0,
    'Stack': 0
    }
  },
  streak: {
    type: Number,
    default: 0
  },
  lastActiveDate: {
    type: Date
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});
module.exports = mongoose.model('Skill', SkillSchema);
