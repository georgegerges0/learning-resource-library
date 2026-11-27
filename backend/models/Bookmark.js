const mongoose = require('mongoose');

const bookmarkSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource',
      required: true,
    },
  },
  { timestamps: true }
);

// DC3: Unique owner–resource compound index prevents duplicate bookmarks across rapid retries
bookmarkSchema.index({ userId: 1, resourceId: 1 }, { unique: true });

module.exports = mongoose.model('Bookmark', bookmarkSchema);
