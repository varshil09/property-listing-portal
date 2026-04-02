import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(`/auth/reset-password/${token}`, { password });
      if (response.data.success) {
        setResetSuccess(true);
        toast.success('Password reset successful! Please login with your new password.');
        setTimeout(() => {
          navigate('/login');
        }, 3000);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
        <Navbar />
        <div className="container mx-auto px-4 py-12">
          <div className="flex justify-center items-center min-h-[calc(100vh-5rem)]">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-md w-full bg-dark-800 rounded-2xl shadow-2xl p-8 text-center"
            >
              <div className="text-6xl mb-4 animate-bounce">✅</div>
              <h2 className="text-2xl font-bold text-gray-200 mb-2">Password Reset Successful!</h2>
              <p className="text-gray-400 mb-6">
                Your password has been changed successfully. You will be redirected to login page.
              </p>
              <button
                onClick={() => navigate('/login')}
                className="btn-primary w-full"
              >
                Go to Login
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-dark-950 via-dark-900 to-dark-950">
      <Navbar />
      <div className="container mx-auto px-4 py-12">
        <div className="flex justify-center items-center min-h-[calc(100vh-5rem)]">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ type: 'spring', duration: 0.8 }}
            className="w-full max-w-md"
          >
            <motion.div
              className="relative bg-dark-800 rounded-2xl shadow-2xl overflow-hidden"
              whileHover={{ boxShadow: '0 25px 50px -12px rgba(59,130,246,0.25)' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-primary-500/10 to-purple-500/10"
                animate={{
                  background: [
                    'linear-gradient(45deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
                    'linear-gradient(135deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
                    'linear-gradient(225deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1))',
                    'linear-gradient(315deg, rgba(139,92,246,0.1), rgba(59,130,246,0.1))',
                  ]
                }}
                transition={{ duration: 5, repeat: Infinity }}
              />

              <div className="relative p-8">
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="text-center mb-8"
                >
                  <motion.div
                    animate={{
                      scale: [1, 1.1, 1],
                      rotate: [0, 10, -10, 0]
                    }}
                    transition={{ duration: 0.5, delay: 0.5 }}
                    className="text-5xl mb-4"
                  >
                    🔒
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-200">Reset Password</h2>
                  <p className="text-gray-400 mt-2">Enter your new password</p>
                </motion.div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <motion.div
                    initial={{ x: -50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">New Password</label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-200 pr-12"
                        placeholder="Enter new password (min. 6 characters)"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <motion.div
                        className="absolute left-0 bottom-0 h-0.5 bg-primary-500"
                        initial={{ width: 0 }}
                        animate={{ width: password ? '100%' : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>

                  <motion.div
                    initial={{ x: 50, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                  >
                    <label className="block text-sm font-medium text-gray-300 mb-2">Confirm Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-200 pr-12"
                        placeholder="Confirm your new password"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-300"
                      >
                        {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
                      </button>
                      <motion.div
                        className="absolute left-0 bottom-0 h-0.5 bg-primary-500"
                        initial={{ width: 0 }}
                        animate={{ width: confirmPassword ? '100%' : 0 }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>
                  </motion.div>

                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    animate={{
                      background: loading
                        ? 'linear-gradient(135deg, #4b5563, #374151)'
                        : 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                    }}
                    className="w-full py-3 rounded-xl text-white font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity }}
                        className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mx-auto"
                      />
                    ) : (
                      'Reset Password'
                    )}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;