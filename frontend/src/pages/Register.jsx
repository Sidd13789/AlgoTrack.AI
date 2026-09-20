
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

import {
  User,
  Mail,
  Lock,
  Briefcase,
  GraduationCap,
  Brain,
  Sun,
  Moon
} from 'lucide-react';

import { useTheme } from '../context/ThemeContext';

function Register() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [skillLevel, setSkillLevel] = useState('Beginner');
  const [targetRole, setTargetRole] = useState('General FAANG Prep');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  // Production API from Vercel environment variable
  // Local fallback for development
  const API_URL =
    import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_URL}/auth/register`, {
        username,
        email,
        password,
        skillLevel,
        targetRole
      });

      // Registration successful
      // Do NOT automatically login
      // Go to Login page
      navigate('/login');
    } catch (err) {
      setError(
        err.response?.data?.error ||
          'Registration failed. Try another username/email.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[80vh] py-8 relative">

      {/* Theme Toggle */}
      <button
        onClick={toggleTheme}
        className="
          absolute
          top-4
          right-4
          p-2.5
          rounded-xl
          border
          border-gray-300
          dark:border-gray-700
          bg-gray-100
          dark:bg-gray-800
          text-gray-700
          dark:text-gray-200
          hover:bg-gray-200
          dark:hover:bg-gray-700
          transition-all
          cursor-pointer
        "
        title={
          theme === 'dark'
            ? 'Switch to Light Mode'
            : 'Switch to Dark Mode'
        }
      >
        {theme === 'dark' ? (
          <Sun size={18} />
        ) : (
          <Moon size={18} />
        )}
      </button>

      <div
        className="
          w-full
          max-w-lg
          p-8
          rounded-2xl
          glass-panel
          glow-blue
          relative
          overflow-hidden
          bg-white
          dark:bg-transparent
          border
          border-gray-200
          dark:border-transparent
        "
      >

        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"></div>

        {/* Header */}
        <div className="flex flex-col items-center mb-6">

          <div className="bg-gradient-to-tr from-blue-600 to-purple-600 p-2.5 rounded-xl text-white shadow-lg mb-2">
            <Brain size={28} />
          </div>

          <h2
            className="
              text-2xl
              font-extrabold
              tracking-tight
              text-gray-900
              dark:text-white
              font-sans
              text-center
            "
          >
            Create AI Coach Account
          </h2>

          <p
            className="
              text-gray-500
              dark:text-gray-400
              text-xs
              mt-1
              text-center
              font-medium
            "
          >
            Personalize your LeetCode adaptive training path
          </p>
        </div>

        {/* Error */}
        {error && (
          <div
            className="
              bg-red-500/10
              border
              border-red-500/20
              text-red-500
              dark:text-red-400
              text-sm
              px-4
              py-3
              rounded-xl
              mb-6
              text-center
            "
          >
            {error}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          {/* Username + Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Username */}
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
                Username
              </label>

              <div className="relative">

                <span
                  className="
                    absolute
                    inset-y-0
                    left-0
                    flex
                    items-center
                    pl-3.5
                    text-gray-500
                  "
                >
                  <User size={16} />
                </span>

                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="
                    w-full
                    bg-gray-50
                    dark:bg-[#0d1424]
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
                    focus:border-blue-500
                    focus:ring-1
                    focus:ring-blue-500
                    transition-all
                    text-sm
                  "
                  placeholder="LeetCoder42"
                />
              </div>
            </div>

            {/* Email */}
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
                Email Address
              </label>

              <div className="relative">

                <span
                  className="
                    absolute
                    inset-y-0
                    left-0
                    flex
                    items-center
                    pl-3.5
                    text-gray-500
                  "
                >
                  <Mail size={16} />
                </span>

                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="
                    w-full
                    bg-gray-50
                    dark:bg-[#0d1424]
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
                    focus:border-blue-500
                    focus:ring-1
                    focus:ring-blue-500
                    transition-all
                    text-sm
                  "
                  placeholder="you@email.com"
                />
              </div>
            </div>
          </div>

          {/* Password */}
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
              Password
            </label>

            <div className="relative">

              <span
                className="
                  absolute
                  inset-y-0
                  left-0
                  flex
                  items-center
                  pl-3.5
                  text-gray-500
                "
              >
                <Lock size={16} />
              </span>

              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="
                  w-full
                  bg-gray-50
                  dark:bg-[#0d1424]
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
                  focus:border-blue-500
                  focus:ring-1
                  focus:ring-blue-500
                  transition-all
                  text-sm
                "
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Skill Level + Target Role */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

            {/* Skill Level */}
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
                Current Skill Level
              </label>

              <div className="relative">

                <span
                  className="
                    absolute
                    inset-y-0
                    left-0
                    flex
                    items-center
                    pl-3.5
                    text-gray-500
                  "
                >
                  <GraduationCap size={16} />
                </span>

                <select
                  value={skillLevel}
                  onChange={(e) => setSkillLevel(e.target.value)}
                  className="
                    w-full
                    bg-gray-50
                    dark:bg-[#0d1424]
                    border
                    border-gray-300
                    dark:border-darkBorder/60
                    rounded-xl
                    py-2.5
                    pl-10
                    pr-4
                    text-gray-900
                    dark:text-white
                    focus:outline-none
                    focus:border-blue-500
                    transition-all
                    text-sm
                    appearance-none
                    cursor-pointer
                  "
                >
                  <option value="Beginner">
                    Beginner (Basic Syntax)
                  </option>

                  <option value="Intermediate">
                    Intermediate (Arrays, Strings)
                  </option>

                  <option value="Advanced">
                    Advanced (Graphs, DP)
                  </option>
                </select>
              </div>
            </div>

            {/* Target Role */}
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
                Target Role / Goal
              </label>

              <div className="relative">

                <span
                  className="
                    absolute
                    inset-y-0
                    left-0
                    flex
                    items-center
                    pl-3.5
                    text-gray-500
                  "
                >
                  <Briefcase size={16} />
                </span>

                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
                  className="
                    w-full
                    bg-gray-50
                    dark:bg-[#0d1424]
                    border
                    border-gray-300
                    dark:border-darkBorder/60
                    rounded-xl
                    py-2.5
                    pl-10
                    pr-4
                    text-gray-900
                    dark:text-white
                    focus:outline-none
                    focus:border-blue-500
                    transition-all
                    text-sm
                    appearance-none
                    cursor-pointer
                  "
                >
                  <option value="General FAANG Prep">
                    General FAANG Prep
                  </option>

                  <option value="Frontend Engineer">
                    Frontend Engineer
                  </option>

                  <option value="Backend Engineer">
                    Backend Engineer
                  </option>

                  <option value="Fullstack Engineer">
                    Fullstack Engineer
                  </option>

                  <option value="Data Scientist">
                    Data Scientist
                  </option>
                </select>
              </div>
            </div>
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
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
              hover:shadow-purple-500/25
              active:scale-[0.99]
              disabled:opacity-50
              text-sm
              mt-3
              cursor-pointer
            "
          >
            {loading
              ? 'Creating Account...'
              : 'Register & Start Learning'}
          </button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center text-sm">

          <p className="text-gray-500 dark:text-gray-400">
            Already have an account?{' '}

            <Link
              to="/login"
              className="
                text-blue-600
                dark:text-blue-400
                hover:text-blue-500
                dark:hover:text-blue-300
                font-semibold
                underline
                underline-offset-4
              "
            >
              Sign In
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}

export default Register;

