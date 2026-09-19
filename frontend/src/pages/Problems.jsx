import React, { useState, useEffect } from 'react';
import {
  Search,
  BookOpen,
  Play,
  CheckCircle2,
  X
} from 'lucide-react';
import axios from 'axios';

function Problems() {
  const [problems, setProblems] = useState([]);
  const [solvedIds, setSolvedIds] = useState([]);
  const [search, setSearch] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('All');
  const [filterTopic, setFilterTopic] = useState('All');
  const [loading, setLoading] = useState(true);

  // Submit log modal
  const [selectedProblem, setSelectedProblem] = useState(null);
  const [status, setStatus] = useState('Solved');
  const [attempts, setAttempts] = useState(1);
  const [timeTaken, setTimeTaken] = useState(25);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProblemsData();
  }, []);

  const fetchProblemsData = async () => {
    setLoading(true);

    try {
      const probRes = await axios.get('/api/problems');
      setProblems(probRes.data);

      const profileRes = await axios.get('/api/user/profile');

      const submissions = profileRes.data.user
        ? await fetchUserSolved()
        : [];

      setSolvedIds(submissions);
    } catch (err) {
      console.error('Failed to load problems data', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserSolved = async () => {
    try {
      const res = await axios.get('/api/user/profile');

      const solved = [];

      Object.entries(res.data.topicStats || {}).forEach(([topic, stat]) => {
        // Generic aggregation placeholder
      });

      return solved;
    } catch (e) {
      return [];
    }
  };

  const handleOpenLogModal = (problem) => {
    setSelectedProblem(problem);
    setStatus('Solved');
    setAttempts(1);
    setTimeTaken(25);
    setHintsUsed(0);
  };

  const handleLogSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post('/api/submissions', {
        problem_id: selectedProblem.problem_id,
        status,
        attempts: parseInt(attempts),
        time_taken: parseInt(timeTaken),
        hints_used: parseInt(hintsUsed)
      });

      setSelectedProblem(null);
      fetchProblemsData();
    } catch (err) {
      console.error('Failed to submit logs', err);
      alert('Error updating logs.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProblems = problems.filter((p) => {
    const matchesSearch =
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      p.problem_id.includes(search);

    const matchesDifficulty =
      filterDifficulty === 'All' ||
      p.difficulty === filterDifficulty;

    const matchesTopic =
      filterTopic === 'All' ||
      p.topic === filterTopic;

    return matchesSearch && matchesDifficulty && matchesTopic;
  });

  const topics = [
    'All',
    'Arrays',
    'Strings',
    'Binary Search',
    'Trees',
    'Graphs',
    'Dynamic Programming',
    'Linked List',
    'Stack'
  ];

  if (loading && problems.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-purple-500 mb-2"></div>

        <p className="text-gray-600 dark:text-gray-400 text-xs font-semibold">
          Loading problems repository...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          LeetCode Problems Pool
        </h2>

        <p className="text-gray-600 dark:text-gray-400 text-xs mt-1">
          Browse, navigate, and log your LeetCode attempts manually below.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">

        {/* Search */}
        <div className="md:col-span-6 relative">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-gray-500 dark:text-gray-400">
            <Search size={16} />
          </span>

          <input
            type="text"
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="
              w-full
              bg-white
              dark:bg-[#161e2e]
              border
              border-gray-300
              dark:border-darkBorder/60
              rounded-xl
              py-2.5
              pl-10
              pr-4
              text-gray-900
              dark:text-white
              placeholder-gray-400
              dark:placeholder-gray-500
              focus:outline-none
              focus:border-purple-500
              transition-all
              text-xs
              shadow-sm
              dark:shadow-none
            "
          />
        </div>

        {/* Difficulty */}
        <div className="md:col-span-3">
          <select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            className="
              w-full
              bg-white
              dark:bg-[#161e2e]
              border
              border-gray-300
              dark:border-darkBorder/60
              rounded-xl
              py-2.5
              px-3
              text-gray-900
              dark:text-white
              focus:outline-none
              focus:border-purple-500
              transition-all
              text-xs
              appearance-none
              cursor-pointer
              shadow-sm
              dark:shadow-none
            "
          >
            <option value="All">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Topics */}
        <div className="md:col-span-3">
          <select
            value={filterTopic}
            onChange={(e) => setFilterTopic(e.target.value)}
            className="
              w-full
              bg-white
              dark:bg-[#161e2e]
              border
              border-gray-300
              dark:border-darkBorder/60
              rounded-xl
              py-2.5
              px-3
              text-gray-900
              dark:text-white
              focus:outline-none
              focus:border-purple-500
              transition-all
              text-xs
              appearance-none
              cursor-pointer
              shadow-sm
              dark:shadow-none
            "
          >
            {topics.map((t) => (
              <option key={t} value={t}>
                {t === 'All' ? 'All Topics' : t}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Problems Table */}
      <div
        className="
          glass-panel
          rounded-2xl
          overflow-hidden
          border
          border-gray-200
          dark:border-darkBorder/40
        "
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">

            <thead>
              <tr
                className="
                  border-b
                  border-gray-200
                  dark:border-darkBorder/40
                  text-gray-500
                  dark:text-gray-400
                  text-[10px]
                  font-extrabold
                  uppercase
                  tracking-wider
                  bg-gray-50
                  dark:bg-darkCard/20
                "
              >
                <th className="py-4 px-6 w-16">ID</th>
                <th className="py-4 px-6">Title</th>
                <th className="py-4 px-6">Topic</th>
                <th className="py-4 px-6">Difficulty</th>
                <th className="py-4 px-6">Acceptance</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>

            <tbody
              className="
                divide-y
                divide-gray-200
                dark:divide-darkBorder/20
              "
            >
              {filteredProblems.map((p) => (
                <tr
                  key={p.problem_id}
                  className="
                    hover:bg-gray-50
                    dark:hover:bg-darkCard/25
                    transition-colors
                    text-xs
                    font-semibold
                    text-gray-700
                    dark:text-gray-300
                  "
                >

                  {/* ID */}
                  <td className="py-4 px-6 font-mono text-purple-600 dark:text-purple-400">
                    #{p.problem_id}
                  </td>

                  {/* Title */}
                  <td className="py-4 px-6">
                    <a
                      href={p.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="
                        flex
                        items-center
                        gap-1.5
                        cursor-pointer
                        text-gray-900
                        dark:text-white
                        font-bold
                        hover:text-purple-600
                        dark:hover:text-purple-400
                        transition-colors
                      "
                    >
                      <span>{p.title}</span>

                      <BookOpen
                        size={12}
                        className="text-gray-400 dark:text-gray-500"
                      />
                    </a>
                  </td>

                  {/* Topic */}
                  <td className="py-4 px-6">
                    <span
                      className="
                        bg-blue-500/10
                        text-blue-600
                        dark:text-blue-400
                        border
                        border-blue-500/20
                        px-2.5
                        py-0.5
                        rounded-full
                        text-[10px]
                        font-bold
                      "
                    >
                      {p.topic}
                    </span>
                  </td>

                  {/* Difficulty */}
                  <td className="py-4 px-6">
                    <span
                      className={`
                        text-[10px]
                        font-bold
                        ${
                          p.difficulty === 'Easy'
                            ? 'text-green-600 dark:text-green-400'
                            : p.difficulty === 'Medium'
                              ? 'text-orange-600 dark:text-orange-400'
                              : 'text-red-600 dark:text-red-400'
                        }
                      `}
                    >
                      {p.difficulty}
                    </span>
                  </td>

                  {/* Acceptance */}
                  <td className="py-4 px-6 font-mono text-gray-700 dark:text-gray-300">
                    {Math.round(p.acceptance_rate * 100)}%
                  </td>

                  {/* Action */}
                  <td className="py-4 px-6 text-right">
                    <button
                      onClick={() => handleOpenLogModal(p)}
                      className="
                        bg-purple-600/10
                        border
                        border-purple-500/30
                        text-purple-600
                        dark:text-purple-400
                        hover:bg-purple-600
                        hover:text-white
                        px-3
                        py-1.5
                        rounded-lg
                        text-xs
                        font-bold
                        transition-all
                        inline-flex
                        items-center
                        gap-1
                        cursor-pointer
                      "
                    >
                      <Play size={10} fill="currentColor" />
                      <span>Log Attempt</span>
                    </button>
                  </td>
                </tr>
              ))}

              {filteredProblems.length === 0 && (
                <tr>
                  <td
                    colSpan="6"
                    className="
                      text-center
                      py-8
                      text-gray-500
                      dark:text-gray-500
                    "
                  >
                    No problems found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Submission Modal */}
      {selectedProblem && (
        <div
          className="
            fixed
            inset-0
            bg-black/40
            dark:bg-black/70
            backdrop-blur-sm
            z-50
            flex
            items-center
            justify-center
            p-4
          "
        >
          <div
            className="
              w-full
              max-w-md
              bg-white
              dark:bg-darkCard
              border
              border-gray-200
              dark:border-darkBorder
              rounded-2xl
              p-6
              relative
              shadow-2xl
              animate-scale-up
            "
          >

            {/* Close */}
            <button
              onClick={() => setSelectedProblem(null)}
              className="
                absolute
                top-4
                right-4
                text-gray-500
                dark:text-gray-400
                hover:text-gray-900
                dark:hover:text-white
                p-1
                rounded-lg
                hover:bg-gray-100
                dark:hover:bg-darkBg/60
                transition-all
                cursor-pointer
              "
            >
              <X size={18} />
            </button>

            {/* Modal Heading */}
            <h3
              className="
                text-lg
                font-bold
                text-gray-900
                dark:text-white
                flex
                items-center
                gap-2
                mb-1
              "
            >
              <CheckCircle2
                size={20}
                className="text-green-500 dark:text-green-400"
              />

              <span>Log Problem Attempt</span>
            </h3>

            <p className="text-gray-600 dark:text-gray-400 text-xs mb-6">
              Logging{' '}
              <span className="text-gray-900 dark:text-white font-semibold">
                {selectedProblem.title}
              </span>{' '}
              ({selectedProblem.topic})
            </p>

            <form onSubmit={handleLogSubmit} className="space-y-5">

              {/* Solve Outcome */}
              <div>
                <label
                  className="
                    block
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-gray-600
                    dark:text-gray-400
                    mb-2
                  "
                >
                  Solve Outcome
                </label>

                <div className="grid grid-cols-2 gap-3">

                  <button
                    type="button"
                    onClick={() => setStatus('Solved')}
                    className={`
                      py-2.5
                      rounded-xl
                      border
                      text-sm
                      font-bold
                      transition-all
                      cursor-pointer
                      ${
                        status === 'Solved'
                          ? 'bg-green-500/10 border-green-500 text-green-600 dark:text-green-400'
                          : 'border-gray-300 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    Solved Successfully
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatus('Failed')}
                    className={`
                      py-2.5
                      rounded-xl
                      border
                      text-sm
                      font-bold
                      transition-all
                      cursor-pointer
                      ${
                        status === 'Failed'
                          ? 'bg-red-500/10 border-red-500 text-red-600 dark:text-red-400'
                          : 'border-gray-300 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                      }
                    `}
                  >
                    Incorrect/Gave Up
                  </button>

                </div>
              </div>

              {/* Attempts + Time */}
              <div className="grid grid-cols-2 gap-4">

                <div>
                  <label
                    className="
                      block
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-gray-600
                      dark:text-gray-400
                      mb-2
                    "
                  >
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
                      bg-white
                      dark:bg-darkBg
                      border
                      border-gray-300
                      dark:border-darkBorder/60
                      rounded-xl
                      py-2
                      px-3
                      text-gray-900
                      dark:text-white
                      focus:outline-none
                      focus:border-purple-500
                      transition-all
                      text-sm
                    "
                  />
                </div>

                <div>
                  <label
                    className="
                      block
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-gray-600
                      dark:text-gray-400
                      mb-2
                    "
                  >
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
                      bg-white
                      dark:bg-darkBg
                      border
                      border-gray-300
                      dark:border-darkBorder/60
                      rounded-xl
                      py-2
                      px-3
                      text-gray-900
                      dark:text-white
                      focus:outline-none
                      focus:border-purple-500
                      transition-all
                      text-sm
                    "
                  />
                </div>

              </div>

              {/* Hints */}
              <div>
                <label
                  className="
                    block
                    text-xs
                    font-bold
                    uppercase
                    tracking-wider
                    text-gray-600
                    dark:text-gray-400
                    mb-2
                  "
                >
                  Hints Used (0-3)
                </label>

                <div className="grid grid-cols-4 gap-2">

                  {[0, 1, 2, 3].map((h) => (
                    <button
                      key={h}
                      type="button"
                      onClick={() => setHintsUsed(h)}
                      className={`
                        py-2
                        rounded-lg
                        border
                        text-xs
                        font-bold
                        transition-all
                        cursor-pointer
                        ${
                          hintsUsed === h
                            ? 'bg-blue-500/10 border-blue-500 text-blue-600 dark:text-blue-400'
                            : 'border-gray-300 dark:border-darkBorder bg-gray-50 dark:bg-darkBg text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }
                      `}
                    >
                      {h}
                    </button>
                  ))}

                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting}
                className="
                  w-full
                  bg-gradient-to-r
                  from-blue-600
                  to-purple-600
                  hover:from-blue-500
                  hover:to-purple-500
                  text-white
                  font-bold
                  py-3.5
                  rounded-xl
                  transition-all
                  shadow-lg
                  active:scale-95
                  disabled:opacity-50
                  text-sm
                  mt-3
                  cursor-pointer
                "
              >
                {submitting
                  ? 'Updating Skill Topology...'
                  : 'Submit Attempt Logs'}
              </button>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

export default Problems;