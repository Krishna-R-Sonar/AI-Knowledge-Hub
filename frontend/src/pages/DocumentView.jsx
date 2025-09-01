import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Clock, 
  User, 
  Tag, 
  History,
  Eye,
  EyeOff
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const DocumentView = () => {
  const [document, setDocument] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showVersions, setShowVersions] = useState(false);
  const [versions, setVersions] = useState([]);
  const [loadingVersions, setLoadingVersions] = useState(false);
  
  const { user, isAdmin } = useAuth();
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    fetchDocument();
  }, [id]);

  const fetchDocument = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/documents/${id}`);
      setDocument(response.data);
    } catch (error) {
      console.error('Error fetching document:', error);
      toast.error('Failed to fetch document');
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const fetchVersions = async () => {
    if (versions.length > 0) return;
    
    try {
      setLoadingVersions(true);
      const response = await axios.get(`/api/documents/${id}/versions`);
      setVersions(response.data.versions);
    } catch (error) {
      console.error('Error fetching versions:', error);
      toast.error('Failed to fetch version history');
    } finally {
      setLoadingVersions(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return;
    }

    try {
      await axios.delete(`/api/documents/${id}`);
      toast.success('Document deleted successfully');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error deleting document:', error);
      toast.error('Failed to delete document');
    }
  };

  const canEditDocument = () => {
    return isAdmin || document?.createdBy._id === user.id;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (!document) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Document not found</h2>
        <p className="text-gray-600 mt-2">The document you're looking for doesn't exist.</p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          Back to Dashboard
        </Link>
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
            <h1 className="text-3xl font-bold text-gray-900">{document.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <User className="h-4 w-4" />
                <span>{document.createdBy?.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>Updated {formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}</span>
              </div>
            </div>
          </div>
        </div>

        {canEditDocument() && (
          <div className="flex items-center gap-2">
            <Link
              to={`/document/${id}/edit`}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Link>
            <button
              onClick={handleDelete}
              className="inline-flex items-center px-4 py-2 border border-red-300 shadow-sm text-sm font-medium rounded-md text-red-700 bg-white hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Tags */}
      {document.tags && document.tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {document.tags.map((tag, index) => (
            <span
              key={index}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-primary-100 text-primary-800"
            >
              <Tag className="h-4 w-4 mr-1" />
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Summary */}
      {document.summary && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-blue-900 mb-2">AI-Generated Summary</h3>
          <p className="text-blue-800">{document.summary}</p>
        </div>
      )}

      {/* Content */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="prose max-w-none">
          <div className="whitespace-pre-wrap font-mono text-sm text-gray-900 leading-relaxed">
            {document.content}
          </div>
        </div>
      </div>

      {/* Version History */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200">
          <button
            onClick={() => {
              setShowVersions(!showVersions);
              if (!showVersions && versions.length === 0) {
                fetchVersions();
              }
            }}
            className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <History className="h-4 w-4" />
            Version History
            {showVersions ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {showVersions && (
          <div className="p-6">
            {loadingVersions ? (
              <div className="flex items-center justify-center py-4">
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary-600"></div>
              </div>
            ) : versions.length > 0 ? (
              <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Document Versions</h4>
                {versions.map((version, index) => (
                  <div key={index} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-900">
                        Version {versions.length - index}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(version.editedAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-xs text-gray-600 mb-2">
                      Edited by: {version.editedBy?.name || 'Unknown'}
                    </div>
                    <div className="text-sm text-gray-700 bg-gray-50 p-3 rounded border max-h-32 overflow-y-auto">
                      {version.content}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No version history available</p>
            )}
          </div>
        )}
      </div>

      {/* Document Metadata */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Document Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Created</label>
            <div className="text-sm text-gray-900">
              {new Date(document.createdAt).toLocaleDateString()} at {new Date(document.createdAt).toLocaleTimeString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Last Modified</label>
            <div className="text-sm text-gray-900">
              {new Date(document.updatedAt).toLocaleDateString()} at {new Date(document.updatedAt).toLocaleTimeString()}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Author</label>
            <div className="text-sm text-gray-900">{document.createdBy?.name}</div>
          </div>
          {document.lastEditedBy && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Last Edited By</label>
              <div className="text-sm text-gray-900">{document.lastEditedBy?.name}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DocumentView;
