// frontend/src/pages/QAPage.jsx
import { useState } from 'react';
import axios from '../utils/api'; // Updated import
import toast from 'react-hot-toast';
import { Send, Loader2 } from 'lucide-react';

const QAPage = () => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!question.trim()) {
      toast.error('Please enter a question');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/ai/qa', { question });
      setAnswer(response.data);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to get answer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Team Q&A</h1>

      <form onSubmit={handleSubmit} className="mb-8">
        <div className="flex gap-4">
          <div className="flex-1">
            <textarea
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              placeholder="Ask a question about your documents..."
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              rows="4"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="px-6 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </form>

      {answer && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-2">Answer</h2>
          <p className="text-gray-600">{answer.answer}</p>
          <div className="mt-4 text-sm text-gray-500">
            <p>Based on {answer.documentsUsed} documents</p>
            <p>{new Date(answer.timestamp).toLocaleString()}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default QAPage;