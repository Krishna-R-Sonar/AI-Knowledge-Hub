// frontend/src/pages/Dashboard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/api'; // Updated import
import ActivityFeed from '../components/ActivityFeed';
import { FileText, Plus } from 'lucide-react';

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      const response = await axios.get('/api/documents');
      setDocuments(response.data.documents);
    } catch (error) {
      console.error('Error fetching documents:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <Link
          to="/document/new"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          New Document
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="col-span-2">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Documents</h2>
          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-4">
              <p className="text-sm text-gray-500">No documents found. Create your first document!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {documents.map((doc) => (
                <Link
                  key={doc._id}
                  to={`/document/${doc._id}`}
                  className="block hover:bg-gray-50 rounded p-2 -m-2"
                >
                  <div className="flex items-start space-x-2">
                    <FileText className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                    <div className="min-w-0 flex-1">
                      <p className="text-gray-700 font-medium truncate">{doc.title}</p>
                      <p className="text-gray-500 text-sm truncate">{doc.summary}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h2>
          <ActivityFeed />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;