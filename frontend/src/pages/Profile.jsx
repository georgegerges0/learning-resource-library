import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosInstance from '../axiosConfig';

const Profile = () => {
  const { user, login } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    university: '',
    address: '',
  });
  const [fieldErrors, setFieldErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      try {
        const response = await axiosInstance.get('/api/auth/profile');
        setFormData({
          name: response.data.name || '',
          email: response.data.email || '',
          university: response.data.university || '',
          address: response.data.address || '',
        });
      } catch (error) {
        setFeedback({
          type: 'error',
          text: error.response?.data?.message || 'Unable to load profile details.',
        });
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchProfile();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setFieldErrors({});
    setFeedback(null);
    try {
      const response = await axiosInstance.put('/api/auth/profile', formData);
      login(response.data);
      setFeedback({
        type: 'success',
        text: 'Profile updated.',
      });
    } catch (error) {
      const data = error.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      }
      setFeedback({
        type: 'error',
        text: data?.message || 'Unable to update profile. Valid entries have been preserved.',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <main id="main-content" className="max-w-lg mx-auto px-4 py-12 text-center text-sm text-slate-500">
        Loading account profile...
      </main>
    );
  }

  return (
    <main id="main-content" className="max-w-lg mx-auto px-4 py-10">
      <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-slate-900">Account profile</h1>
          <span className="px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wide rounded-full bg-slate-100 text-slate-800 border border-slate-300">
            {user?.role === 'admin' ? 'Administrator' : 'Student'}
          </span>
        </div>

        {feedback && (
          <div
            role={feedback.type === 'error' ? 'alert' : 'status'}
            aria-live="polite"
            className={`mb-5 p-3.5 rounded-md border text-sm ${
              feedback.type === 'error'
                ? 'bg-red-50 border-red-200 text-red-800'
                : 'bg-emerald-50 border-emerald-200 text-emerald-900'
            }`}
          >
            {feedback.text}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          <div>
            <label htmlFor="profile-name" className="block text-sm font-medium text-slate-700 mb-1">
              Full name
            </label>
            <input
              id="profile-name"
              type="text"
              value={formData.name}
              aria-invalid={Boolean(fieldErrors.name)}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className={`w-full p-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                fieldErrors.name ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {fieldErrors.name && <p className="mt-1 text-xs text-red-700">{fieldErrors.name}</p>}
          </div>

          <div>
            <label htmlFor="profile-email" className="block text-sm font-medium text-slate-700 mb-1">
              Email address
            </label>
            <input
              id="profile-email"
              type="email"
              value={formData.email}
              aria-invalid={Boolean(fieldErrors.email)}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              className={`w-full p-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                fieldErrors.email ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
              }`}
            />
            {fieldErrors.email && <p className="mt-1 text-xs text-red-700">{fieldErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="profile-uni" className="block text-sm font-medium text-slate-700 mb-1">
              University / Faculty
            </label>
            <input
              id="profile-uni"
              type="text"
              value={formData.university}
              onChange={(e) => setFormData({ ...formData, university: e.target.value })}
              placeholder="Queensland University of Technology"
              className="w-full p-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div>
            <label htmlFor="profile-campus" className="block text-sm font-medium text-slate-700 mb-1">
              Campus or location
            </label>
            <input
              id="profile-campus"
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Gardens Point, Brisbane"
              className="w-full p-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="w-full py-2.5 px-4 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          >
            {saving ? 'Saving changes...' : 'Save profile'}
          </button>
        </form>
      </div>
    </main>
  );
};

export default Profile;
