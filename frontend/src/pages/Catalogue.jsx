import React, { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../axiosConfig';
import ResourceCard from '../components/ResourceCard';
import { STUDY_AREAS, RESOURCE_FORMATS } from '../constants/catalogueOptions';

const Catalogue = () => {
  const [keyword, setKeyword] = useState('');
  const [studyArea, setStudyArea] = useState('All');
  const [format, setFormat] = useState('All');
  const [resources, setResources] = useState([]);
  const [savedIds, setSavedIds] = useState(() => new Set());
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [feedback, setFeedback] = useState(null);

  const fetchCatalogue = useCallback(async (params) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/resources', { params });
      setResources(response.data);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.response?.data?.message || 'Unable to load catalogue results. Please try again.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedIds = useCallback(async () => {
    try {
      const response = await axiosInstance.get('/api/bookmarks');
      setSavedIds(new Set(response.data.map((b) => String(b.resourceId))));
    } catch (_) {
      // Non-blocking bookmark state fetch
    }
  }, []);

  useEffect(() => {
    fetchSavedIds();
  }, [fetchSavedIds]);

  useEffect(() => {
    const queryParams = {};
    if (keyword.trim()) queryParams.q = keyword.trim();
    if (studyArea !== 'All') queryParams.studyArea = studyArea;
    if (format !== 'All') queryParams.format = format;
    fetchCatalogue(queryParams);
  }, [keyword, studyArea, format, fetchCatalogue]);

  const handleSaveResource = async (resource) => {
    setSavingId(resource._id);
    setFeedback(null);
    try {
      await axiosInstance.post('/api/bookmarks', { resourceId: resource._id });
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.add(String(resource._id));
        return next;
      });
      setFeedback({
        type: 'success',
        text: `Saved "${resource.title}" to My Library.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text:
          error.response?.data?.message ||
          `Could not save "${resource.title}". Your selection is retained—please retry.`,
      });
    } finally {
      setSavingId(null);
    }
  };

  const handleResetFilters = () => {
    setKeyword('');
    setStudyArea('All');
    setFormat('All');
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-indigo-700">
          Student · Resource Catalogue
        </p>
        <h1 className="text-2xl font-bold text-slate-900 mt-1">
          Find recommended learning resources
        </h1>
        <p className="text-sm text-slate-600 mt-1">
          Find journal articles, videos, databases, standards and codes, learning material and industry reports.
        </p>
      </div>

      <section
        aria-label="Catalogue search and filters"
        className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 mb-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
          <div className="md:col-span-6">
            <label htmlFor="catalogue-keyword" className="block text-sm font-medium text-slate-700 mb-1">
              Search by keyword
            </label>
            <input
              id="catalogue-keyword"
              type="search"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="Search by title, topic or provider..."
              className="w-full p-2.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600"
            />
          </div>

          <div className="md:col-span-3">
            <label htmlFor="catalogue-area" className="block text-sm font-medium text-slate-700 mb-1">
              Study area
            </label>
            <select
              id="catalogue-area"
              value={studyArea}
              onChange={(e) => setStudyArea(e.target.value)}
              className="w-full p-2.5 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="All">All study areas</option>
              {STUDY_AREAS.map((area) => (
                <option key={area} value={area}>
                  {area}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-3">
            <label htmlFor="catalogue-format" className="block text-sm font-medium text-slate-700 mb-1">
              Format
            </label>
            <select
              id="catalogue-format"
              value={format}
              onChange={(e) => setFormat(e.target.value)}
              className="w-full p-2.5 text-sm border border-slate-300 rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600"
            >
              <option value="All">All formats</option>
              {RESOURCE_FORMATS.map((fmt) => (
                <option key={fmt} value={fmt}>
                  {fmt}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
          <span aria-live="polite">
            {loading
              ? 'Searching published resources...'
              : `${resources.length} ${resources.length === 1 ? 'resource' : 'resources'} found`}
          </span>
          {(keyword || studyArea !== 'All' || format !== 'All') && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-indigo-700 font-medium hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded px-1"
            >
              Reset filters
            </button>
          )}
        </div>
      </section>

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
          Loading published catalogue...
        </div>
      ) : resources.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-lg p-10 text-center">
          <h2 className="text-lg font-semibold text-slate-900 mb-1">No resources found</h2>
          <p className="text-sm text-slate-600 mb-5">
            Try another keyword, study area or resource format.
          </p>
          <button
            type="button"
            onClick={handleResetFilters}
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {resources.map((resource) => (
            <ResourceCard
              key={resource._id}
              resource={resource}
              isSaved={savedIds.has(String(resource._id))}
              saving={savingId === resource._id}
              onSave={handleSaveResource}
            />
          ))}
        </div>
      )}
    </main>
  );
};

export default Catalogue;
