const mongoose = require('mongoose');
const ProblemSchema = new mongoose.Schema({
  problem_id: {
    type: String,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: true
  },
  difficulty: {
    type: String,
    enum: ['Easy', 'Medium', 'Hard'],
    required: true
  },
  topic: {
    type: String,
    enum: ['Arrays', 'Strings', 'Binary Search', 'Trees', 'Graphs', 'Dynamic Programming', 'Linked List', 'Stack'],
    required: true
  },
  acceptance_rate: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  url: {
    type: String
  }
});
module.exports = mongoose.model('Problem', ProblemSchema);
