// backend/services/geminiService.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class GeminiService {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
  }

  async generateSummary(content) {
    try {
      const prompt = `Please provide a concise summary (2-3 sentences) of the following document content:\n\n${content}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating summary:', error);
      return 'Summary generation failed';
    }
  }

  async generateTags(content) {
    try {
      const prompt = `Based on the following document content, generate 3-5 relevant tags (single words or short phrases). Return only the tags separated by commas:\n\n${content}`;
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const tags = response.text().trim().split(',').map(tag => tag.trim());
      return tags.filter(tag => tag.length > 0);
    } catch (error) {
      console.error('Error generating tags:', error);
      return [];
    }
  }

  async semanticSearch(query, documents) {
    try {
      const context = documents.map(doc => 
        `Title: ${doc.title}\nContent: ${doc.content}\n---`
      ).join('\n');
      
      const prompt = `Based on the following documents, find the most relevant ones for this query: "${query}"\n\nDocuments:\n${context}\n\nReturn only the titles of the most relevant documents, separated by commas.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const relevantTitles = response.text().trim().split(',').map(title => title.trim());
      
      return documents.filter(doc => 
        relevantTitles.some(title => 
          doc.title.toLowerCase().includes(title.toLowerCase())
        )
      );
    } catch (error) {
      console.error('Error in semantic search:', error);
      return documents;
    }
  }

  async answerQuestion(question, documents) {
    try {
      const context = documents.map(doc => 
        `Title: ${doc.title}\nContent: ${doc.content}\n---`
      ).join('\n');
      
      const prompt = `Based on the following documents, answer this question: "${question}"\n\nDocuments:\n${context}\n\nProvide a comprehensive answer using information from the documents. If the documents don't contain enough information to answer the question, say so.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error answering question:', error);
      return 'Sorry, I encountered an error while processing your question.';
    }
  }

  async generateInsights(documents) {
    try {
      const context = documents.map(doc => 
        `Title: ${doc.title}\nContent: ${doc.content}\n---`
      ).join('\n');
      
      const prompt = `Based on the following documents, provide 3-5 key insights about the knowledge base. Focus on patterns, themes, and important information:\n\nDocuments:\n${context}\n\nProvide insights in bullet points.`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error generating insights:', error);
      return 'Unable to generate insights at this time.';
    }
  }

  async findRelatedDocuments(userContent, allDocuments) {
    try {
      const prompt = `Based on this user content: "${userContent}"\n\nFind the most related documents from this list. Return only the titles of the most relevant documents, separated by commas:\n\n${allDocuments.map(doc => doc.title).join('\n')}`;
      
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const relevantTitles = response.text().trim().split(',').map(title => title.trim());
      
      return allDocuments.filter(doc => 
        relevantTitles.some(title => 
          doc.title.toLowerCase().includes(title.toLowerCase())
        )
      );
    } catch (error) {
      console.error('Error finding related documents:', error);
      return allDocuments.slice(0, 5); // Return first 5 as fallback
    }
  }
}

module.exports = new GeminiService();
