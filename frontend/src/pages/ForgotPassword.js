import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import axios from '../utils/axios';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post('/auth/forgot-password', { email });
      if (response.data.success) {
        setSubmitted(true);
        toast.success('Password reset link sent to your email!');
      } else {
        toast.success('If an account exists with this email, you will receive a reset link.');
        setSubmitted(true);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to send reset link');
    } finally {
      setLoading(false);
    }
  };

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
                    🔑
                  </motion.div>
                  <h2 className="text-3xl font-bold text-gray-200">Forgot Password?</h2>
                  <p className="text-gray-400 mt-2">Enter your email to reset your password</p>
                </motion.div>

                {!submitted ? (
                  <form onSubmit={handleSubmit} className="space-y-6">
                    <motion.div
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                    >
                      <label className="block text-sm font-medium text-gray-300 mb-2">Email Address</label>
                      <div className="relative">
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full px-4 py-3 bg-dark-700 border border-dark-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-200 transition-all"
                          placeholder="Enter your registered email"
                        />
                        <motion.div
                          className="absolute left-0 bottom-0 h-0.5 bg-primary-500"
                          initial={{ width: 0 }}
                          animate={{ width: email ? '100%' : 0 }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        We'll send a password reset link to this email address
                      </p>
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
                        'Send Reset Link'
                      )}
                    </motion.button>
                  </form>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center"
                  >
                    <div className="text-6xl mb-4 animate-bounce">📧</div>
                    <h3 className="text-xl font-semibold text-gray-200 mb-2">Check Your Email</h3>
                    <p className="text-gray-400 mb-4">
                      We've sent a password reset link to <strong className="text-primary-400">{email}</strong>
                    </p>
                    <div className="bg-dark-700 rounded-lg p-4 mb-4">
                      <p className="text-sm text-gray-300">📌 Important Notes:</p>
                      <ul className="text-xs text-gray-400 mt-2 space-y-1 text-left">
                        <li>• The reset link will expire in 10 minutes</li>
                        <li>• Check your spam folder if you don't see the email</li>
                        <li>• Make sure you entered the correct email address</li>
                      </ul>
                    </div>
                    <button
                      onClick={() => navigate('/login')}
                      className="btn-primary w-full"
                    >
                      Back to Login
                    </button>
                  </motion.div>
                )}

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                  className="mt-6 text-center"
                >
                  <Link to="/login" className="text-sm text-primary-400 hover:text-primary-300">
                    ← Back to Login
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;