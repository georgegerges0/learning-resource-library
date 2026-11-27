const mongoose = require('mongoose');
const Resource = require('../models/Resource');

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

class CatalogueQueryService {
  static async searchPublishedResources({ q = '', studyArea = '', format = '' } = {}) {
    const query = { status: 'Published' };

    if (studyArea && studyArea !== 'All') {
      query.studyArea = studyArea;
    }

    if (format && format !== 'All') {
      query.format = format;
    }

    const trimmedKeyword = String(q || '').trim();
    if (trimmedKeyword) {
      const pattern = new RegExp(escapeRegex(trimmedKeyword), 'i');
      query.$or = [
        { title: pattern },
        { description: pattern },
        { provider: pattern },
      ];
    }

    return Resource.find(query).sort({ publishedAt: -1, updatedAt: -1 });
  }

  static async getPublishedResourceById(id) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return null;
    }
    return Resource.findOne({ _id: id, status: 'Published' });
  }
}

module.exports = CatalogueQueryService;
module.exports.escapeRegex = escapeRegex;
