import React, { useState } from 'react';
import { loginUser, signupUser } from '../services/api';

const WelcomePage = ({ onLogin }) => {
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAuth = async () => {
    setError('');
    setLoading(true);
  
    const trimmedUsername = username.trim();
  
    // Frontend validation before sending to backend
    if (!trimmedUsername || (!isLoginMode && password.length < 6)) {
      setError(
        "Username must be at least 3 characters and password at least 6."
      );
      setLoading(false);
      return;
    }
  
    try {
      console.log("Sending request:", { username: trimmedUsername, password });
  
      if (isLoginMode) {
        await loginUser(trimmedUsername, password);
      } else {
        await signupUser(trimmedUsername, password);
      }
  
      // Use the onLogin callback from props to navigate
      if (typeof onLogin === 'function') {
        onLogin();
      } else {
        console.warn("onLogin prop is not a function");
      }
    } catch (err) {
      console.error("Auth error:", err); // debug
      setError(err.detail || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 dark:bg-zinc-900 bg-gray-100 transition-colors duration-500">
      <div className="bg-white dark:bg-zinc-800 rounded-2xl shadow-xl p-8 sm:p-12 w-full max-w-sm border border-gray-200 dark:border-zinc-700">
        <h1 className="text-3xl font-bold text-center mb-6 dark:text-purple-300 text-purple-600">
          {isLoginMode ? 'Log In' : 'Sign Up'}
        </h1>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAuth();
          }}
          className="space-y-6"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Username</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              minLength={3}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white transition-colors duration-300 px-3 py-2"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={isLoginMode ? 0 : 6}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring focus:ring-purple-200 focus:ring-opacity-50 dark:bg-zinc-700 dark:border-zinc-600 dark:text-white transition-colors duration-300 px-3 py-2"
            />
          </div>

          {error && (
            <div className="text-sm font-medium text-red-500 text-center">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 text-white font-semibold rounded-md shadow-lg bg-purple-600 hover:bg-purple-700 transition-colors duration-300 disabled:opacity-50"
          >
            {loading ? 'Processing...' : (isLoginMode ? 'Log In' : 'Sign Up')}
          </button>
        </form>

        <p className="mt-4 text-center text-sm dark:text-gray-400 text-gray-600">
          {isLoginMode ? "Don't have an account?" : "Already have an account?"}
          <button
            onClick={() => {
              setIsLoginMode(!isLoginMode);
              setError('');
              setUsername('');
              setPassword('');
            }}
            className="ml-1 font-semibold dark:text-purple-400 text-purple-600 hover:text-purple-500"
          >
            {isLoginMode ? 'Sign Up' : 'Log In'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default WelcomePage;
