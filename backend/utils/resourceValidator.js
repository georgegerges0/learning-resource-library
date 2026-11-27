const { STUDY_AREAS, RESOURCE_FORMATS } = require('../models/Resource');

const isValidHttpUrl = (value) => {
  try {
    const parsed = new URL(value);
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return false;
    }
    return Boolean(parsed.hostname && parsed.hostname.includes('.'));
  } catch (_) {
    return false;
  }
};

const validateResourceInput = (payload = {}) => {
  const fieldErrors = {};

  const title = payload.title !== undefined ? String(payload.title).trim() : '';
  const description = payload.description !== undefined ? String(payload.description).trim() : '';
  const provider = payload.provider !== undefined ? String(payload.provider).trim() : '';
  const studyArea = payload.studyArea !== undefined ? String(payload.studyArea).trim() : '';
  const format = payload.format !== undefined ? String(payload.format).trim() : '';
  const accessUrl = payload.accessUrl !== undefined ? String(payload.accessUrl).trim() : '';

  if (!title) {
    fieldErrors.title = 'Enter a resource title before saving.';
  } else if (title.length > 180) {
    fieldErrors.title = 'Resource title must be 180 characters or fewer.';
  }

  if (!provider) {
    fieldErrors.provider = 'Enter the author or provider attribution.';
  } else if (provider.length > 160) {
    fieldErrors.provider = 'Provider attribution must be 160 characters or fewer.';
  }

  if (!studyArea) {
    fieldErrors.studyArea = 'Select a primary study area.';
  } else if (!STUDY_AREAS.includes(studyArea)) {
    fieldErrors.studyArea = `Study area must be one of: ${STUDY_AREAS.join(', ')}.`;
  }

  if (!format) {
    fieldErrors.format = 'Select a resource format.';
  } else if (!RESOURCE_FORMATS.includes(format)) {
    fieldErrors.format = `Format must be one of: ${RESOURCE_FORMATS.join(', ')}.`;
  }

  if (!description) {
    fieldErrors.description = 'Enter a concise description of the learning resource.';
  } else if (description.length > 2000) {
    fieldErrors.description = 'Description must be 2000 characters or fewer.';
  }

  if (!accessUrl) {
    fieldErrors.accessUrl = 'Enter the destination access URL (https://...).';
  } else if (!isValidHttpUrl(accessUrl)) {
    fieldErrors.accessUrl = 'Enter a valid http:// or https:// destination URL.';
  }

  return {
    isValid: Object.keys(fieldErrors).length === 0,
    fieldErrors,
    sanitized: {
      title,
      description,
      provider,
      studyArea,
      format,
      accessUrl,
    },
  };
};

module.exports = { validateResourceInput, isValidHttpUrl };
