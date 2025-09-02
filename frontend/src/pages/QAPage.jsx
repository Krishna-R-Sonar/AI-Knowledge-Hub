// frontend/src/pages/QAPage.jsx
import { useState, useEffect } from 'react';
import { 
  MessageCircle, 
  Send, 
  Brain, 
  Clock, 
  User,
  Loader2,
  Sparkles,
  FileText,
  Lightbulb
} from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

const QAPage = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [loading, setLoading] = useState(false);
  const [qaHistory, setQaHistory] = useState([]);
  const [insights, setInsights] = useState('');
  const [loadingInsights, setLoadingInsights] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);

  useEffect(() => {
    fetchRecommendations();
  }, []);

  const fetchRecommendations = async () => {
    try {
      setLoadingRecommendations(true);
      const response = await axios.get('/api/ai/recommendations');
      setRecommendations(response.data.recommendations || []);
    } catch (error) {
      console.error('Error fetching recommendations:', error);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/ai/qa', { question: question.trim() });
      
      const newQA = {
        id: Date.now(),
        question: response.data.question,
        answer: response.data.answer,
        documentsUsed: response.data.documentsUsed,
        timestamp: new Date(response.data.timestamp)
      };
      
      setQaHistory(prev => [newQA, ...prev]);
      setAnswer(response.data.answer);
      setQuestion('');
      
      toast.success('Question answered successfully!');
    } catch (error) {
      console.error('Q&A error:', error);
      toast.error(error.response?.data?.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  const handleGetInsights = async () => {
    try {
      setLoadingInsights(true);
      const response = await axios.get('/api/ai/insights');
      setInsights(response.data.insights);
      toast.success('AI insights generated!');
    } catch (error) {
      console.error('Insights error:', error);
      toast.error('Failed to generate insights');
    } finally {
      setLoadingInsights(false);
    }
  };

  const clearHistory = () => {
    setQaHistory([]);
    setAnswer('');
    setInsights('');
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-primary-100 mb-4">
          <MessageCircle className="h-8 w-8 text-primary-600" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900">Team Q&A with Gemini AI</h1>
        <p className="text-gray-600 mt-2">
          Ask questions about your knowledge base and get intelligent answers powered by AI
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Q&A Section */}
        <div className="lg:col-span-2 space-y-6">
          {/* Question Input */}
          <div className="bg-white rounded-lg shadow p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="question" className="block text-sm font-medium text-gray-700 mb-2">
                  Ask a question about your documents
                </label>
                <textarea
                  id="question"
                  rows={3}
                  value={question}
                  onChange={(e) => setQuestion(e.target.value)}
                  placeholder="e.g., What are the main topics covered in our knowledge base? What are the key insights from our recent documents?"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
                  disabled={loading}
                />
              </div>
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-500">
                  Gemini AI will analyze all your documents to provide comprehensive answers
                </p>
                <button
                  type="submit"
                  disabled={loading || !question.trim()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <Send className="h-4 w-4 mr-2" />
                  )}
                  Ask Question
                </button>
              </div>
            </form>
          </div>

          {/* Current Answer */}
          {answer && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-4">
                <Brain className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-medium text-blue-900">AI Answer</h3>
              </div>
              <div className="prose max-w-none">
                <div className="whitespace-pre-wrap text-blue-800 leading-relaxed">
                  {answer}
                </div>
              </div>
            </div>
          )}

          {/* AI Insights */}
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-900">AI Insights</h3>
                <button
                  onClick={handleGetInsights}
                  disabled={loadingInsights}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                >
                  {loadingInsights ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-1" />
                  ) : (
                    <Lightbulb className="h-4 w-4 mr-1" />
                  )}
                  Generate Insights
                </button>
              </div>
            </div>
            {insights && (
              <div className="p-6">
                <div className="prose max-w-none">
                  <div className="whitespace-pre-wrap text-gray-700 leading-relaxed">
                    {insights}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Q&A History */}
          {qaHistory.length > 0 && (
            <div className="bg-white rounded-lg shadow">
              <div className="px-6 py-4 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900">Recent Questions</h3>
                  <button
                    onClick={clearHistory}
                    className="text-sm text-gray-500 hover:text-gray-700"
                  >
                    Clear History
                  </button>
                </div>
              </div>
              <div className="p-6 space-y-4">
                {qaHistory.map((qa) => (
                  <div key={qa.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <MessageCircle className="h-4 w-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-900">Question</span>
                          <span className="text-xs text-gray-500">
                            {formatDistanceToNow(qa.timestamp, { addSuffix: true })}
                          </span>
                        </div>
                        <p className="text-gray-700 bg-gray-50 p-3 rounded border">
                          {qa.question}
                        </p>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Brain className="h-4 w-4 text-blue-500" />
                          <span className="text-sm font-medium text-blue-900">Answer</span>
                          <span className="text-xs text-gray-500">
                            Used {qa.documentsUsed} documents
                          </span>
                        </div>
                        <div className="text-gray-700 bg-slate-500 p-3 rounded border max-h-32 overflow-y-auto">
                          {qa.answer}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Recommendations */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="h-5 w-5 text-primary-600" />
              <h3 className="text-lg font-medium text-gray-900">Recommended Documents</h3>
            </div>
            
            {loadingRecommendations ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((doc) => (
                  <div key={doc._id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                    <h4 className="font-medium text-gray-900 text-sm mb-1 line-clamp-2">
                      {doc.title}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <User className="h-3 w-3" />
                      <span>{doc.createdBy?.name}</span>
                      <Clock className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(doc.updatedAt), { addSuffix: true })}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-sm text-center py-4">
                No recommendations available
              </p>
            )}
          </div>

          {/* Tips */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-6">
            <h3 className="text-lg font-medium text-green-900 mb-4">Q&A Tips</h3>
            <div className="space-y-3 text-sm text-green-800">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Ask specific questions for better answers</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Use natural language - AI understands context</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Ask about trends, patterns, or specific topics</p>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                <p>Request summaries or comparisons between documents</p>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button
                onClick={() => setQuestion('What are the main topics covered in our knowledge base?')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
              >
                <div className="font-medium">Explore Topics</div>
                <div className="text-gray-500 text-xs">Discover main themes</div>
              </button>
              <button
                onClick={() => setQuestion('What are the key insights from our recent documents?')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
              >
                <div className="font-medium">Recent Insights</div>
                <div className="text-gray-500 text-xs">Latest findings</div>
              </button>
              <button
                onClick={() => setQuestion('Can you summarize the main points from our documentation?')}
                className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm text-gray-700"
              >
                <div className="font-medium">Document Summary</div>
                <div className="text-gray-500 text-xs">Overview of content</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QAPage;
