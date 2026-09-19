const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const dotenv = require('dotenv');
// Load env vars
dotenv.config();
// Models
const User = require('./models/User.js');
const Problem = require('./models/Problem.js');
const Submission = require('./models/Submission.js');
const Skill = require('./models/Skill.js');
const app = express();
app.use(cors());
app.use(express.json());
const PORT = process.env.PORT || 5000;
const JWT_SECRET =process.env.JWT_SECRET || 'leetcode_ai_coach_secret_998877';
const ML_SERVICE_URL =
  process.env.ML_SERVICE_URL || 'http://127.0.0.1:8000';
// ======================================================
// Connect to MongoDB
// ======================================================
mongoose
  .connect(
    process.env.MONGO_URI ||
      'mongodb://127.0.0.1:27017/ai-leetcode-tracker'
  )
  .then(async () => {
    console.log('Connected to MongoDB...');
    // Check whether .env MONGO_URI is loaded
    console.log(
      'MONGO URI EXISTS:',
      !!process.env.MONGO_URI
    );
    // Show actual MongoDB server host
    console.log(
      'MONGO HOST:',
      mongoose.connection.host
    );
    // Show database name
    console.log(
      'DATABASE NAME:',
      mongoose.connection.name
    );
    // Check existing collections
    try {
      const collections =
        await mongoose.connection.db
          .listCollections()
          .toArray();

      console.log(
        'COLLECTIONS:',
        collections.map(
          (collection) => collection.name
        )
      );
    } catch (error) {
      console.error(
        'Could not fetch collections:',
        error
      );
    }
  })
  .catch((err) => {
    console.error(
      'Could not connect to MongoDB:',
      err
    );
  });
