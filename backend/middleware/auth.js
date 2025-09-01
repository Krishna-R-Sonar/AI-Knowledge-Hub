const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Document = require('../models/Document');

const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const adminAuth = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied. Admin only.' });
    }
    
    next();
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

const documentOwnerOrAdmin = async (req, res, next) => {
  try {
    await auth(req, res, () => {});
    
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    if (req.user.role === 'admin' || document.createdBy.toString() === req.user._id.toString()) {
      req.document = document;
      next();
    } else {
      res.status(403).json({ message: 'Access denied. You can only edit your own documents.' });
    }
  } catch (error) {
    res.status(401).json({ message: 'Authentication failed' });
  }
};

module.exports = { auth, adminAuth, documentOwnerOrAdmin };
