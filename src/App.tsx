import { useEffect, useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { PricingPage } from './pages/PricingPage';

function App() {
  const { user, loading } = useAuth();
  const [currentPage, setCurrentPage] = useState<'app' | 'pricing'>('app');

  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#pricing') {
        setCurrentPage('pricing');
      } else {
        setCurrentPage('app');
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-teal-50 via-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-teal-600 text-xl">Loading...</div>
      </div>
    );
  }

  if (currentPage === 'pricing') {
    return <PricingPage />;
  }

  return user ? <Dashboard /> : <Auth />;
}

export default App;
