import React from 'react';
import { Link } from 'react-router-dom';
import StatusBadge from './StatusBadge';

const ResourceCard = ({ resource, isSaved = false, onSave, onRemove, saving = false }) => {
  return (
    <article className="bg-white border border-slate-200 rounded-lg shadow-sm p-5 flex flex-col justify-between hover:border-slate-300 transition-colors">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-slate-900 leading-snug">
              <Link
                to={`/resources/${resource._id}`}
                className="hover:text-indigo-700 focus:outline-none focus:underline"
              >
                {resource.title}
              </Link>
            </h2>
            <p className="text-sm font-medium text-slate-600 mt-0.5">{resource.provider}</p>
          </div>
          {isSaved && <StatusBadge status="Saved" />}
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-slate-100 text-slate-800">
            {resource.studyArea}
          </span>
          <span className="inline-flex items-center px-2.5 py-0.5 rounded text-xs font-medium bg-indigo-50 text-indigo-800">
            {resource.format}
          </span>
        </div>

        <p className="text-sm text-slate-700 mt-3 line-clamp-3">{resource.description}</p>
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
        <Link
          to={`/resources/${resource._id}`}
          className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          View details
        </Link>

        {onRemove ? (
          <button
            type="button"
            disabled={saving}
            onClick={() => onRemove(resource)}
            className="inline-flex items-center px-3.5 py-2 text-sm font-medium rounded-md border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600"
          >
            Remove
          </button>
        ) : onSave ? (
          <button
            type="button"
            disabled={saving || isSaved}
            onClick={() => onSave(resource)}
            aria-pressed={isSaved}
            className={`inline-flex items-center px-4 py-2 text-sm font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-600 ${
              isSaved
                ? 'bg-emerald-50 text-emerald-900 border border-emerald-300 cursor-default'
                : 'bg-indigo-600 text-white hover:bg-indigo-700'
            }`}
          >
            {isSaved ? 'Saved' : saving ? 'Saving...' : 'Save'}
          </button>
        ) : null}
      </div>
    </article>
  );
};

export default ResourceCard;
