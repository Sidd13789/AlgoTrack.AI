import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, Lock, Brain } from 'lucide-react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post('/api/auth/login', {
        email,
        password
      });

      onLogin(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err) {
      setError(
        err.response?.data?.error ||
        'Invalid credentials. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center min-h-[75vh]">
      
      <div
        className="
          w-full
          max-w-md
          p-8
          rounded-2xl
          glass-panel
          glow-purple
          relative
          overflow-hidden
          bg-white
          dark:bg-transparent
          border
          border-gray-200
          dark:border-transparent
        "
      >
        
        {/* Top Gradient */}
        <div
          className="
            absolute
            top-0
            left-0
            w-full
            h-[3px]
            bg-gradient-to-r
            from-blue-500
            via-purple-500
            to-orange-500
          "
        ></div>

        {/* Header */}
        <div className="flex flex-col items-center mb-8">
          
          <div
            className="
              bg-gradient-to-tr
              from-blue-600
              to-purple-600
              p-3
              rounded-2xl
              text-white
              shadow-lg
              mb-3
            "
          >
            <Brain size={32} />
          </div>

          <h2
            className="
              text-3xl
              font-extrabold
              tracking-tight
              text-gray-900
              dark:text-white
              font-sans
              text-center
            "
          >
            Welcome Back
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
            Sign in to access your adaptive learning dashboard
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

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">

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
                  dark:text-gray-500
                "
              >
                <Mail size={18} />
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
                  py-3
                  pl-11
                  pr-4
                  text-gray-900
                  dark:text-white
                  placeholder-gray-400
                  dark:placeholder-gray-500
                  focus:outline-none
                  focus:border-purple-500
                  focus:ring-1
                  focus:ring-purple-500
                  transition-all
                  text-sm
                "
                placeholder="you@example.com"
              />
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
                  dark:text-gray-500
                "
              >
                <Lock size={18} />
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
                  py-3
                  pl-11
                  pr-4
                  text-gray-900
                  dark:text-white
                  placeholder-gray-400
                  dark:placeholder-gray-500
                  focus:outline-none
                  focus:border-purple-500
                  focus:ring-1
                  focus:ring-purple-500
                  transition-all
                  text-sm
                "
                placeholder="••••••••"
              />
            </div>
          </div>

          {/* Sign In Button */}
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
              cursor-pointer
            "
          >
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        {/* Register Link */}
        <div className="mt-8 text-center text-sm">
          <p className="text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}

            <Link
              to="/register"
              className="
                text-purple-600
                dark:text-purple-400
                hover:text-purple-500
                dark:hover:text-purple-300
                font-semibold
                underline
                underline-offset-4
              "
            >
              Create Account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
export default Login;