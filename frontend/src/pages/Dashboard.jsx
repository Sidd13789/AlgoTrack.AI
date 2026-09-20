import React, { useState, useEffect } from "react";
import axios from "axios";

import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts";

import {
  Brain,
  Clock,
  Award,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  RefreshCw,
  X,
  Play,
} from "lucide-react";

function Dashboard({ fetchStreak }) {
  const [profile, setProfile] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [recoLoading, setRecoLoading] = useState(false);

  // Submit modal states
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [status, setStatus] = useState("Solved");
  const [attempts, setAttempts] = useState(1);
  const [timeTaken, setTimeTaken] = useState(20);
  const [hintsUsed, setHintsUsed] = useState(0);

  // Accordion details for XAI
  const [expandedReco, setExpandedReco] = useState(null);

  // Production API on Vercel, local API on localhost
  const API_URL =
    import.meta.env.VITE_API_URL || "http://localhost:5000/api";

  // JWT configuration
  const getAuthConfig = () => {
    const token = localStorage.getItem("token");

    return {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    };
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);

    try {
      // Get user profile
      const profileRes = await axios.get(
        `${API_URL}/user/profile`,
        getAuthConfig()
      );

      setProfile(profileRes.data);

      // Get AI recommendations / LeetCode problems
      setRecoLoading(true);

      const recsRes = await axios.get(
        `${API_URL}/recommendations`,
        getAuthConfig()
      );

      console.log("Recommendations response:", recsRes.data);

      setRecommendations(recsRes.data.recommendations || []);
    } catch (err) {
      console.error(
        "Failed to load dashboard:",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
      setRecoLoading(false);
    }
  };

  const handleRefreshRecommendations = async () => {
    setRecoLoading(true);

    try {
      const recsRes = await axios.get(
        `${API_URL}/recommendations`,
        getAuthConfig()
      );

      console.log("Refresh recommendations response:", recsRes.data);

      setRecommendations(recsRes.data.recommendations || []);
    } catch (err) {
      console.error(
        "Failed to refresh recommendations:",
        err.response?.data || err.message
      );
    } finally {
      setRecoLoading(false);
    }
  };

  const handleOpenLogModal = (problem) => {
    setSelectedProblem(problem);
    setStatus("Solved");
    setAttempts(1);
    setTimeTaken(20);
    setHintsUsed(0);
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();

    setSubmitting(true);

    try {
      await axios.post(
        `${API_URL}/submissions`,
        {
          problem_id: selectedProblem.problem_id,
          status,
          attempts: parseInt(attempts),
          time_taken: parseInt(timeTaken),
          hints_used: parseInt(hintsUsed),
        },
        getAuthConfig()
      );

      setSelectedProblem(null);

      if (fetchStreak) {
        fetchStreak();
      }

      await fetchDashboardData();
    } catch (err) {
      console.error(
        "Failed to log submission:",
        err.response?.data || err.message
      );

      alert("Error logging submission. Please verify details.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && !profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-3">
        <div className="animate-spin text-purple-500">
          <RefreshCw size={36} />
        </div>

        <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
          Running ML inferences and loading metrics...
        </p>
      </div>
    );
  }

  // Format skills data for Recharts Radar
  const radarData = Object.entries(profile?.skills || {}).map(
    ([topic, val]) => ({
      subject: topic,
      A: Math.round(val * 100),
      fullMark: 100,
    })
  );

  // Group topics into milestones
  const getMilestoneScore = (topics) => {
    if (!profile?.skills) return 0;

    const scores = topics.map((t) => profile.skills[t] || 0);

    return Math.round(
      (scores.reduce((a, b) => a + b, 0) / topics.length) * 100
    );
  };

  const milestones = [
    {
      name: "Milestone 1: Basic Operations",
      topics: ["Arrays", "Strings"],
      score: getMilestoneScore(["Arrays", "Strings"]),
    },
    {
      name: "Milestone 2: Linked Structures & Stacks",
      topics: ["Linked List", "Stack"],
      score: getMilestoneScore(["Linked List", "Stack"]),
    },
    {
      name: "Milestone 3: Trees & Binary Searching",
      topics: ["Trees", "Binary Search"],
      score: getMilestoneScore(["Trees", "Binary Search"]),
    },
    {
      name: "Milestone 4: Graphs & Advanced Dynamics",
      topics: ["Graphs", "Dynamic Programming"],
      score: getMilestoneScore(["Graphs", "Dynamic Programming"]),
    },
  ];

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Hi, <span className="gradient-text">{profile?.user?.username}</span>!
          </h2>

          <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
            Targeting{" "}
            <span className="text-purple-600 dark:text-purple-400 font-semibold">
              {profile?.user?.targetRole}
            </span>
            . AI has analyzed your solve history.
          </p>
        </div>

        <button
          onClick={handleRefreshRecommendations}
          disabled={recoLoading}
          className="
            flex items-center gap-2
            bg-gray-100 dark:bg-darkCard
            border border-gray-200 dark:border-darkBorder/40
            hover:border-purple-500/40
            text-gray-700 dark:text-gray-300
            hover:text-purple-600 dark:hover:text-white
            px-4 py-2 rounded-xl text-sm
            transition-all shadow-md
            active:scale-95 disabled:opacity-50
            cursor-pointer
          "
        >
          <RefreshCw
            size={16}
            className={recoLoading ? "animate-spin" : ""}
          />
          <span>Refresh AI Plans</span>
        </button>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-purple-500/10 p-3 rounded-xl text-purple-600 dark:text-purple-400">
            <CheckCircle2 size={24} />
          </div>

          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              Problems Solved
            </p>

            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              {profile?.metrics?.problemsSolved}
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-blue-500/10 p-3 rounded-xl text-blue-600 dark:text-blue-400">
            <Award size={24} />
          </div>

          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              Success Accuracy
            </p>

            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              {profile?.metrics?.successRate}%
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-orange-500/10 p-3 rounded-xl text-orange-600 dark:text-orange-400">
            <Clock size={24} />
          </div>

          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              Avg Solve Time
            </p>

            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              {profile?.metrics?.avgSolveTime} mins
            </p>
          </div>
        </div>

        <div className="glass-panel p-5 rounded-2xl flex items-center gap-4">
          <div className="bg-green-500/10 p-3 rounded-xl text-green-600 dark:text-green-400">
            <Brain size={24} />
          </div>

          <div>
            <p className="text-[10px] text-gray-500 dark:text-gray-400 font-bold uppercase tracking-wider">
              Skill Rating
            </p>

            <p className="text-2xl font-extrabold text-gray-900 dark:text-white mt-0.5">
              {Math.round(
                (Object.values(profile?.skills || {}).reduce(
                  (a, b) => a + b,
                  0
                ) / 8) * 100
              )}
              %
            </p>
          </div>
        </div>
      </div>

      {/* Main Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* LEFT */}
        <div className="lg:col-span-7 space-y-8">

          {/* Skill Map */}
          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">

            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  AI Skill Topology
                </h3>

                <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                  Active knowledge weights by category (Bayesian Estimation)
                </p>
              </div>
            </div>

            <div className="h-72 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  data={radarData}
                >
                  <PolarGrid stroke="#64748b" />

                  <PolarAngleAxis
                    dataKey="subject"
                    stroke="#64748b"
                    fontSize={11}
                    fontWeight={600}
                  />

                  <PolarRadiusAxis
                    angle={30}
                    domain={[0, 100]}
                    tickCount={6}
                    stroke="#94a3b8"
                    fontSize={10}
                  />

                  <Radar
                    name="Skill"
                    dataKey="A"
                    stroke="#a855f7"
                    fill="#8b5cf6"
                    fillOpacity={0.25}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Adaptive Learning Path */}
          <div className="glass-panel p-6 rounded-2xl">

            <div className="mb-6">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Adaptive Learning Path
              </h3>

              <p className="text-gray-500 dark:text-gray-400 text-xs mt-0.5">
                Your auto-generated skill curriculum status
              </p>
            </div>

            <div className="space-y-4">
              {milestones.map((m, idx) => {
                const isActive =
                  m.score < 80 &&
                  (idx === 0 || milestones[idx - 1].score >= 80);

                const isCompleted = m.score >= 80;

                return (
                  <div
                    key={m.name}
                    className={`p-4 rounded-xl border transition-all ${
                      isActive
                        ? "bg-purple-500/5 border-purple-500/40 glow-purple"
                        : isCompleted
                        ? "bg-green-500/5 border-green-500/20"
                        : "bg-gray-100/70 dark:bg-darkCard/20 border-gray-200 dark:border-darkBorder/40 opacity-60"
                    }`}
                  >
                    <div className="flex justify-between items-center mb-2">

                      <div className="flex items-center gap-2">
                        {isCompleted ? (
                          <CheckCircle2
                            size={16}
                            className="text-green-500 dark:text-green-400"
                          />
                        ) : isActive ? (
                          <Sparkles
                            size={16}
                            className="text-purple-600 dark:text-purple-400 animate-spin"
                          />
                        ) : (
                          <div className="h-4 w-4 rounded-full border border-gray-400 dark:border-gray-600" />
                        )}

                        <h4 className="text-sm font-bold text-gray-800 dark:text-gray-200">
                          {m.name}
                        </h4>
                      </div>

                      <span
                        className={`text-xs font-bold ${
                          isCompleted
                            ? "text-green-600 dark:text-green-400"
                            : isActive
                            ? "text-purple-600 dark:text-purple-400"
                            : "text-gray-500 dark:text-gray-400"
                        }`}
                      >
                        {m.score}% Done
                      </span>
                    </div>

                    {/* Progress */}
                    <div className="w-full bg-gray-200 dark:bg-[#0d1424] h-2 rounded-full overflow-hidden border border-gray-300 dark:border-darkBorder/40">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${
                          isCompleted
                            ? "bg-green-500"
                            : isActive
                            ? "bg-gradient-to-r from-blue-500 to-purple-500"
                            : "bg-gray-400 dark:bg-gray-700"
                        }`}
                        style={{ width: `${m.score}%` }}
                      />
                    </div>

                    <p className="text-[10px] text-gray-500 dark:text-gray-400 mt-2 font-medium">
                      Topics: {m.topics.join(", ")}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="lg:col-span-5 space-y-6">

          <div className="glass-panel p-6 rounded-2xl relative overflow-hidden">

            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-purple-500 to-orange-500" />

            <div className="flex items-center gap-2 mb-4">
              <Brain size={20} className="text-orange-500 dark:text-orange-400" />

              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                AI Recommendations
              </h3>
            </div>

            <p className="text-gray-500 dark:text-gray-400 text-xs mb-6">
              ML evaluated problems tailored to hit your target difficulty
              zones.
            </p>

            {recoLoading ? (
              <div className="flex flex-col items-center justify-center py-12 gap-3">
                <RefreshCw
                  size={24}
                  className="animate-spin text-purple-500 dark:text-purple-400"
                />

                <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                  Recalculating learning probabilities...
                </p>
              </div>
            ) : recommendations.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-gray-300 dark:border-darkBorder/40 rounded-xl">
                <p className="text-gray-600 dark:text-gray-400 text-sm font-semibold">
                  You've cleared all recommended problems!
                </p>

                <p className="text-gray-500 text-xs mt-1">
                  Try changing target difficulties or categories.
                </p>
              </div>
            ) : (
              <div className="space-y-4">

                {recommendations.map((reco) => {
                  const isExpanded =
                    expandedReco === reco.problem_id;

                  return (
                    <div
                      key={reco.problem_id}
                      className="
                        border border-gray-200 dark:border-darkBorder/40
                        bg-gray-50 dark:bg-darkCard/40
                        rounded-xl overflow-hidden
                        transition-all
                        hover:border-purple-300 dark:hover:border-darkBorder
                      "
                    >
                      <div className="p-4 flex items-start justify-between gap-3">

                        <div className="flex-1 min-w-0">

                          <div className="flex items-center gap-2 flex-wrap mb-1.5">

                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                reco.difficulty === "Easy"
                                  ? "bg-green-500/10 text-green-600 dark:text-green-400 border border-green-500/20"
                                  : reco.difficulty === "Medium"
                                  ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20"
                                  : "bg-red-500/10 text-red-600 dark:text-red-400 border border-red-500/20"
                              }`}
                            >
                              {reco.difficulty}
                            </span>

                            <span className="text-[10px] font-bold bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-2 py-0.5 rounded-md">
                              {reco.topic}
                            </span>
                          </div>

                          <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                            {reco.title}
                          </h4>

                          <div className="flex gap-4 mt-3">

                            <div>
                              <p className="text-[9px] font-bold text-gray-500 uppercase">
                                Solve Odds
                              </p>

                              <p className="text-xs font-bold text-purple-600 dark:text-purple-400 mt-0.5">
                                {Math.round(reco.success_prob * 100)}% Prob
                              </p>
                            </div>

                            <div>
                              <p className="text-[9px] font-bold text-gray-500 uppercase">
                                Est. Time
                              </p>

                              <p className="text-xs font-bold text-orange-600 dark:text-orange-400 mt-0.5">
                                {reco.predicted_time} mins
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2">

                          <button
                            onClick={() => handleOpenLogModal(reco)}
                            className="
                              bg-purple-600 hover:bg-purple-500
                              text-white p-2 rounded-lg text-xs
                              font-bold flex items-center gap-1
                              transition-colors cursor-pointer
                            "
                          >
                            <Play size={12} fill="white" />
                            <span>Log</span>
                          </button>

                          <button
                            onClick={() =>
                              setExpandedReco(
                                isExpanded
                                  ? null
                                  : reco.problem_id
                              )
                            }
                            className="
                              p-1.5
                              text-gray-500 dark:text-gray-400
                              hover:text-gray-900 dark:hover:text-white
                              rounded-md
                              hover:bg-gray-200 dark:hover:bg-[#0d1424]
                              transition-all cursor-pointer
                            "
                          >
                            {isExpanded ? (
                              <ChevronUp size={16} />
                            ) : (
                              <ChevronDown size={16} />
                            )}
                          </button>
                        </div>
                      </div>

                      {isExpanded && (
                        <div className="bg-gray-100 dark:bg-[#0b0f19] p-4 border-t border-gray-200 dark:border-darkBorder/40 space-y-2">

                          <p className="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase tracking-widest flex items-center gap-1">
                            <Brain size={12} />
                            <span>AI Reasoning (Explainable AI)</span>
                          </p>

                          <ul className="space-y-1.5 list-disc pl-4">
                            {(reco.explanations || []).map(
                              (reason, rIdx) => (
                                <li
                                  key={rIdx}
                                  className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed font-medium"
                                >
                                  {reason}
                                </li>
                              )
                            )}
                          </ul>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal */}
      {selectedProblem && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">

          <div className="w-full max-w-md bg-white dark:bg-darkCard border border-gray-200 dark:border-darkBorder rounded-2xl p-6 relative shadow-2xl animate-scale-up">

            <button
              onClick={() => setSelectedProblem(null)}
              className="
                absolute top-4 right-4
                text-gray-500 dark:text-gray-400
                hover:text-gray-900 dark:hover:text-white
                p-1 rounded-lg
                hover:bg-gray-100 dark:hover:bg-darkBg/60
                transition-all cursor-pointer
              "
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-1">
              <Brain size={20} className="text-purple-500 dark:text-purple-400" />
              <span>Log Problem Attempt</span>
            </h3>

            <p className="text-gray-500 dark:text-gray-400 text-xs mb-6">
              Logging{" "}
              <span className="text-gray-900 dark:text-white font-semibold">
                {selectedProblem.title}
              </span>{" "}
              ({selectedProblem.topic})
            </p>

            <form onSubmit={handleLogSubmit} className="space-y-5">

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Solve Outcome
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => setStatus("Solved")}
                    className={`py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      status === "Solved"
                        ? "bg-green-500/10 border-green-500 text-green-600 dark:text-green-400"
                        : "border-gray-300 dark:border-darkBorder bg-gray-100 dark:bg-darkBg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Solved Successfully
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus("Failed")}
                    className={`py-2.5 rounded-xl border text-sm font-bold transition-all cursor-pointer ${
                      status === "Failed"
                        ? "bg-red-500/10 border-red-500 text-red-600 dark:text-red-400"
                        : "border-gray-300 dark:border-darkBorder bg-gray-100 dark:bg-darkBg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                    }`}
                  >
                    Incorrect/Gave Up
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Attempts Count
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="10"
                    required
                    value={attempts}
                    onChange={(e) => setAttempts(e.target.value)}
                    className="
                      w-full
                      bg-gray-50 dark:bg-darkBg
                      border border-gray-300 dark:border-darkBorder/60
                      rounded-xl py-2 px-3
                      text-gray-900 dark:text-white
                      focus:outline-none
                      focus:border-purple-500
                      transition-all text-sm
                    "
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                    Time Spent (Mins)
                  </label>

                  <input
                    type="number"
                    min="1"
                    max="180"
                    required
                    value={timeTaken}
                    onChange={(e) => setTimeTaken(e.target.value)}
                    className="
                      w-full
                      bg-gray-50 dark:bg-darkBg
                      border border-gray-300 dark:border-darkBorder/60
                      rounded-xl py-2 px-3
                      text-gray-900 dark:text-white
                      focus:outline-none
                      focus:border-purple-500
                      transition-all text-sm
                    "
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">
                  Hints Used (0-3)
                </label>

                <div className="grid grid-cols-4 gap-2">

                  {[0, 1, 2, 3].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHintsUsed(h)}
                      className={`py-2 rounded-lg border text-xs font-bold transition-all cursor-pointer ${
                        hintsUsed === h
                          ? "bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400"
                          : "border-gray-300 dark:border-darkBorder bg-gray-100 dark:bg-darkBg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
                      }`}
                    >
                      {h}
                    </button>
                  ))}
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="
                  w-full
                  bg-gradient-to-r from-blue-600 to-purple-600
                  hover:from-blue-500 hover:to-purple-500
                  text-white font-bold
                  py-3.5 rounded-xl
                  transition-all shadow-lg
                  active:scale-95
                  disabled:opacity-50
                  text-sm mt-3 cursor-pointer
                "
              >
                {submitting
                  ? "Updating Skill Topology..."
                  : "Submit Attempt Logs"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
