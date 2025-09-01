const express = require('express');
const Document = require('../models/Document');
const { auth } = require('../middleware/auth');
const geminiService = require('../services/geminiService');

const router = express.Router();

// Team Q&A - Ask Gemini questions about stored documents
router.post('/qa', auth, async (req, res) => {
  try {
    const { question } = req.body;
    
    if (!question || question.trim().length === 0) {
      return res.status(400).json({ message: 'Question is required' });
    }
    
    // Get all documents for context
    const documents = await Document.find()
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email');
    
    if (documents.length === 0) {
      return res.status(404).json({ 
        message: 'No documents found. Please create some documents first.' 
      });
    }
    
    // Use Gemini AI to answer the question
    const answer = await geminiService.answerQuestion(question, documents);
    
    res.json({
      question: question.trim(),
      answer,
      documentsUsed: documents.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Q&A error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get AI insights about documents
router.get('/insights', auth, async (req, res) => {
  try {
    const documents = await Document.find()
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email');
    
    if (documents.length === 0) {
      return res.status(404).json({ message: 'No documents found' });
    }
    
    // Generate insights using Gemini AI
    const insights = await geminiService.generateInsights(documents);
    
    res.json({
      insights,
      totalDocuments: documents.length,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Insights error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get document recommendations based on user's recent activity
router.get('/recommendations', auth, async (req, res) => {
  try {
    const { userId } = req.user;
    
    // Get user's recent documents
    const userDocs = await Document.find({ createdBy: userId })
      .sort({ updatedAt: -1 })
      .limit(5);
    
    if (userDocs.length === 0) {
      // If no user docs, return recent documents
      const recentDocs = await Document.find()
        .populate('createdBy', 'name email')
        .sort({ updatedAt: -1 })
        .limit(5);
      
      return res.json({
        recommendations: recentDocs,
        type: 'recent'
      });
    }
    
    // Get all documents for context
    const allDocs = await Document.find()
      .populate('createdBy', 'name email')
      .populate('lastEditedBy', 'name email');
    
    // Use Gemini AI to find related documents
    const userContent = userDocs.map(doc => doc.content).join(' ');
    const recommendations = await geminiService.findRelatedDocuments(userContent, allDocs);
    
    res.json({
      recommendations: recommendations.slice(0, 5),
      type: 'personalized',
      basedOn: userDocs.length
    });
  } catch (error) {
    console.error('Recommendations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
