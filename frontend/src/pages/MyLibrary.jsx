import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import ResourceCard from '../components/ResourceCard';

const MyLibrary = () => {
  const [bookmarks, setBookmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [removingId, setRemovingId] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const loadBookmarks = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/bookmarks');
      setBookmarks(response.data);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.response?.data?.message || 'Unable to load your reading list.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadBookmarks();
  }, [loadBookmarks]);

  const handleRemove = async (resource) => {
    setRemovingId(resource._id);
    setFeedback(null);
    try {
      await axiosInstance.delete(`/api/bookmarks/${resource._id}`);
      setBookmarks((prev) => prev.filter((b) => b.resource._id !== resource._id));
      setFeedback({
        type: 'success',
        text: `Removed "${resource.title}" from My Library. It remains available in the catalogue.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.response?.data?.message || 'Unable to remove item. Please try again.',
      });
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
            Student · Personal Collection
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">My Library reading list</h1>
          <p className="text-sm text-slate-600 mt-1">
            Your private saved resources remain available across sessions while published by library staff.
          </p>
        </div>
        <Link
          to="/catalogue"
          className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          Browse catalogue
        </Link>
      </div>

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`mb-6 p-4 rounded-md border text-sm ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {feedback.text}
        </div>
      )}

      {loading ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center text-sm text-slate-500">
          Loading saved reading list...
        </div>
      ) : bookmarks.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">Your reading list is empty</h2>
          <p className="text-sm text-slate-600 mb-5">
            Save articles, videos or standards from the catalogue to revisit them here later.
          </p>
          <Link
            to="/catalogue"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          >
            Browse catalogue
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {bookmarks.map((entry) => (
            <ResourceCard
              key={entry._id}
              resource={entry.resource}
              isSaved
              saving={removingId === entry.resource._id}
              onRemove={handleRemove}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default MyLibrary;
