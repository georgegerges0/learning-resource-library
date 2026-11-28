const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Authentication required. Please sign in to continue.',
    });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({
      message: 'Authentication required. Please sign in to continue.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({
        message: 'Session invalid or account not found. Please sign in again.',
      });
    }
    req.user = user;
    return next();
  } catch (error) {
    return res.status(401).json({
      message: 'Session expired or invalid token. Please sign in again.',
    });
  }
};

const requireAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({
      message: 'Authentication required. Please sign in to continue.',
    });
  }
  if (req.user.role !== 'educator' && req.user.role !== 'admin') {
    return res.status(403).json({
      message: 'Access denied. Educator role is required to modify catalogue records.',
    });
  }
  return next();
};

module.exports = { protect, requireAdmin };
