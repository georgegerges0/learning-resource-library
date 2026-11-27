const Resource = require('../models/Resource');

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
      const pattern = new RegExp(trimmedKeyword, 'i');
      query.$or = [
        { title: pattern },
        { description: pattern },
        { provider: pattern },
      ];
    }

    return Resource.find(query).sort({ publishedAt: -1, updatedAt: -1 });
  }

  static async getResourceById(id) {
    return Resource.findById(id);
  }
}

module.exports = CatalogueQueryService;
