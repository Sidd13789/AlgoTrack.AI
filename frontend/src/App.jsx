import React, { useState, useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Link
} from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Problems from './pages/Problems';
import {
  Brain,
  LogOut,
  Flame,
  Sun,
  Moon
} from 'lucide-react';
import axios from 'axios';
import { useTheme } from './context/ThemeContext';
function App() {
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('user'))
  );
  const [streak, setStreak] = useState(0);
  const { theme, toggleTheme } = useTheme();
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      fetchStreak();
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);
  const fetchStreak = async () => {
    try {
      const res = await axios.get('/api/user/profile');
      setStreak(res.data.streak || 0);
      if (res.data.user) {
        localStorage.setItem(
          'user',
          JSON.stringify(res.data.user)
        );
        setUser(res.data.user);
      }
    } catch (err) {
      console.error('Failed to fetch streak', err);
    }
  };
  const handleLogin = (newToken, newUser) => {
    localStorage.setItem('token', newToken);
    localStorage.setItem('user', JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  };
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
    setStreak(0);
  };
  const ProtectedRoute = ({ children }) => {
    return token ? children : <Navigate to="/login" replace />;
  };
  return (
    <Router>
      <div
        className="
          min-h-screen
          flex
          flex-col
          bg-white
          dark:bg-[#070a13]
          text-gray-900
          dark:text-gray-100
          transition-colors
          duration-300
          selection:bg-purple-500
          selection:text-white
        "
      >
        {/* ================= HEADER ================= */}
        {token && (
          <header
            className="
              glass-panel
              border-b
              border-gray-200
              dark:border-darkBorder/40
              sticky
              top-0
              z-50
              rounded-none
            "
          >
            <div
              className="
                max-w-7xl
                mx-auto
                px-4
                sm:px-6
                lg:px-8
                h-16
                flex
                items-center
                justify-between
              "
            >
              {/* ================= LOGO ================= */}
              <Link
                to="/dashboard"
                className="flex items-center gap-2"
              >
                <div
                  className="
                    w-9
                    h-9
                    rounded-xl
                    bg-gradient-to-br
                    from-blue-600
                    to-purple-600
                    flex
                    items-center
                    justify-center
                    shadow-lg
                  "
                >
                  <Brain
                    size={20}
                    className="text-white"
                  />
                </div>
                <div className="hidden sm:block">
                  <h1
                    className="
                      text-sm
                      font-extrabold
                      tracking-tight
                      text-gray-900
                      dark:text-white
                    "
                  >
                    AlgoTrack
                    <span className="text-purple-600 dark:text-purple-400">
                      .AI
                    </span>
                  </h1>
                  <p
                    className="
                      text-[9px]
                      text-gray-500
                      dark:text-gray-500
                      font-semibold
                    "
                  >
                    Adaptive Coding Coach
                  </p>
                </div>
              </Link>
              {/* ================= NAVIGATION ================= */}
              <nav className="flex items-center gap-1 sm:gap-2">
                <Link
                  to="/dashboard"
                  className="
                    px-3
                    py-2
                    rounded-lg
                    text-xs
                    font-bold
                    text-gray-600
                    dark:text-gray-400
                    hover:text-gray-900
                    dark:hover:text-white
                    hover:bg-gray-100
                    dark:hover:bg-darkCard
                    transition-all
                  "
                >
                  Dashboard
                </Link>
                <Link
                  to="/problems"
                  className="
                    px-3
                    py-2
                    rounded-lg
                    text-xs
                    font-bold
                    text-gray-600
                    dark:text-gray-400
                    hover:text-gray-900
                    dark:hover:text-white
                    hover:bg-gray-100
                    dark:hover:bg-darkCard
                    transition-all
                  "
                >
                  Problems
                </Link>
              </nav>
              {/* ================= RIGHT SIDE ================= */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Streak */}
                <div
                  className="
                    hidden
                    sm:flex
                    items-center
                    gap-1.5
                    px-3
                    py-1.5
                    rounded-lg
                    bg-orange-500/10
                    border
                    border-orange-500/20
                  "
                >
                  <Flame
                    size={15}
                    className="text-orange-500"
                    fill="currentColor"
                  />
                  <span
                    className="
                      text-xs
                      font-bold
                      text-orange-600
                      dark:text-orange-400
                    "
                  >
                    {streak} day streak
                  </span>
                </div>
                {/* User */}
                <div
                  className="
                    hidden
                    md:block
                    text-right
                  "
                >
                  <p
                    className="
                      text-xs
                      font-bold
                      text-gray-900
                      dark:text-white
                    "
                  >
                    {user?.name || user?.username || 'User'}
                  </p>
                  <p
                    className="
                      text-[9px]
                      text-gray-500
                      dark:text-gray-500
                    "
                  >
                    Coder
                  </p>
                </div>
                {/* Theme Toggle */}
                <button
                  onClick={toggleTheme}
                  className="
                    p-2
                    rounded-lg
                    border
                    border-gray-300
                    dark:border-gray-700
                    bg-gray-100
                    hover:bg-gray-200
                    dark:bg-gray-800
                    dark:hover:bg-gray-700
                    text-gray-700
                    dark:text-gray-200
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
                    <Sun size={17} />
                  ) : (
                    <Moon size={17} />
                  )}
                </button>
                {/* Logout */}
                <button
                  onClick={handleLogout}
                  className="
                    p-2
                    rounded-lg
                    border
                    border-gray-300
                    dark:border-gray-700
                    text-gray-600
                    dark:text-gray-400
                    hover:text-red-600
                    dark:hover:text-red-400
                    hover:bg-red-500/10
                    transition-all
                    cursor-pointer
                  "
                  title="Logout"
                >
                  <LogOut size={17} />
                </button>
              </div>
            </div>
          </header>
        )}
        {/* ================= MAIN ================= */}
        <main
          className="
            flex-1
            w-full
            max-w-7xl
            mx-auto
            px-4
            sm:px-6
            lg:px-8
            py-6
          "
        >
          <Routes>
            {/* Login */}
            <Route
              path="/login"
              element={
                token ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Login onLogin={handleLogin} />
                )
              }
            />
            {/* Register */}
            <Route
              path="/register"
              element={
                token ? (
                  <Navigate to="/dashboard" replace />
                ) : (
                  <Register onLogin={handleLogin} />
                )
              }
            />
            {/* Dashboard */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <Dashboard
                    user={user}
                    fetchStreak={fetchStreak}
                  />
                </ProtectedRoute>
              }
            />
            {/* Problems */}
            <Route
              path="/problems"
              element={
                <ProtectedRoute>
                  <Problems />
                </ProtectedRoute>
              }
            />
            {/* Default */}
            <Route
              path="/"
              element={<Navigate to="/login" replace />}
            />
            {/* 404 */}
            <Route
              path="*"
              element={<Navigate to="/login" replace />}
            />
          </Routes>
        </main>
        {/* ================= FOOTER ================= */}
        {token && (
          <footer
            className="
              border-t
              border-gray-200
              dark:border-darkBorder/40
              py-5
              text-center
              bg-gray-50
              dark:bg-[#070a13]
              transition-colors
              duration-300
            "
          >
            <p
              className="
                text-[10px]
                font-semibold
                text-gray-500
                dark:text-gray-500
              "
            >
              © 2026 AlgoTrack.AI. Built for Advanced ML-MERN portfolio.
            </p>
          </footer>
        )}
      </div>
    </Router>
  );
}
export default App;