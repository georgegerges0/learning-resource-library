const express = require('express');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const {
  searchPublishedCatalogue,
  getPublishedResourceDetail,
  getManagedResources,
  createResource,
  updateResource,
  publishResource,
  archiveResource,
} = require('../controllers/resourceController');

const router = express.Router();

router.get('/', protect, searchPublishedCatalogue);
router.get('/manage', protect, requireAdmin, getManagedResources);
router.get('/:id', protect, getPublishedResourceDetail);
router.post('/', protect, requireAdmin, createResource);
router.put('/:id', protect, requireAdmin, updateResource);
router.patch('/:id/publish', protect, requireAdmin, publishResource);
router.patch('/:id/archive', protect, requireAdmin, archiveResource);

module.exports = router;
