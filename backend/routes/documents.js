const express = require('express');
const { body, validationResult } = require('express-validator');
const Document = require('../models/Document');
const User = require('../models/User');
const { auth, adminAuth, documentOwnerOrAdmin } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Get all documents (with pagination and filtering)
router.get('/', auth, async (req, res) => {
  try {
    const { page = 1, limit = 10, tag, search, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    
    let query = {};
    
    // Tag filtering
    if (tag) {
      query.tags = { $in: [tag] };
    }
    
    // Text search
    if (search) {
      query.$text = { $search: search };
    }
    
    // Build sort object
    const sort = {};
    sort[sortBy] = sortOrder === 'desc' ? -1 : 1;
    
    const documents = await Document.find(query)
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort(sort)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Document.countDocuments(query);
    
    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    console.error('Get documents error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single document
router.get('/:id', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email');
    
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json(document);
  } catch (error) {
    console.error('Get document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Create document
router.post('/', auth, [
  body('title').trim().isLength({ min: 1 }),
  body('content').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;
    
    // Generate summary and tags using Gemini AI
    const [summary, tags] = await Promise.all([
      geminiService.generateSummary(content),
      geminiService.generateTags(content)
    ]);
    
    const document = new Document({
      title,
      content,
      summary,
      tags,
      createdBy: req.user._id
    });
    
    await document.save();
    
    const populatedDoc = await Document.findById(document._id)
      .populate('createdBy', 'name email');
    
    res.status(201).json(populatedDoc);
  } catch (error) {
    console.error('Create document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update document
router.put('/:id', documentOwnerOrAdmin, [
  body('title').trim().isLength({ min: 1 }),
  body('content').trim().isLength({ min: 1 })
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { title, content } = req.body;
    const document = req.document;
    
    // Add version before updating
    document.addVersion(content, req.user._id);
    document.title = title;
    
    // Regenerate summary and tags
    const [summary, tags] = await Promise.all([
      geminiService.generateSummary(content),
      geminiService.generateTags(content)
    ]);
    
    document.summary = summary;
    document.tags = tags;
    
    await document.save();
    
    const updatedDoc = await Document.findById(document._id)
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email');
    
    res.json(updatedDoc);
  } catch (error) {
    console.error('Update document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Delete document
router.delete('/:id', documentOwnerOrAdmin, async (req, res) => {
  try {
    await Document.findByIdAndDelete(req.params.id);
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Delete document error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document versions
router.get('/:id/versions', auth, async (req, res) => {
  try {
    const document = await Document.findById(req.params.id);
    if (!document) {
      return res.status(404).json({ message: 'Document not found' });
    }
    
    res.json({ versions: document.versions });
  } catch (error) {
    console.error('Get versions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regenerate summary with Gemini
router.post('/:id/regenerate-summary', documentOwnerOrAdmin, async (req, res) => {
  try {
    const document = req.document;
    const newSummary = await geminiService.generateSummary(document.content);
    
    document.summary = newSummary;
    await document.save();
    
    res.json({ summary: newSummary });
  } catch (error) {
    console.error('Regenerate summary error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Regenerate tags with Gemini
router.post('/:id/regenerate-tags', documentOwnerOrAdmin, async (req, res) => {
  try {
    const document = req.document;
    const newTags = await geminiService.generateTags(document.content);
    
    document.tags = newTags;
    await document.save();
    
    res.json({ tags: newTags });
  } catch (error) {
    console.error('Regenerate tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get team activity feed
router.get('/activity/feed', auth, async (req, res) => {
  try {
    const recentDocs = await Document.find()
      .populate('createdBy', 'name')
      .populate('lastEditedBy', 'name')
      .sort({ updatedAt: -1 })
      .limit(5);
    
    res.json(recentDocs);
  } catch (error) {
    console.error('Get activity feed error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
