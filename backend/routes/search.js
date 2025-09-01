const express = require('express');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Regular text search
router.get('/text', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    const query = { $text: { $search: q } };
    
    const documents = await Document.find(query)
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort({ score: { $meta: 'textScore' } })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Document.countDocuments(query);
    
    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      query: q
    });
  } catch (error) {
    console.error('Text search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Semantic search using Gemini AI
router.get('/semantic', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Get all documents for semantic search
    const allDocuments = await Document.find()
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email');
    
    // Use Gemini AI for semantic search
    const relevantDocs = await geminiService.semanticSearch(q, allDocuments);
    
    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocs = relevantDocs.slice(startIndex, endIndex);
    
    res.json({
      documents: paginatedDocs,
      totalPages: Math.ceil(relevantDocs.length / limit),
      currentPage: page,
      total: relevantDocs.length,
      query: q,
      searchType: 'semantic'
    });
  } catch (error) {
    console.error('Semantic search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Tag-based search
router.get('/tags', auth, async (req, res) => {
  try {
    const { tags, page = 1, limit = 10 } = req.query;
    
    if (!tags) {
      return res.status(400).json({ message: 'Tags are required' });
    }
    
    const tagArray = tags.split(',').map(tag => tag.trim());
    
    const query = { tags: { $in: tagArray } };
    
    const documents = await Document.find(query)
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email')
      .sort({ updatedAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();
    
    const total = await Document.countDocuments(query);
    
    res.json({
      documents,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total,
      tags: tagArray
    });
  } catch (error) {
    console.error('Tag search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all available tags
router.get('/tags/all', auth, async (req, res) => {
  try {
    const tags = await Document.distinct('tags');
    res.json({ tags: tags.filter(tag => tag && tag.trim().length > 0) });
  } catch (error) {
    console.error('Get tags error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Combined search (text + semantic)
router.get('/combined', auth, async (req, res) => {
  try {
    const { q, page = 1, limit = 10 } = req.query;
    
    if (!q) {
      return res.status(400).json({ message: 'Search query is required' });
    }
    
    // Perform both searches
    const [textResults, semanticResults] = await Promise.all([
      Document.find({ $text: { $search: q } })
        .populate('createdBy', 'name email')
        .populate('lastEditedBy', 'name email')
        .sort({ score: { $meta: 'textScore' } })
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec(),
      geminiService.semanticSearch(q, await Document.find()
        .populate('createdBy', 'name email')
        .populate('lastEditedBy', 'name email'))
    ]);
    
    // Combine and deduplicate results
    const combinedDocs = [...textResults];
    const textDocIds = new Set(textResults.map(doc => doc._id.toString()));
    
    semanticResults.forEach(doc => {
      if (!textDocIds.has(doc._id.toString())) {
        combinedDocs.push(doc);
      }
    });
    
    // Apply pagination to combined results
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDocs = combinedDocs.slice(startIndex, endIndex);
    
    res.json({
      documents: paginatedDocs,
      totalPages: Math.ceil(combinedDocs.length / limit),
      currentPage: page,
      total: combinedDocs.length,
      query: q,
      searchType: 'combined'
    });
  } catch (error) {
    console.error('Combined search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
