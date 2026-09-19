const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Problem = require('./models/Problem.js');
dotenv.config();
const problems = [
  // Arrays
  { problem_id: "1", title: "Two Sum", difficulty: "Easy", topic: "Arrays", acceptance_rate: 0.52, url: "https://leetcode.com/problems/two-sum/" },
  { problem_id: "26", title: "Remove Duplicates from Sorted Array", difficulty: "Easy", topic: "Arrays", acceptance_rate: 0.55, url: "https://leetcode.com/problems/remove-duplicates-from-sorted-array/" },
  { problem_id: "11", title: "Container With Most Water", difficulty: "Medium", topic: "Arrays", acceptance_rate: 0.54, url: "https://leetcode.com/problems/container-with-most-water/" },
  { problem_id: "15", title: "3Sum", difficulty: "Medium", topic: "Arrays", acceptance_rate: 0.34, url: "https://leetcode.com/problems/3sum/" },
  { problem_id: "41", title: "First Missing Positive", difficulty: "Hard", topic: "Arrays", acceptance_rate: 0.38, url: "https://leetcode.com/problems/first-missing-positive/" },
  // Strings
  { problem_id: "344", title: "Reverse String", difficulty: "Easy", topic: "Strings", acceptance_rate: 0.77, url: "https://leetcode.com/problems/reverse-string/" },
  { problem_id: "3", title: "Longest Substring Without Repeating Characters", difficulty: "Medium", topic: "Strings", acceptance_rate: 0.34, url: "https://leetcode.com/problems/longest-substring-without-repeating-characters/" },
  { problem_id: "5", title: "Longest Palindromic Substring", difficulty: "Medium", topic: "Strings", acceptance_rate: 0.33, url: "https://leetcode.com/problems/longest-palindromic-substring/" },
  { problem_id: "76", title: "Minimum Window Substring", difficulty: "Hard", topic: "Strings", acceptance_rate: 0.42, url: "https://leetcode.com/problems/minimum-window-substring/" },
  // Binary Search
  { problem_id: "704", title: "Binary Search", difficulty: "Easy", topic: "Binary Search", acceptance_rate: 0.57, url: "https://leetcode.com/problems/binary-search/" },
  { problem_id: "35", title: "Search Insert Position", difficulty: "Easy", topic: "Binary Search", acceptance_rate: 0.44, url: "https://leetcode.com/problems/search-insert-position/" },
  { problem_id: "33", title: "Search in Rotated Sorted Array", difficulty: "Medium", topic: "Binary Search", acceptance_rate: 0.40, url: "https://leetcode.com/problems/search-in-rotated-sorted-array/" },
  { problem_id: "153", title: "Find Minimum in Rotated Sorted Array", difficulty: "Medium", topic: "Binary Search", acceptance_rate: 0.49, url: "https://leetcode.com/problems/find-minimum-in-rotated-sorted-array/" },
  { problem_id: "4", title: "Median of Two Sorted Arrays", difficulty: "Hard", topic: "Binary Search", acceptance_rate: 0.39, url: "https://leetcode.com/problems/median-of-two-sorted-arrays/" },
  // Trees
  { problem_id: "104", title: "Maximum Depth of Binary Tree", difficulty: "Easy", topic: "Trees", acceptance_rate: 0.74, url: "https://leetcode.com/problems/maximum-depth-of-binary-tree/" },
  { problem_id: "226", title: "Invert Binary Tree", difficulty: "Easy", topic: "Trees", acceptance_rate: 0.76, url: "https://leetcode.com/problems/invert-binary-tree/" },
  { problem_id: "102", title: "Binary Tree Level Order Traversal", difficulty: "Medium", topic: "Trees", acceptance_rate: 0.66, url: "https://leetcode.com/problems/binary-tree-level-order-traversal/" },
  { problem_id: "236", title: "Lowest Common Ancestor of a Binary Tree", difficulty: "Medium", topic: "Trees", acceptance_rate: 0.60, url: "https://leetcode.com/problems/lowest-common-ancestor-of-a-binary-tree/" },
  { problem_id: "124", title: "Binary Tree Maximum Path Sum", difficulty: "Hard", topic: "Trees", acceptance_rate: 0.39, url: "https://leetcode.com/problems/binary-tree-maximum-path-sum/" },
  // Graphs
  { problem_id: "1971", title: "Find if Path Exists in Graph", difficulty: "Easy", topic: "Graphs", acceptance_rate: 0.53, url: "https://leetcode.com/problems/find-if-path-exists-in-graph/" },
  { problem_id: "200", title: "Number of Islands", difficulty: "Medium", topic: "Graphs", acceptance_rate: 0.58, url: "https://leetcode.com/problems/number-of-islands/" },
  { problem_id: "133", title: "Clone Graph", difficulty: "Medium", topic: "Graphs", acceptance_rate: 0.55, url: "https://leetcode.com/problems/clone-graph/" },
  { problem_id: "207", title: "Course Schedule", difficulty: "Medium", topic: "Graphs", acceptance_rate: 0.46, url: "https://leetcode.com/problems/course-schedule/" },
  { problem_id: "269", title: "Alien Dictionary", difficulty: "Hard", topic: "Graphs", acceptance_rate: 0.35, url: "https://leetcode.com/problems/alien-dictionary/" },
  // Dynamic Programming
  { problem_id: "70", title: "Climbing Stairs", difficulty: "Easy", topic: "Dynamic Programming", acceptance_rate: 0.52, url: "https://leetcode.com/problems/climbing-stairs/" },
  { problem_id: "198", title: "House Robber", difficulty: "Medium", topic: "Dynamic Programming", acceptance_rate: 0.50, url: "https://leetcode.com/problems/house-robber/" },
  { problem_id: "322", title: "Coin Change", difficulty: "Medium", topic: "Dynamic Programming", acceptance_rate: 0.43, url: "https://leetcode.com/problems/coin-change/" },
  { problem_id: "300", title: "Longest Increasing Subsequence", difficulty: "Medium", topic: "Dynamic Programming", acceptance_rate: 0.54, url: "https://leetcode.com/problems/longest-increasing-subsequence/" },
  { problem_id: "72", title: "Edit Distance", difficulty: "Hard", topic: "Dynamic Programming", acceptance_rate: 0.55, url: "https://leetcode.com/problems/edit-distance/" },
  // Linked List
  { problem_id: "206", title: "Reverse Linked List", difficulty: "Easy", topic: "Linked List", acceptance_rate: 0.75, url: "https://leetcode.com/problems/reverse-linked-list/" },
  { problem_id: "141", title: "Linked List Cycle", difficulty: "Easy", topic: "Linked List", acceptance_rate: 0.49, url: "https://leetcode.com/problems/linked-list-cycle/" },
  { problem_id: "19", title: "Remove Nth Node From End of List", difficulty: "Medium", topic: "Linked List", acceptance_rate: 0.43, url: "https://leetcode.com/problems/remove-nth-node-from-end-of-list/" },
  { problem_id: "142", title: "Linked List Cycle II", difficulty: "Medium", topic: "Linked List", acceptance_rate: 0.49, url: "https://leetcode.com/problems/linked-list-cycle-ii/" },
  { problem_id: "25", title: "Reverse Nodes in k-Group", difficulty: "Hard", topic: "Linked List", acceptance_rate: 0.56, url: "https://leetcode.com/problems/reverse-nodes-in-k-group/" },
  // Stack
  { problem_id: "20", title: "Valid Parentheses", difficulty: "Easy", topic: "Stack", acceptance_rate: 0.41, url: "https://leetcode.com/problems/valid-parentheses/" },
  { problem_id: "155", title: "Min Stack", difficulty: "Medium", topic: "Stack", acceptance_rate: 0.53, url: "https://leetcode.com/problems/min-stack/" },
  { problem_id: "150", title: "Evaluate Reverse Polish Notation", difficulty: "Medium", topic: "Stack", acceptance_rate: 0.48, url: "https://leetcode.com/problems/evaluate-reverse-polish-notation/" },
  { problem_id: "84", title: "Largest Rectangle in Histogram", difficulty: "Hard", topic: "Stack", acceptance_rate: 0.44, url: "https://leetcode.com/problems/largest-rectangle-in-histogram/" }
];
const seedDatabase = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/ai-leetcode-tracker';
    await mongoose.connect(mongoUri);
    console.log('Connected to MongoDB for seeding...');
    await Problem.deleteMany({});
    console.log('Cleared existing problems.');
    await Problem.insertMany(problems);
    console.log(`Successfully seeded ${problems.length} problems!`);
    await mongoose.connection.close();
    console.log('Database connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};
seedDatabase();
