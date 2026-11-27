import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Login = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState({});
  const [errorMessage, setErrorMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setFieldErrors({});
    setSubmitting(true);

    try {
      const response = await axiosInstance.post('/api/auth/login', formData);
      login(response.data);
      navigate(response.data.role === 'admin' ? '/admin' : '/catalogue');
    } catch (error) {
      const data = error.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      }
      setErrorMessage(data?.message || 'Sign-in failed. Please check your credentials and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-md mx-auto mt-14 px-4">
      <div className="bg-white p-8 shadow-sm border border-slate-200 rounded-lg">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700 mb-1">
          Kadidjiny Library
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Sign in to your account</h1>
        <p className="text-sm text-slate-600 mb-6">
          Search recommended learning resources or manage catalogue publications.
        </p>

        {errorMessage && (
          <div
            role="alert"
            className="mb-4 p-3 rounded-md bg-red-50 border border-red-200 text-sm text-red-800"
          >
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div className="mb-4">
            <label htmlFor="login-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={formData.email}
              aria-invalid={Boolean(fieldErrors.email)}
              aria-describedby={fieldErrors.email ? 'login-email-error' : undefined}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                fieldErrors.email ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
              placeholder="name@university.edu.au"
            />
            {fieldErrors.email && (
              <p id="login-email-error" className="mt-1 text-xs text-red-700">
                {fieldErrors.email}
              </p>
            )}
          </div>

          <div className="mb-6">
            <label htmlFor="login-password" className="block text-sm font-medium text-slate-700 mb-1">
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={formData.password}
              aria-invalid={Boolean(fieldErrors.password)}
              aria-describedby={fieldErrors.password ? 'login-password-error' : undefined}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                fieldErrors.password ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
              placeholder="Enter your password"
            />
            {fieldErrors.password && (
              <p id="login-password-error" className="mt-1 text-xs text-red-700">
                {fieldErrors.password}
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          New to Kadidjiny Library?{' '}
          <Link to="/register" className="text-indigo-700 font-medium hover:underline">
            Create a Student account
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Login;
