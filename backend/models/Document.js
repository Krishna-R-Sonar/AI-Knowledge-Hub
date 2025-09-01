// backend/models/Document.js
const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  summary: {
    type: String,
    trim: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  versions: [{
    content: String,
    editedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    editedAt: {
      type: Date,
      default: Date.now
    }
  }],
  lastEditedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
}, {
  timestamps: true
});

// Index for search
documentSchema.index({ title: 'text', content: 'text', tags: 'text' });

// Method to add version
documentSchema.methods.addVersion = function(content, userId) {
  this.versions.push({
    content: this.content,
    editedBy: this.lastEditedBy || this.createdBy,
    editedAt: new Date()
  });
  this.content = content;
  this.lastEditedBy = userId;
  this.updatedAt = new Date();
};

module.exports = mongoose.model('Document', documentSchema);
