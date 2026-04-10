import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { ENDPOINTS } from '../api/endpoints';
import { User, Lock, Mail, Loader2, AlertCircle } from 'lucide-react';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const URL = `${import.meta.env.VITE_AUTH_API_URL}${ENDPOINTS.AUTH.REGISTER}`;

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await axios.post(URL, formData);
      const { user, token } = response.data;
      
      login(user, token);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.details || 'Registration failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden">
        {/* Header Section */}
        <div className="bg-purple-700 px-8 py-10 text-center">
          <h2 className="text-3xl font-bold text-white tracking-tight">Join Us</h2>
          <p className="text-purple-100 mt-2 text-sm font-medium">Create your civic engagement account</p>
        </div>

        {/* Form Section */}
        <div className="px-8 py-8">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-lg flex items-start gap-3 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  name="name"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white text-sm"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white text-sm"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  name="password"
                  className="w-full pl-10 pr-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-colors text-slate-800 placeholder-slate-400 bg-slate-50 focus:bg-white text-sm"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  minLength="6"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="mt-2 w-full bg-purple-700 hover:bg-purple-800 text-white font-semibold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-600 focus:ring-offset-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-md shadow-purple-200"
            >
              {isLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create Account'
              )}
            </button>
          </form>
        </div>

        {/* Footer Section */}
        <div className="px-8 py-5 bg-slate-50 border-t border-slate-100/60 text-center">
          <p className="text-sm text-slate-600 font-medium">
            Already have an account?{' '}
            <Link to="/login" className="text-purple-700 hover:text-purple-800 font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;
