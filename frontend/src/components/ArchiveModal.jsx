import React, { useEffect, useRef } from 'react';

const ArchiveModal = ({ resource, onConfirm, onCancel, submitting = false }) => {
  const cancelBtnRef = useRef(null);

  useEffect(() => {
    if (resource && cancelBtnRef.current) {
      cancelBtnRef.current.focus();
    }
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !submitting) {
        onCancel();
      }
    };
    if (resource) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [resource, submitting, onCancel]);

  if (!resource) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="archive-dialog-title"
      aria-describedby="archive-dialog-desc"
    >
      <div className="bg-white rounded-lg shadow-xl border border-slate-200 max-w-md w-full p-6">
        <span className="inline-block px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider bg-amber-100 text-amber-900 rounded-full mb-3">
          Confirm withdrawal
        </span>
        <h2 id="archive-dialog-title" className="text-lg font-bold text-slate-900">
          Withdraw "{resource.title}"?
        </h2>
        <p id="archive-dialog-desc" className="text-sm text-slate-600 mt-2">
          Archiving keeps this catalogue record for staff audit history, removes it from Student
          search results and saved reading lists, and disables direct Student detail links.
        </p>

        <div className="mt-6 flex justify-end gap-3">
          <button
            ref={cancelBtnRef}
            type="button"
            disabled={submitting}
            onClick={onCancel}
            className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => onConfirm(resource)}
            className="px-4 py-2 text-sm font-medium rounded-md bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600"
          >
            {submitting ? 'Archiving...' : 'Archive resource'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArchiveModal;
