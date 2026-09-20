import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  Search,
  Filter,
  ExternalLink,
  CheckCircle2,
  Circle,
  RefreshCw,
} from "lucide-react";

export default function Problems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("All");
  const [topic, setTopic] = useState("All");

  const fetchProblems = async () => {
    try {
      setLoading(true);

      const res = await axios.get("/api/problems");

      setProblems(res.data || []);
    } catch (error) {
      console.error("Failed to fetch problems:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const filteredProblems = problems.filter((problem) => {
    const matchesSearch =
      problem.title
        ?.toLowerCase()
        .includes(search.toLowerCase()) ||
      problem.problem_id
        ?.toString()
        .includes(search);

    const matchesDifficulty =
      difficulty === "All" ||
      problem.difficulty === difficulty;

    const matchesTopic =
      topic === "All" ||
      problem.topic === topic;

    return (
      matchesSearch &&
      matchesDifficulty &&
      matchesTopic
    );
  });

  const topics = [
    ...new Set(problems.map((problem) => problem.topic)),
  ];

  if (loading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center gap-3">
        <RefreshCw
          size={32}
          className="animate-spin text-purple-500"
        />

        <p className="text-sm font-semibold text-gray-600 dark:text-gray-400">
          Loading problems...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            Problem Bank
          </h1>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Practice problems from your personalized LeetCode dataset.
          </p>
        </div>

        <button
          onClick={fetchProblems}
          className="
            flex items-center gap-2
            px-4 py-2.5 rounded-xl
            bg-gray-100 dark:bg-darkCard
            border border-gray-200 dark:border-darkBorder/40
            text-gray-700 dark:text-gray-300
            hover:text-purple-600 dark:hover:text-white
            hover:border-purple-500/40
            transition-all
            cursor-pointer
          "
        >
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="glass-panel p-5 rounded-2xl">

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Search */}
          <div className="relative">

            <Search
              size={18}
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <input
              type="text"
              placeholder="Search problem..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="
                w-full
                bg-gray-50 dark:bg-darkBg
                border border-gray-200 dark:border-darkBorder/50
                rounded-xl
                py-2.5 pl-10 pr-4
                text-sm
                text-gray-900 dark:text-white
                placeholder-gray-400
                focus:outline-none
                focus:border-purple-500
                transition-all
              "
            />
          </div>

          {/* Difficulty */}
          <div className="relative">

            <Filter
              size={16}
              className="
                absolute left-3 top-1/2
                -translate-y-1/2
                text-gray-400
              "
            />

            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="
                w-full
                appearance-none
                bg-gray-50 dark:bg-darkBg
                border border-gray-200 dark:border-darkBorder/50
                rounded-xl
                py-2.5 pl-10 pr-4
                text-sm
                text-gray-900 dark:text-white
                focus:outline-none
                focus:border-purple-500
                transition-all
              "
            >
              <option value="All">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>
          </div>

          {/* Topic */}
          <div>
            <select
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              className="
                w-full
                bg-gray-50 dark:bg-darkBg
                border border-gray-200 dark:border-darkBorder/50
                rounded-xl
                py-2.5 px-4
                text-sm
                text-gray-900 dark:text-white
                focus:outline-none
                focus:border-purple-500
                transition-all
              "
            >
              <option value="All">All Topics</option>

              {topics.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Count */}
      <div className="flex items-center justify-between">

        <p className="text-sm text-gray-500 dark:text-gray-400">
          Showing{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {filteredProblems.length}
          </span>{" "}
          of{" "}
          <span className="font-bold text-gray-900 dark:text-white">
            {problems.length}
          </span>{" "}
          problems
        </p>

      </div>

      {/* Problems */}
      {filteredProblems.length === 0 ? (
        <div className="glass-panel rounded-2xl p-12 text-center">

          <Search
            size={35}
            className="mx-auto text-gray-400 mb-3"
          />

          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            No problems found
          </h3>

          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Try changing your search or filters.
          </p>

        </div>
      ) : (
        <div className="glass-panel rounded-2xl overflow-hidden">

          {/* Desktop Table */}
          <div className="hidden md:block overflow-x-auto">

            <table className="w-full">

              <thead>
                <tr className="border-b border-gray-200 dark:border-darkBorder/40">

                  <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                    #
                  </th>

                  <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                    Problem
                  </th>

                  <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                    Difficulty
                  </th>

                  <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                    Topic
                  </th>

                  <th className="text-left px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                    Acceptance
                  </th>

                  <th className="text-right px-6 py-4 text-[11px] uppercase tracking-wider font-bold text-gray-500 dark:text-gray-400">
                    Link
                  </th>

                </tr>
              </thead>

              <tbody>

                {filteredProblems.map((problem) => (

                  <tr
                    key={problem.problem_id}
                    className="
                      border-b border-gray-100 dark:border-darkBorder/20
                      hover:bg-gray-50 dark:hover:bg-darkCard/40
                      transition-colors
                    "
                  >

                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                        {problem.problem_id}
                      </span>
                    </td>

                    <td className="px-6 py-4">

                      <div className="flex items-center gap-3">

                        <Circle
                          size={16}
                          className="text-gray-400 flex-shrink-0"
                        />

                        <span className="text-sm font-bold text-gray-900 dark:text-white">
                          {problem.title}
                        </span>

                      </div>

                    </td>

                    <td className="px-6 py-4">

                      <span
                        className={`inline-flex px-2.5 py-1 rounded-lg text-[10px] font-bold border ${
                          problem.difficulty === "Easy"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/20"
                            : problem.difficulty === "Medium"
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20"
                            : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20"
                        }`}
                      >
                        {problem.difficulty}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <span className="inline-flex px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[10px] font-bold">
                        {problem.topic}
                      </span>

                    </td>

                    <td className="px-6 py-4">

                      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {Math.round(
                          problem.acceptance_rate * 100
                        )}
                        %
                      </span>

                    </td>

                    <td className="px-6 py-4 text-right">

                      <a
                        href={problem.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="
                          inline-flex items-center gap-1.5
                          text-purple-600 dark:text-purple-400
                          hover:text-purple-500
                          text-xs font-bold
                          transition-colors
                        "
                      >
                        Solve
                        <ExternalLink size={13} />
                      </a>

                    </td>

                  </tr>

                ))}

              </tbody>

            </table>

          </div>

          {/* Mobile Cards */}
          <div className="md:hidden divide-y divide-gray-200 dark:divide-darkBorder/30">

            {filteredProblems.map((problem) => (

              <div
                key={problem.problem_id}
                className="p-5 hover:bg-gray-50 dark:hover:bg-darkCard/30 transition-colors"
              >

                <div className="flex items-start justify-between gap-3">

                  <div className="flex-1">

                    <div className="flex items-center gap-2 mb-2">

                      <span className="text-xs font-bold text-gray-400">
                        #{problem.problem_id}
                      </span>

                      <span
                        className={`px-2 py-0.5 rounded-md text-[9px] font-bold ${
                          problem.difficulty === "Easy"
                            ? "bg-green-500/10 text-green-600 dark:text-green-400"
                            : problem.difficulty === "Medium"
                            ? "bg-orange-500/10 text-orange-600 dark:text-orange-400"
                            : "bg-red-500/10 text-red-600 dark:text-red-400"
                        }`}
                      >
                        {problem.difficulty}
                      </span>

                    </div>

                    <h3 className="text-sm font-bold text-gray-900 dark:text-white">
                      {problem.title}
                    </h3>

                    <div className="flex flex-wrap items-center gap-2 mt-3">

                      <span className="px-2 py-1 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 text-[9px] font-bold">
                        {problem.topic}
                      </span>

                      <span className="text-[10px] text-gray-500 dark:text-gray-400 font-semibold">
                        Acceptance:{" "}
                        {Math.round(
                          problem.acceptance_rate * 100
                        )}
                        %
                      </span>

                    </div>

                  </div>

                  <a
                    href={problem.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      p-2 rounded-lg
                      bg-purple-500/10
                      text-purple-600 dark:text-purple-400
                      hover:bg-purple-500/20
                      transition-all
                    "
                  >
                    <ExternalLink size={16} />
                  </a>

                </div>

              </div>

            ))}

          </div>

        </div>
      )}

    </div>
  );
}

