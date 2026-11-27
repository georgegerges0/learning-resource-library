import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Register = () => {
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
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
      const response = await axiosInstance.post('/api/auth/register', formData);
      login(response.data);
      navigate('/catalogue');
    } catch (error) {
      const data = error.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      }
      setErrorMessage(data?.message || 'Registration failed. Please review the form and try again.');
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
        <h1 className="text-2xl font-bold text-slate-900 mb-2">Create Student account</h1>
        <p className="text-sm text-slate-600 mb-6">
          Register to search published resources and maintain your private reading list.
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
            <label htmlFor="reg-name" className="block text-sm font-medium text-slate-700 mb-1">
              Full name
            </label>
            <input
              id="reg-name"
              type="text"
              autoComplete="name"
              value={formData.name}
              aria-invalid={Boolean(fieldErrors.name)}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                fieldErrors.name ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
              placeholder="Alex Morgan"
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>}
          </div>

          <div className="mb-4">
            <label htmlFor="reg-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>
            <input
              id="reg-email"
              type="email"
              autoComplete="email"
              value={formData.email}
              aria-invalid={Boolean(fieldErrors.email)}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                fieldErrors.email ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
              placeholder="alex.morgan@connect.qut.edu.au"
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>}
          </div>

          <div className="mb-6">
            <label htmlFor="reg-password" className="block text-sm font-medium text-slate-700 mb-1">
              Password (minimum 8 characters)
            </label>
            <input
              id="reg-password"
              type="password"
              autoComplete="new-password"
              value={formData.password}
              aria-invalid={Boolean(fieldErrors.password)}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              className={`w-full p-2.5 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                fieldErrors.password ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
              placeholder="At least 8 characters"
            />
            {fieldErrors.password && (
              <p className="mt-1 text-xs text-red-700">{fieldErrors.password}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-medium py-2.5 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          >
            {submitting ? 'Creating account...' : 'Create account'}
          </button>
        </form>

        <p className="mt-5 text-center text-sm text-slate-600">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-700 font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  );
};

export default Register;
