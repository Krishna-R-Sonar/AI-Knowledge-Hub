import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  Save, 
  ArrowLeft, 
  Sparkles, 
  Tag, 
  FileText,
  Loader2
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';

const DocumentForm = () => {
  const [formData, setFormData] = useState({
    title: '',
    content: ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [document, setDocument] = useState(null);
  
  const { user } = useAuth();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id && id !== 'new';

  useEffect(() => {
    if (isEditing) {
      fetchDocument();
    }
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/documents/${id}`);
      setDocument(response.data);
      setFormData({
        title: response.data.title,
        content: response.data.content
      });
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to fetch document');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      toast.error('Please fill in all fields');
      return;
    }

    setSaving(true);

    try {
      if (isEditing) {
        await axios.put(`/api/documents/${id}`, formData);
        toast.success('Document updated successfully');
      } else {
        await axios.post('/api/documents', formData);
        toast.success('Document created successfully');
      }
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving document:', error);
      toast.error(error.response?.data?.message || 'Failed to save document');
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateSummary = async () => {
    if (!formData.content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(`/api/documents/${id}/regenerate-summary`);
      setDocument(prev => ({
        ...prev,
        summary: response.data.summary
      }));
      toast.success('Summary regenerated with Gemini AI');
    } catch (error) {
      console.error('Error generating summary:', error);
      toast.error('Failed to regenerate summary');
    } finally {
      setGenerating(false);
    }
  };

  const handleGenerateTags = async () => {
    if (!formData.content.trim()) {
      toast.error('Please add some content first');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post(`/api/documents/${id}/regenerate-tags`);
      setDocument(prev => ({
        ...prev,
        tags: response.data.tags
      }));
      toast.success('Tags regenerated with Gemini AI');
    } catch (error) {
      console.error('Error generating tags:', error);
      toast.error('Failed to regenerate tags');
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate('/dashboard')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              {isEditing ? 'Edit Document' : 'Create New Document'}
            </h1>
            <p className="text-gray-600">
              {isEditing ? 'Update your document content and metadata' : 'Create a new knowledge document with AI assistance'}
            </p>
          </div>
        </div>
      </div>

      {/* AI Actions */}
      {isEditing && document && (
        <div className="bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg p-6 border border-primary-200">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="h-5 w-5 text-primary-600" />
            <h3 className="text-lg font-medium text-primary-900">AI-Powered Enhancements</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={handleGenerateSummary}
              disabled={generating}
              className="flex items-center justify-center px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Sparkles className="h-4 w-4 mr-2" />
              )}
              Regenerate Summary
            </button>
            <button
              onClick={handleGenerateTags}
              disabled={generating}
              className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              {generating ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <Tag className="h-4 w-4 mr-2" />
              )}
              Regenerate Tags
            </button>
          </div>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="space-y-6">
            {/* Title */}
            <div>
              <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                Document Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                required
                value={formData.title}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="Enter document title"
              />
            </div>

            {/* Content */}
            <div>
              <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-2">
                Content
              </label>
              <textarea
                id="content"
                name="content"
                required
                rows={20}
                value={formData.content}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 font-mono text-sm"
                placeholder="Write your document content here..."
              />
            </div>
          </div>
        </div>

        {/* Document Info */}
        {isEditing && document && (
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Document Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                <div className="p-3 bg-gray-50 rounded-md">
                  {document.summary || 'No summary available'}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                <div className="flex flex-wrap gap-2">
                  {document.tags && document.tags.length > 0 ? (
                    document.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                      >
                        {tag}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-500">No tags available</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            {isEditing ? 'Update Document' : 'Create Document'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DocumentForm;
