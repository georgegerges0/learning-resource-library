const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getMyBookmarks,
  saveBookmark,
  removeBookmark,
} = require('../controllers/bookmarkController');

const router = express.Router();

router.get('/', protect, getMyBookmarks);
router.post('/', protect, saveBookmark);
router.delete('/:resourceId', protect, removeBookmark);

module.exports = router;
