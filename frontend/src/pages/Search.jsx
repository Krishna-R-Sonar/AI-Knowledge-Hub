// frontend/src/pages/Search.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from '../utils/api'; // Updated import
import { Search as SearchIcon, FileText, User, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { Loader2 } from 'lucide-react';

const Search = () => {
  const [searchType, setSearchType] = useState('text');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [results, setResults] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const response = await axios.get('/api/search/tags/all');
      setAvailableTags(response.data.tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

  const handleTagToggle = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const response = await axios.get(`/api/search/${searchType}`, {
        params: { q: searchQuery, page: currentPage },
      });
      setResults(response.data.documents);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTagSearch = async () => {
    if (selectedTags.length === 0) return;
    setLoading(true);
    try {
      const response = await axios.get('/api/search/tags', {
        params: { tags: selectedTags.join(','), page: currentPage },
      });
      setResults(response.data.documents);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Tag search error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSearchTypeLabel = (type) => {
    const labels = {
      text: 'Text Search',
      semantic: 'AI Semantic Search',
      tags: 'Tag-based Search',
      combined: 'Combined Search',
    };
    return labels[type] || type;
  };

  const getSearchTypeIcon = (type) => {
    const icons = {
      text: <SearchIcon className="h-4 w-4" />,
      semantic: <FileText className="h-4 w-4" />,
      tags: <Tag className="h-4 w-4" />,
      combined: <SearchIcon className="h-4 w-4" />,
    };
    return icons[type] || <SearchIcon className="h-4 w-4" />;
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Search Documents</h1>

      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Search Options</h2>
          <div className="flex space-x-2">
            {['text', 'semantic', 'tags'].map((type) => (
              <button
                key={type}
                onClick={() => setSearchType(type)}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-md border text-sm font-medium transition-colors ${
                  searchType === type
                    ? 'bg-primary-100 text-primary-800 border-primary-300'
                    : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                }`}
              >
                {getSearchTypeIcon(type)}
                {getSearchTypeLabel(type)}
              </button>
            ))}
          </div>
        </div>

        {searchType !== 'tags' && (
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Enter your search query..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
              </div>
              <button
                type="submit"
                disabled={loading || !searchQuery.trim()}
                className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Search'
                )}
              </button>
            </div>
          </form>
        )}

        {searchType === 'tags' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Tags</label>
              <div className="flex flex-wrap gap-2">
                {availableTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      selectedTags.includes(tag)
                        ? 'bg-primary-100 text-primary-800 border-primary-300'
                        : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
            <button
              onClick={handleTagSearch}
              disabled={loading || selectedTags.length === 0}
              className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Search by Tags'
              )}
            </button>
          </div>
        )}
      </div>

      {results.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-medium text-gray-900">
              Search Results ({results.length} documents)
            </h2>
            <div className="text-sm text-gray-500">
              {getSearchTypeLabel(searchType)}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {results.map((document) => (
              <div key={document._id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-3 line-clamp-2">
                    <Link
                      to={`/document/${document._id}`}
                      className="hover:text-primary-600"
                    >
                      {document.title}
                    </Link>
                  </h3>

                  {document.summary && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {document.summary}
                    </p>
                  )}

                  {document.tags && document.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-4">
                      {document.tags.slice(0, 3).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                        >
                          {tag}
                        </span>
                      ))}
                      {document.tags.length > 3 && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          +{document.tags.length - 3}
                        </span>
                      )}
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-gray-500">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      <span>{document.createdBy?.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      <span>{formatDistanceToNow(new Date(document.updatedAt), { addSuffix: true })}</span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <Link
                      to={`/document/${document._id}`}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-primary-700 bg-primary-100 hover:bg-primary-200"
                    >
                      <FileText className="h-3 w-3 mr-1" />
                      View Document
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${
                    currentPage === page
                      ? 'bg-primary-600 text-white'
                      : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}

      {!loading && searchQuery && results.length === 0 && (
        <div className="text-center py-12">
          <SearchIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search query or using a different search type.
          </p>
        </div>
      )}

      {!searchQuery && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-medium text-blue-900 mb-4">Search Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Text Search</h4>
              <p className="text-blue-700 text-sm">Search for exact text matches in document titles and content.</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">AI Semantic Search</h4>
              <p className="text-blue-700 text-sm">Use Gemini AI to find documents based on meaning and context.</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Tag-based Search</h4>
              <p className="text-blue-700 text-sm">Filter documents by AI-generated tags for quick discovery.</p>
            </div>
            <div>
              <h4 className="font-medium text-blue-800 mb-2">Combined Search</h4>
              <p className="text-blue-700 text-sm">Get the best of both text and semantic search results.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Search;