const mongoose = require('mongoose');
const Bookmark = require('../models/Bookmark');
const Resource = require('../models/Resource');

const getMyBookmarks = async (req, res) => {
  try {
    const bookmarks = await Bookmark.find({ userId: req.user._id })
      .populate('resourceId')
      .sort({ createdAt: -1 });

    // DC2: Filter every Student read by Published status so archived items withdraw cleanly
    const visibleBookmarks = bookmarks
      .filter((b) => b.resourceId && b.resourceId.status === 'Published')
      .map((b) => ({
        _id: b._id,
        resourceId: b.resourceId._id,
        createdAt: b.createdAt,
        resource: b.resourceId,
      }));

    return res.status(200).json(visibleBookmarks);
  } catch (error) {
    return res.status(500).json({ message: 'Unable to load your saved reading list.' });
  }
};

const saveBookmark = async (req, res) => {
  const { resourceId } = req.body || {};
  if (!resourceId || !mongoose.Types.ObjectId.isValid(resourceId)) {
    return res.status(400).json({
      message: 'A valid resource ID is required to save a bookmark.',
      fieldErrors: { resourceId: 'Valid resource ID is required.' },
    });
  }

  try {
    const resource = await Resource.findOne({ _id: resourceId, status: 'Published' });
    if (!resource) {
      return res.status(404).json({
        message: 'Only published catalogue resources can be saved to My Library.',
      });
    }

    let bookmark;
    try {
      bookmark = await Bookmark.findOneAndUpdate(
        { userId: req.user._id, resourceId: resource._id },
        { $setOnInsert: { userId: req.user._id, resourceId: resource._id } },
        { upsert: true, new: true }
      );
    } catch (err) {
      // Handle concurrent duplicate-key race cleanly (DC3)
      if (err && err.code === 11000) {
        bookmark = await Bookmark.findOne({ userId: req.user._id, resourceId: resource._id });
      } else {
        throw err;
      }
    }

    return res.status(200).json({
      _id: bookmark._id,
      resourceId: resource._id,
      createdAt: bookmark.createdAt,
      resource,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to save resource to My Library.' });
  }
};

const removeBookmark = async (req, res) => {
  const { resourceId } = req.params;
  if (!mongoose.Types.ObjectId.isValid(resourceId)) {
    return res.status(404).json({ message: 'Saved bookmark not found.' });
  }

  try {
    const deleted = await Bookmark.findOneAndDelete({
      userId: req.user._id,
      resourceId,
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Saved bookmark not found in your reading list.' });
    }

    return res.status(200).json({
      message: 'Removed from My Library.',
      resourceId,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Unable to remove bookmark.' });
  }
};

module.exports = { getMyBookmarks, saveBookmark, removeBookmark };
