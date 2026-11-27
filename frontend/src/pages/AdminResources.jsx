import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import axiosInstance from '../axiosConfig';
import StatusBadge from '../components/StatusBadge';
import ArchiveModal from '../components/ArchiveModal';
import { STUDY_AREAS, RESOURCE_FORMATS } from '../constants/catalogueOptions';

const INITIAL_FORM = {
  title: '',
  provider: '',
  studyArea: 'Engineering',
  format: 'Video',
  description: '',
  accessUrl: '',
};

const AdminResources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editingStatus, setEditingStatus] = useState('Draft');
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [fieldErrors, setFieldErrors] = useState({});
  const [feedback, setFeedback] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState(null);

  const loadManagedResources = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/api/resources/manage');
      setResources(response.data);
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.response?.data?.message || 'Unable to load catalogue management records.',
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadManagedResources();
  }, [loadManagedResources]);

  const handleSelectEdit = (item) => {
    setEditingId(item._id);
    setEditingStatus(item.status);
    setFormData({
      title: item.title || '',
      provider: item.provider || '',
      studyArea: item.studyArea || 'Engineering',
      format: item.format || 'Video',
      description: item.description || '',
      accessUrl: item.accessUrl || '',
    });
    setFieldErrors({});
    setFeedback(null);
  };

  const handleResetForm = () => {
    setEditingId(null);
    setEditingStatus('Draft');
    setFormData(INITIAL_FORM);
    setFieldErrors({});
    setFeedback(null);
  };

  const submitForm = async (targetStatus) => {
    setSubmitting(true);
    setFieldErrors({});
    setFeedback(null);

    try {
      let response;
      if (editingId) {
        if (targetStatus === 'Published') {
          response = await axiosInstance.patch(`/api/resources/${editingId}/publish`, formData);
        } else {
          response = await axiosInstance.put(`/api/resources/${editingId}`, {
            ...formData,
            status: targetStatus,
          });
        }
        setResources((prev) =>
          prev.map((item) => (item._id === response.data._id ? response.data : item))
        );
      } else {
        response = await axiosInstance.post('/api/resources', {
          ...formData,
          status: targetStatus,
        });
        setResources((prev) => [response.data, ...prev]);
      }

      setEditingId(response.data._id);
      setEditingStatus(response.data.status);
      setFeedback({
        type: 'success',
        text:
          response.data.status === 'Published'
            ? 'Resource published to the catalogue.'
            : 'Draft saved. Draft records remain hidden from Students until published.',
        published: response.data.status === 'Published',
      });
    } catch (error) {
      const data = error.response?.data;
      if (data?.fieldErrors) {
        setFieldErrors(data.fieldErrors);
      }
      setFeedback({
        type: 'error',
        text: data?.message || 'Unable to save resource. Valid field entries have been preserved.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleQuickPublish = async (item) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await axiosInstance.patch(`/api/resources/${item._id}/publish`);
      setResources((prev) =>
        prev.map((r) => (r._id === response.data._id ? response.data : r))
      );
      if (editingId === item._id) {
        setEditingStatus('Published');
      }
      setFeedback({
        type: 'success',
        text: `"${response.data.title}" is now Published in the student catalogue.`,
        published: true,
      });
    } catch (error) {
      const data = error.response?.data;
      if (data?.fieldErrors) {
        handleSelectEdit(item);
        setFieldErrors(data.fieldErrors);
      }
      setFeedback({
        type: 'error',
        text: data?.message || 'Unable to publish draft until all metadata fields are valid.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleConfirmArchive = async (item) => {
    setSubmitting(true);
    setFeedback(null);
    try {
      const response = await axiosInstance.patch(`/api/resources/${item._id}/archive`);
      setResources((prev) =>
        prev.map((r) => (r._id === response.data._id ? response.data : r))
      );
      if (editingId === item._id) {
        setEditingStatus('Archived');
      }
      setArchiveTarget(null);
      setFeedback({
        type: 'success',
        text: `Withdrew "${response.data.title}". It is now hidden from Student search, My Library and detail views.`,
      });
    } catch (error) {
      setFeedback({
        type: 'error',
        text: error.response?.data?.message || 'Unable to archive resource.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-6 flex flex-wrap justify-between items-end gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-amber-700">
            Administrator · Catalogue Management
          </p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">
            Resource details, preview and publication
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Add or edit catalogue entries so students can find recommended resources by keyword, study area or format.
          </p>
        </div>
        <button
          type="button"
          onClick={handleResetForm}
          className="px-4 py-2 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-700 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
        >
          + New resource draft
        </button>
      </div>

      {feedback && (
        <div
          role={feedback.type === 'error' ? 'alert' : 'status'}
          aria-live="polite"
          className={`mb-6 p-4 rounded-md border flex flex-wrap items-center justify-between gap-3 ${
            feedback.type === 'error'
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <span className="text-sm font-medium">{feedback.text}</span>
          {feedback.published && (
            <Link
              to="/catalogue"
              className="text-sm font-semibold text-emerald-900 underline hover:text-emerald-700"
            >
              View student catalogue →
            </Link>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Management Table */}
        <section
          aria-labelledby="management-table-heading"
          className="lg:col-span-7 bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden"
        >
          <div className="px-5 py-4 border-b border-slate-200 flex justify-between items-center">
            <h2 id="management-table-heading" className="text-base font-semibold text-slate-900">
              Catalogue records ({resources.length})
            </h2>
            <span className="text-xs text-slate-500">Drafts stay hidden from Students</span>
          </div>

          {loading ? (
            <p className="p-6 text-sm text-slate-500">Loading catalogue records...</p>
          ) : resources.length === 0 ? (
            <div className="p-8 text-center">
              <p className="text-sm font-medium text-slate-800 mb-1">No catalogue records yet</p>
              <p className="text-sm text-slate-500">
                Use the form alongside to create a draft and preview it before publishing.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    <th className="py-3 px-4">Resource title</th>
                    <th className="py-3 px-3">Area · Format</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 text-sm">
                  {resources.map((item) => (
                    <tr
                      key={item._id}
                      className={editingId === item._id ? 'bg-indigo-50/50' : 'hover:bg-slate-50'}
                    >
                      <td className="py-3.5 px-4">
                        <div className="font-medium text-slate-900">{item.title}</div>
                        <div className="text-xs text-slate-500">{item.provider}</div>
                      </td>
                      <td className="py-3.5 px-3 text-xs text-slate-600">
                        <div>{item.studyArea}</div>
                        <div className="text-slate-500">{item.format}</div>
                      </td>
                      <td className="py-3.5 px-3">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3.5 px-4 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => handleSelectEdit(item)}
                          className="px-2.5 py-1 text-xs font-medium rounded border border-slate-300 bg-white text-slate-700 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                        >
                          Edit
                        </button>
                        {item.status === 'Draft' && (
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleQuickPublish(item)}
                            className="px-2.5 py-1 text-xs font-medium rounded bg-emerald-600 text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          >
                            Publish
                          </button>
                        )}
                        {item.status === 'Published' && (
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => setArchiveTarget(item)}
                            className="px-2.5 py-1 text-xs font-medium rounded border border-red-200 bg-red-50 text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600"
                          >
                            Withdraw
                          </button>
                        )}
                        {item.status === 'Archived' && (
                          <button
                            type="button"
                            disabled={submitting}
                            onClick={() => handleQuickPublish(item)}
                            className="px-2.5 py-1 text-xs font-medium rounded border border-emerald-300 bg-emerald-50 text-emerald-900 hover:bg-emerald-100 focus:outline-none focus:ring-2 focus:ring-emerald-600"
                          >
                            Republish
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Metadata Form + Live Catalogue Preview */}
        <section
          aria-labelledby="resource-form-heading"
          className="lg:col-span-5 space-y-6"
        >
          <div className="bg-white border border-slate-200 rounded-lg shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 id="resource-form-heading" className="text-base font-semibold text-slate-900">
                {editingId ? 'Edit resource' : 'Add a resource'}
              </h2>
              <StatusBadge status={editingId ? editingStatus : 'Draft'} />
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitForm('Published');
              }}
              noValidate
              className="space-y-4"
            >
              <div>
                <label htmlFor="res-title" className="block text-sm font-medium text-slate-700 mb-1">
                  Resource title
                </label>
                <input
                  id="res-title"
                  type="text"
                  value={formData.title}
                  aria-invalid={Boolean(fieldErrors.title)}
                  aria-describedby={fieldErrors.title ? 'res-title-error' : undefined}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Structural steel design"
                  className={`w-full p-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                    fieldErrors.title ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.title && (
                  <p id="res-title-error" className="mt-1 text-xs text-red-700">
                    {fieldErrors.title}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="res-provider" className="block text-sm font-medium text-slate-700 mb-1">
                  Author or provider
                </label>
                <input
                  id="res-provider"
                  type="text"
                  value={formData.provider}
                  aria-invalid={Boolean(fieldErrors.provider)}
                  aria-describedby={fieldErrors.provider ? 'res-provider-error' : undefined}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  placeholder="e.g. University engineering collection"
                  className={`w-full p-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                    fieldErrors.provider ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.provider && (
                  <p id="res-provider-error" className="mt-1 text-xs text-red-700">
                    {fieldErrors.provider}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="res-area" className="block text-sm font-medium text-slate-700 mb-1">
                    Study area
                  </label>
                  <select
                    id="res-area"
                    value={formData.studyArea}
                    aria-invalid={Boolean(fieldErrors.studyArea)}
                    onChange={(e) => setFormData({ ...formData, studyArea: e.target.value })}
                    className={`w-full p-2.5 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                      fieldErrors.studyArea ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    {STUDY_AREAS.map((area) => (
                      <option key={area} value={area}>
                        {area}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.studyArea && (
                    <p className="mt-1 text-xs text-red-700">{fieldErrors.studyArea}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="res-format" className="block text-sm font-medium text-slate-700 mb-1">
                    Format
                  </label>
                  <select
                    id="res-format"
                    value={formData.format}
                    aria-invalid={Boolean(fieldErrors.format)}
                    onChange={(e) => setFormData({ ...formData, format: e.target.value })}
                    className={`w-full p-2.5 text-sm border rounded-md bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                      fieldErrors.format ? 'border-red-500' : 'border-slate-300'
                    }`}
                  >
                    {RESOURCE_FORMATS.map((fmt) => (
                      <option key={fmt} value={fmt}>
                        {fmt}
                      </option>
                    ))}
                  </select>
                  {fieldErrors.format && (
                    <p className="mt-1 text-xs text-red-700">{fieldErrors.format}</p>
                  )}
                </div>
              </div>

              <div>
                <label htmlFor="res-desc" className="block text-sm font-medium text-slate-700 mb-1">
                  Description
                </label>
                <textarea
                  id="res-desc"
                  rows={3}
                  value={formData.description}
                  aria-invalid={Boolean(fieldErrors.description)}
                  aria-describedby={fieldErrors.description ? 'res-desc-error' : undefined}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Summarise the scope and learning value for students..."
                  className={`w-full p-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                    fieldErrors.description ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.description && (
                  <p id="res-desc-error" className="mt-1 text-xs text-red-700">
                    {fieldErrors.description}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="res-url" className="block text-sm font-medium text-slate-700 mb-1">
                  Access URL
                </label>
                <input
                  id="res-url"
                  type="url"
                  value={formData.accessUrl}
                  aria-invalid={Boolean(fieldErrors.accessUrl)}
                  aria-describedby={fieldErrors.accessUrl ? 'res-url-error' : undefined}
                  onChange={(e) => setFormData({ ...formData, accessUrl: e.target.value })}
                  placeholder="https://example.edu/structural-steel"
                  className={`w-full p-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-600 ${
                    fieldErrors.accessUrl ? 'border-red-500 bg-red-50/30' : 'border-slate-300'
                  }`}
                />
                {fieldErrors.accessUrl && (
                  <p id="res-url-error" className="mt-1 text-xs text-red-700">
                    {fieldErrors.accessUrl}
                  </p>
                )}
              </div>

              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  type="button"
                  disabled={submitting}
                  onClick={() => submitForm('Draft')}
                  className="flex-1 py-2.5 px-4 text-sm font-medium rounded-md border border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                >
                  Save draft
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2.5 px-4 text-sm font-medium rounded-md bg-indigo-600 text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600"
                >
                  Publish
                </button>
              </div>
            </form>
          </div>

          {/* Live Catalogue Preview matching Figma prototype */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Catalogue preview
              </span>
              <StatusBadge status={editingId ? editingStatus : 'Draft'} />
            </div>
            <h3 className="text-base font-semibold text-slate-900">
              {formData.title.trim() || 'Untitled resource'}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              {formData.provider.trim() || 'Provider attribution'} · {formData.studyArea} · {formData.format}
            </p>
            <p className="text-sm text-slate-700 mt-2 line-clamp-3">
              {formData.description.trim() || 'Resource summary will appear here once entered.'}
            </p>
          </div>
        </section>
      </div>
      <ArchiveModal
        resource={archiveTarget}
        submitting={submitting}
        onCancel={() => setArchiveTarget(null)}
        onConfirm={handleConfirmArchive}
      />
    </main>
  );
};

export default AdminResources;
