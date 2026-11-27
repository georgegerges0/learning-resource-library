import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import StatusBadge from '../components/StatusBadge';

const ResourceDetail = () => {
  const { id } = useParams();
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const loadDetail = async () => {
      setLoading(true);
      setErrorMessage('');
      try {
        const response = await axiosInstance.get(`/api/resources/${id}`);
        setResource(response.data);
      } catch (error) {
        setErrorMessage(
          error.response?.data?.message ||
            'This resource is no longer available in the student catalogue.'
        );
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [id]);

  if (loading) {
    return (
      <main className="max-w-3xl mx-auto px-4 py-12 text-center text-sm text-slate-500">
        Loading resource details...
      </main>
    );
  }

  if (errorMessage || !resource) {
    return (
      <main className="max-w-2xl mx-auto px-4 py-12">
        <div
          role="alert"
          className="bg-white border border-slate-200 rounded-lg shadow-sm p-8 text-center"
        >
          <span className="inline-block px-3 py-1 text-xs font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 rounded-full mb-3">
            Resource Unavailable
          </span>
          <h1 className="text-xl font-bold text-slate-900 mb-2">
            Catalogue record not available
          </h1>
          <p className="text-sm text-slate-600 mb-6">{errorMessage}</p>
          <Link
            to="/catalogue"
            className="inline-flex items-center px-4 py-2 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            Back to Student Catalogue
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      <div className="mb-4">
        <Link
          to="/catalogue"
          className="text-sm font-medium text-indigo-700 hover:underline focus:outline-none focus:ring-2 focus:ring-indigo-600 rounded px-1"
        >
          ← Back to Student Catalogue
        </Link>
      </div>

      <article className="bg-white border border-slate-200 rounded-lg shadow-sm p-8">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
              {resource.studyArea}
            </span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-800">
              {resource.format}
            </span>
          </div>
          <StatusBadge status={resource.status} />
        </div>

        <h1 className="text-2xl font-bold text-slate-900">{resource.title}</h1>
        <p className="text-sm font-medium text-slate-600 mt-1">
          Provider / Attribution: <span className="text-slate-900">{resource.provider}</span>
        </p>

        <div className="mt-6 pt-6 border-t border-slate-100">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-2">
            Overview
          </h2>
          <p className="text-base text-slate-800 whitespace-pre-line leading-relaxed">
            {resource.description}
          </p>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
          <a
            href={resource.accessUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-5 py-2.5 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
          >
            Open external resource ↗
          </a>
        </div>
      </article>
    </main>
  );
};

export default ResourceDetail;
