# AI-Powered Collaborative Knowledge Hub

A comprehensive MERN stack application that provides AI-powered document management, collaboration, and intelligent search capabilities using Google's Gemini AI.

## 🚀 Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Document Management**: Full CRUD operations for knowledge documents
- **AI-Powered Features**: Automatic document summarization and intelligent tag generation
- **Advanced Search**: Multiple search types including semantic search powered by Gemini AI
- **Team Q&A**: Ask questions about your knowledge base and get AI-powered answers
- **Version Control**: Track document changes with full version history
- **Collaboration**: Team activity feed and document sharing

### AI Integration (Gemini)
- **Automatic Summarization**: Generate concise summaries for all documents
- **Smart Tagging**: AI-generated relevant tags for better organization
- **Semantic Search**: Find documents based on meaning, not just keywords
- **Intelligent Q&A**: Ask questions and get comprehensive answers from your knowledge base
- **Document Insights**: AI-generated insights about your knowledge base

### User Roles
- **Users**: Create, edit, and manage their own documents
- **Admins**: Full access to all documents and system management

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google Gemini AI** for intelligent features
- **bcryptjs** for password hashing

### Frontend
- **React 18** with modern hooks
- **React Router** for navigation
- **Tailwind CSS 3** for responsive design
- **Vite** for fast development
- **Axios** for API communication
- **Lucide React** for icons

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- Google Gemini API key

## 🚀 Installation

### 1. Clone the repository
```bash
git clone <repository-url>
cd ai-knowledge-hub
```

### 2. Install dependencies
```bash
npm run install
```

### 3. Environment Setup

#### Backend
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai-knowledge-hub
JWT_SECRET=your-super-secret-jwt-key-here
GEMINI_API_KEY=your-gemini-api-key-here
NODE_ENV=development
```

#### Frontend
The frontend will automatically proxy API calls to the backend.

### 4. Get Gemini API Key
1. Visit [Google AI Studio]
2. Create a new API key
3. Add it to your backend `.env` file

### 5. Start the application
```bash
# start separately:
node server.js    # Backend only
npm run dev    # Frontend only
```

## 🌐 Usage

### 1. User Registration & Login
- Create an account with email and password
- Login to access the dashboard
- Admins can be created directly in the database

### 2. Document Management
- **Create**: Write documents with automatic AI summarization and tagging
- **Edit**: Modify documents with version tracking
- **View**: Read documents with full metadata and version history
- **Delete**: Remove documents (users can only delete their own)

### 3. AI Features
- **Automatic Summaries**: Every document gets an AI-generated summary
- **Smart Tags**: AI generates relevant tags for better organization
- **Regenerate**: Manually regenerate summaries and tags using AI buttons

### 4. Search Capabilities
- **Text Search**: Traditional keyword-based search
- **Semantic Search**: AI-powered meaning-based search
- **Tag Search**: Filter by AI-generated tags
- **Combined Search**: Best of both worlds

### 5. Team Q&A
- Ask questions about your knowledge base
- Get comprehensive answers using all stored documents
- View Q&A history and AI-generated insights

## 📱 Responsive Design

The application is built with a mobile-first approach using Tailwind CSS:
- **Mobile**: Optimized for small screens with collapsible sidebar
- **Tablet**: Responsive grid layouts and touch-friendly interfaces
- **Desktop**: Full sidebar navigation and advanced features

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile

### Documents
- `GET /api/documents` - List documents with pagination
- `POST /api/documents` - Create new document
- `GET /api/documents/:id` - Get single document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document
- `GET /api/documents/:id/versions` - Get version history

### Search
- `GET /api/search/text` - Text-based search
- `GET /api/search/semantic` - AI semantic search
- `GET /api/search/tags` - Tag-based search
- `GET /api/search/combined` - Combined search

### AI Features
- `POST /api/ai/qa` - Team Q&A
- `GET /api/ai/insights` - Generate insights
- `GET /api/ai/recommendations` - Get recommendations

## 🎨 Customization

### Styling
- Modify `frontend/src/index.css` for custom CSS
- Update `frontend/tailwind.config.js` for theme changes
- Customize color schemes in the Tailwind configuration

### AI Prompts
- Edit `backend/services/geminiService.js` to modify AI behavior
- Adjust prompts for summaries, tags, and Q&A responses

## 🚀 Deployment

### Backend Deployment
1. Set `NODE_ENV=production` in your environment
2. Ensure MongoDB connection string is correct
3. Deploy to your preferred hosting service (Heroku, DigitalOcean, AWS, etc.)

### Frontend Deployment
1. Build the application: `npm run build`
2. Deploy the `frontend/dist` folder to your hosting service
3. Update API endpoints if needed

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Environment variable protection

## 📊 Performance Features

- MongoDB indexing for fast searches
- Pagination for large datasets
- Efficient API responses
- Optimized React components
- Lazy loading where appropriate

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 🆘 Support

For support and questions:
- Check the documentation
- Review the code comments
- Open an issue on GitHub

## 🔮 Future Enhancements

- Real-time collaboration features
- Advanced analytics and reporting
- Integration with external knowledge sources
- Enhanced AI capabilities
- Mobile app development
- Advanced search algorithms

---

**Built with ❤️ using MERN stack and Gemini AI**
