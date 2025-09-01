import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Clock, Edit3, User } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const ActivityFeed = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    try {
      const response = await axios.get('/api/documents/activity/feed');
      setActivities(response.data);
    } catch (error) {
      console.error('Error fetching activities:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-4">
        <p className="text-sm text-gray-500">No recent activity</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {activities.map((doc) => (
        <div key={doc._id} className="text-xs">
          <Link
            to={`/document/${doc._id}`}
            className="block hover:bg-gray-50 rounded p-2 -m-2"
          >
            <div className="flex items-start space-x-2">
              <Edit3 className="h-3 w-3 text-gray-400 mt-0.5 flex-shrink-0" />
              <div className="min-w-0 flex-1">
                <p className="text-gray-700 font-medium truncate">
                  {doc.title}
                </p>
                <div className="flex items-center space-x-2 text-gray-500 mt-1">
                  <User className="h-3 w-3" />
                  <span className="truncate">
                    {doc.lastEditedBy?.name || doc.createdBy?.name}
                  </span>
                  <Clock className="h-3 w-3" />
                  <span>
                    {formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
};

export default ActivityFeed;
