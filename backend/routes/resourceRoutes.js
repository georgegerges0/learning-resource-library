const express = require('express');
const { protect, requireAdmin } = require('../middleware/authMiddleware');
const {
  getPublishedCatalogueStub,
  getManagedResources,
  createResource,
  updateResource,
  publishResource,
} = require('../controllers/resourceController');

const router = express.Router();

router.get('/', protect, getPublishedCatalogueStub);
router.get('/manage', protect, requireAdmin, getManagedResources);
router.post('/', protect, requireAdmin, createResource);
router.put('/:id', protect, requireAdmin, updateResource);
router.patch('/:id/publish', protect, requireAdmin, publishResource);
router.patch('/:id/archive', protect, requireAdmin, (_req, res) => {
  return res.status(501).json({ message: 'Resource withdrawal pending LRL-25 implementation.' });
});

module.exports = router;
