const express = require('express');
const { protect, requireAdmin } = require('../middleware/authMiddleware');

const router = express.Router();

// Student & authenticated catalogue reads (implemented in LRL-16)
router.get('/', protect, (_req, res) => {
  return res.status(200).json([]);
});

// Administrator management & write routes protected by S1 role guard (implemented in LRL-11 & LRL-25)
router.get('/manage', protect, requireAdmin, (_req, res) => {
  return res.status(200).json([]);
});

router.post('/', protect, requireAdmin, (_req, res) => {
  return res.status(501).json({ message: 'Resource creation pending LRL-11 implementation.' });
});

router.put('/:id', protect, requireAdmin, (_req, res) => {
  return res.status(501).json({ message: 'Resource update pending LRL-11 implementation.' });
});

router.patch('/:id/publish', protect, requireAdmin, (_req, res) => {
  return res.status(501).json({ message: 'Resource publication pending LRL-11 implementation.' });
});

router.patch('/:id/archive', protect, requireAdmin, (_req, res) => {
  return res.status(501).json({ message: 'Resource withdrawal pending LRL-25 implementation.' });
});

module.exports = router;
