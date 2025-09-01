import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import DocumentForm from './pages/DocumentForm';
import DocumentView from './pages/DocumentView';
import Search from './pages/Search';
import QAPage from './pages/QAPage';
import LoadingSpinner from './components/LoadingSpinner';

function App() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={!isAuthenticated ? <Login /> : <Navigate to="/dashboard" />} 
      />
      <Route 
        path="/register" 
        element={!isAuthenticated ? <Register /> : <Navigate to="/dashboard" />} 
      />
      
      {/* Protected routes */}
      <Route 
        path="/" 
        element={isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} 
      />
      <Route 
        path="/dashboard" 
        element={isAuthenticated ? <Layout><Dashboard /></Layout> : <Navigate to="/login" />} 
      />
      <Route 
        path="/document/new" 
        element={isAuthenticated ? <Layout><DocumentForm /></Layout> : <Navigate to="/login" />} 
      />
      <Route 
        path="/document/:id" 
        element={isAuthenticated ? <Layout><DocumentView /></Layout> : <Navigate to="/login" />} 
      />
      <Route 
        path="/document/:id/edit" 
        element={isAuthenticated ? <Layout><DocumentForm /></Layout> : <Navigate to="/login" />} 
      />
      <Route 
        path="/search" 
        element={isAuthenticated ? <Layout><Search /></Layout> : <Navigate to="/login" />} 
      />
      <Route 
        path="/qa" 
        element={isAuthenticated ? <Layout><QAPage /></Layout> : <Navigate to="/login" />} 
      />
      
      {/* Catch all */}
      <Route path="*" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default App;