// ======================================================
// Auth Middleware
// ======================================================
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token =authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      error: 'Access denied. Token missing.',
    });
  }
  jwt.verify(
    token,
    JWT_SECRET,
    (err, user) => {
      if (err) {
        return res.status(403).json({
          error: 'Invalid token.',
        });
      }
      req.userId = user.id;
      next();
    }
  );
};
// ======================================================
// AUTHENTICATION ROUTES
// ======================================================
app.post(
  '/api/auth/register',
  async (req, res) => {
    try {
      const {
        username,
        email,
        password,
        skillLevel,
        targetRole,
      } = req.body;
      // Check if user exists
      let existingUser =
        await User.findOne({
          $or: [
            { email },
            { username },
          ],
        });

      if (existingUser) {
        return res.status(400).json({
          error:
            'Username or Email already registered',
        });
      }
      // Hash password
      const salt =
        await bcrypt.genSalt(10);
      const hashedPassword =
        await bcrypt.hash(
          password,
          salt
        );
      // Create User
      const user = new User({
        username,
        email,
        password: hashedPassword,
        skillLevel:
          skillLevel || 'Beginner',
        targetRole:
          targetRole ||
          'General FAANG Prep',
      });
      await user.save();
      console.log(
        'USER SAVED:',
        user._id
      );
      // Map skill level to baseline skill ratings
      let baselineVal = 0.3;
      if (
        skillLevel === 'Intermediate'
      ) {
        baselineVal = 0.55;
      }

      if (
        skillLevel === 'Advanced'
      ) {
        baselineVal = 0.8;
      }

      const initialSkills = {
        Arrays: baselineVal,
        Strings: baselineVal,
        'Binary Search': baselineVal,
        Trees: baselineVal,
        Graphs: baselineVal,
        'Dynamic Programming':
          baselineVal,
        'Linked List': baselineVal,
        Stack: baselineVal,
      };

      // Create default skill profile
      const userSkills =
        new Skill({
          user: user._id,
          skills: initialSkills,
          streak: 0,
        });

      await userSkills.save();

      console.log(
        'SKILL PROFILE SAVED:',
        userSkills._id
      );

      // Generate Token
      const token = jwt.sign(
        { id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.status(201).json({
        token,

        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          skillLevel:
            user.skillLevel,
          targetRole:
            user.targetRole,
        },
      });
    } catch (error) {
      console.error(
        'Registration error:',
        error
      );

      res.status(500).json({
        error:
          'Server error during registration',
      });
    }
  }
);
// ======================================================
// LOGIN
// ======================================================
app.post(
  '/api/auth/login',
  async (req, res) => {
    try {
      const {
        email,
        password,
      } = req.body;

      const user =
        await User.findOne({
          email,
        });

      if (!user) {
        return res.status(400).json({
          error:
            'Invalid email or password',
        });
      }

      const validPassword =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!validPassword) {
        return res.status(400).json({
          error:
            'Invalid email or password',
        });
      }

      const token = jwt.sign(
        { id: user._id },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      res.json({
        token,

        user: {
          id: user._id,
          username: user.username,
          email: user.email,
          skillLevel:
            user.skillLevel,
          targetRole:
            user.targetRole,
        },
      });
    } catch (error) {
      console.error(
        'Login error:',
        error
      );

      res.status(500).json({
        error:
          'Server error during login',
      });
    }
  }
);

// ======================================================
// PROFILE & ANALYTICS
// ======================================================

app.get(
  '/api/user/profile',
  authenticateToken,
  async (req, res) => {
    try {
      const user =
        await User.findById(
          req.userId
        ).select('-password');

      const skillProfile =
        await Skill.findOne({
          user: req.userId,
        });

      const submissions =
        await Submission.find({
          user: req.userId,
        }).populate('problem');

      const solvedCount =
        submissions.filter(
          (s) =>
            s.status === 'Solved'
        ).length;

      const totalCount =
        submissions.length;

      const successRate =
        totalCount > 0
          ? Math.round(
              (solvedCount /
                totalCount) *
                100
            )
          : 0;

      let totalSolveTime = 0;
      let solvedSubmissionsCount = 0;

      submissions.forEach((s) => {
        if (s.status === 'Solved') {
          totalSolveTime +=
            s.time_taken;

          solvedSubmissionsCount++;
        }
      });

      const avgSolveTime =
        solvedSubmissionsCount > 0
          ? Math.round(
              totalSolveTime /
                solvedSubmissionsCount
            )
          : 0;

      const topicStats = {};

      submissions.forEach((s) => {
        if (s.problem) {
          const topic =
            s.problem.topic;

          if (!topicStats[topic]) {
            topicStats[topic] = {
              total: 0,
              solved: 0,
            };
          }

          topicStats[topic].total++;

          if (
            s.status === 'Solved'
          ) {
            topicStats[topic].solved++;
          }
        }
      });

      res.json({
        user,

        skills: skillProfile
          ? skillProfile.skills
          : {},

        streak: skillProfile
          ? skillProfile.streak
          : 0,

        metrics: {
          problemsSolved:
            solvedCount,
          totalAttempts:
            totalCount,
          successRate,
          avgSolveTime,
        },

        topicStats,
      });
    } catch (error) {
      console.error(
        'Profile fetch error:',
        error
      );

      res.status(500).json({
        error:
          'Server error fetching profile',
      });
    }
  }
);

// ======================================================
// PROBLEMS
// ======================================================

app.get(
  '/api/problems',
  authenticateToken,
  async (req, res) => {
    try {
      const problems =
        await Problem.find({});

      res.json(problems);
    } catch (error) {
      res.status(500).json({
        error:
          'Failed to fetch problems',
      });
    }
  }
);

// ======================================================
// SUBMISSIONS
// ======================================================

app.post(
  '/api/submissions',
  authenticateToken,
  async (req, res) => {
    try {
      const {
        problem_id,
        status,
        attempts,
        time_taken,
        hints_used,
      } = req.body;

      const problem =
        await Problem.findOne({
          problem_id,
        });

      if (!problem) {
        return res.status(404).json({
          error:
            'Problem not found',
        });
      }

      // Create and Save Submission
      const submission =
        new Submission({
          user: req.userId,
          problem: problem._id,
          status,
          attempts,
          time_taken,
          hints_used:
            hints_used || 0,
        });

      await submission.save();

      // Fetch User Skill Profile
      let skillProfile =
        await Skill.findOne({
          user: req.userId,
        });

      if (!skillProfile) {
        skillProfile =
          new Skill({
            user: req.userId,
          });
      }

      const currentTopicSkill =
        skillProfile.skills.get(
          problem.topic
        ) || 0.3;

      const difficultyMap = {
        Easy: 1,
        Medium: 2,
        Hard: 3,
      };

      const diffNum =
        difficultyMap[
          problem.difficulty
        ] || 2;

      // FastAPI prediction
      let updatedSkillValue =
        currentTopicSkill;

      try {
        const updateResponse =
          await axios.post(
            `${ML_SERVICE_URL}/update-skill`,
            {
              current_skill:
                currentTopicSkill,

              success:
                status === 'Solved',

              difficulty_numeric:
                diffNum,

              hints_used:
                hints_used || 0,
            }
          );

        updatedSkillValue =
          updateResponse.data
            .updated_skill;
      } catch (mlError) {
        console.warn(
          'FastAPI skill update offline. Using fallback formula.'
        );

        if (status === 'Solved') {
          updatedSkillValue =
            Math.min(
              1.0,
              currentTopicSkill +
                0.1 *
                  (diffNum / 2) *
                  (1 -
                    0.2 *
                      (hints_used ||
                        0))
            );
        } else {
          updatedSkillValue =
            Math.max(
              0.05,
              currentTopicSkill -
                (0.05 *
                  (4 - diffNum)) /
                  2
            );
        }

        updatedSkillValue =
          parseFloat(
            updatedSkillValue.toFixed(
              3
            )
          );
      }

      // Update skill
      skillProfile.skills.set(
        problem.topic,
        updatedSkillValue
      );

      // Update streak
      const today = new Date();

      today.setHours(
        0,
        0,
        0,
        0
      );

      const lastActive =
        skillProfile.lastActiveDate
          ? new Date(
              skillProfile.lastActiveDate
            )
          : null;

      if (lastActive) {
        lastActive.setHours(
          0,
          0,
          0,
          0
        );

        const diffTime = Math.abs(
          today - lastActive
        );

        const diffDays =
          Math.ceil(
            diffTime /
              (1000 *
                60 *
                60 *
                24)
          );

        if (diffDays === 1) {
          skillProfile.streak +=
            1;
        } else if (
          diffDays > 1
        ) {
          skillProfile.streak = 1;
        }
      } else {
        skillProfile.streak = 1;
      }

      skillProfile.lastActiveDate =
        new Date();

      skillProfile.updatedAt =
        new Date();

      await skillProfile.save();

      res.status(201).json({
        message:
          'Submission logged successfully',

        submission,

        updated_skill:
          updatedSkillValue,

        streak:
          skillProfile.streak,
      });
    } catch (error) {
      console.error(
        'Submission logging error:',
        error
      );

      res.status(500).json({
        error:
          'Server error logging submission',
      });
    }
  }
);

// ======================================================
// PERSONALIZED RECOMMENDATIONS
// ======================================================

app.get(
  '/api/recommendations',
  authenticateToken,
  async (req, res) => {
    try {
      const { difficulty } =
        req.query;

      const skillProfile =
        await Skill.findOne({
          user: req.userId,
        });

      const userSkillsDict =
        skillProfile
          ? Object.fromEntries(
              skillProfile.skills
            )
          : {};

      const solvedSubmissions =
        await Submission.find({
          user: req.userId,
          status: 'Solved',
        }).populate('problem');

      const solvedProblemIds =
        solvedSubmissions
          .filter((s) => s.problem)
          .map(
            (s) =>
              s.problem.problem_id
          );

      const allProblems =
        await Problem.find({});

      try {
        const mlResponse =
          await axios.post(
            `${ML_SERVICE_URL}/recommend`,
            {
              user_skills:
                userSkillsDict,

              target_difficulty:
                difficulty || null,

              solved_problem_ids:
                solvedProblemIds,

              problems:
                allProblems.map(
                  (p) => ({
                    problem_id:
                      p.problem_id,
                    title: p.title,
                    difficulty:
                      p.difficulty,
                    topic: p.topic,
                    acceptance_rate:
                      p.acceptance_rate,
                  })
                ),
            }
          );

        res.json(
          mlResponse.data
        );
      } catch (mlError) {
        console.warn(
          'FastAPI recommendation offline. Using MERN fallback handler.',
          mlError.message
        );

        const fallbackRecs =
          allProblems
            .filter(
              (p) =>
                !solvedProblemIds.includes(
                  p.problem_id
                )
            )
            .filter(
              (p) =>
                !difficulty ||
                p.difficulty ===
                  difficulty
            )
            .slice(0, 5)
            .map((p) => ({
              problem_id:
                p.problem_id,

              title: p.title,

              difficulty:
                p.difficulty,

              topic: p.topic,

              acceptance_rate:
                p.acceptance_rate,

              success_prob:
                p.difficulty ===
                'Easy'
                  ? 0.85
                  : p.difficulty ===
                    'Medium'
                  ? 0.65
                  : 0.4,

              predicted_time:
                p.difficulty ===
                'Easy'
                  ? 15
                  : p.difficulty ===
                    'Medium'
                  ? 30
                  : 50,

              explanations: [
                `Focuses on ${p.topic} (Fallback recommender)`,
                `Difficulty: ${p.difficulty}`,
              ],
            }));

        res.json({
          recommendations:
            fallbackRecs,
        });
      }
    } catch (error) {
      console.error(
        'Recommendations fetch error:',
        error
      );

      res.status(500).json({
        error:
          'Server error generating recommendations',
      });
    }
  }
);
// ======================================================
// START SERVER
// ======================================================
app.listen(PORT, () => {
  console.log(
    `MERN server running on port ${PORT}...`
  );
});