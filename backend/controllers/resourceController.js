const mongoose = require('mongoose');
const Resource = require('../models/Resource');
const CatalogueQueryService = require('../services/catalogueQueryService');
const { validateResourceInput } = require('../utils/resourceValidator');

const searchPublishedCatalogue = async (req, res) => {
  try {
    const { q, studyArea, format } = req.query;
    const resources = await CatalogueQueryService.searchPublishedResources({
      q,
      studyArea,
      format,
    });
    return res.status(200).json(resources);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to search published catalogue.' });
  }
};

const getPublishedResourceDetail = async (req, res) => {
  try {
    const resource = await CatalogueQueryService.getPublishedResourceById(req.params.id);
    if (!resource) {
      return res.status(404).json({
        message: 'This resource is not available in the student catalogue.',
      });
    }
    return res.status(200).json(resource);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load resource details.' });
  }
};

const getManagedResources = async (_req, res) => {
  try {
    const resources = await Resource.find({}).sort({ updatedAt: -1 });
    return res.status(200).json(resources);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load managed resources.' });
  }
};

const createResource = async (req, res) => {
  const { isValid, fieldErrors, sanitized } = validateResourceInput(req.body);
  if (!isValid) {
    return res.status(400).json({
      message: 'Please correct the highlighted resource fields.',
      fieldErrors,
    });
  }

  const publishImmediately = req.body?.status === 'Published' || req.body?.publish === true;

  try {
    const resource = await Resource.create({
      ...sanitized,
      status: publishImmediately ? 'Published' : 'Draft',
      publishedAt: publishImmediately ? new Date() : null,
      createdBy: req.user._id,
    });
    return res.status(201).json(resource);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save resource record.' });
  }
};

const updateResource = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  const { isValid, fieldErrors, sanitized } = validateResourceInput(req.body);
  if (!isValid) {
    return res.status(400).json({
      message: 'Please correct the highlighted resource fields.',
      fieldErrors,
    });
  }

  try {
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    Object.assign(resource, sanitized);

    if (req.body?.status === 'Draft') {
      resource.status = 'Draft';
    } else if (req.body?.status === 'Published') {
      resource.status = 'Published';
      resource.publishedAt = resource.publishedAt || new Date();
      resource.archivedAt = null;
    }

    const saved = await resource.save();
    return res.status(200).json(saved);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update resource record.' });
  }
};

const publishResource = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  try {
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    const mergedPayload = {
      title: req.body?.title !== undefined ? req.body.title : resource.title,
      description: req.body?.description !== undefined ? req.body.description : resource.description,
      provider: req.body?.provider !== undefined ? req.body.provider : resource.provider,
      studyArea: req.body?.studyArea !== undefined ? req.body.studyArea : resource.studyArea,
      format: req.body?.format !== undefined ? req.body.format : resource.format,
      accessUrl: req.body?.accessUrl !== undefined ? req.body.accessUrl : resource.accessUrl,
    };

    const { isValid, fieldErrors, sanitized } = validateResourceInput(mergedPayload);
    if (!isValid) {
      return res.status(400).json({
        message: 'Resource cannot be published until all fields are valid.',
        fieldErrors,
      });
    }

    Object.assign(resource, sanitized);
    resource.status = 'Published';
    resource.publishedAt = new Date();
    resource.archivedAt = null;

    const published = await resource.save();
    return res.status(200).json(published);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to publish resource.' });
  }
};

// DC2: Retain archived Resource and Bookmark records while withdrawing Student access
const archiveResource = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(404).json({ message: 'Resource not found.' });
  }

  try {
    const resource = await Resource.findById(id);
    if (!resource) {
      return res.status(404).json({ message: 'Resource not found.' });
    }

    resource.status = 'Archived';
    resource.archivedAt = new Date();
    const archived = await resource.save();

    return res.status(200).json(archived);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to archive resource.' });
  }
};

module.exports = {
  searchPublishedCatalogue,
  getPublishedResourceDetail,
  getManagedResources,
  createResource,
  updateResource,
  publishResource,
  archiveResource,
};
