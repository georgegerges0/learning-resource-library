const mongoose = require('mongoose');

const STUDY_AREAS = [
  'Engineering',
  'Health',
  'Research methods',
  'Construction',
  'Information Technology',
];

const RESOURCE_FORMATS = [
  'Video',
  'Article',
  'Database',
  'Standard or code',
  'Learning material',
  'Industry report',
];

const RESOURCE_STATUSES = ['Draft', 'Published', 'Archived'];

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 180 },
    description: { type: String, required: true, trim: true, maxlength: 2000 },
    provider: { type: String, required: true, trim: true, maxlength: 160 },
    studyArea: { type: String, required: true, enum: STUDY_AREAS },
    format: { type: String, required: true, enum: RESOURCE_FORMATS },
    accessUrl: { type: String, required: true, trim: true, maxlength: 1000 },
    status: {
      type: String,
      enum: RESOURCE_STATUSES,
      default: 'Draft',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    publishedAt: { type: Date, default: null },
    archivedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

resourceSchema.index({ status: 1, studyArea: 1, format: 1 });

const Resource = mongoose.model('Resource', resourceSchema);

module.exports = Resource;
module.exports.STUDY_AREAS = STUDY_AREAS;
module.exports.RESOURCE_FORMATS = RESOURCE_FORMATS;
module.exports.RESOURCE_STATUSES = RESOURCE_STATUSES;
