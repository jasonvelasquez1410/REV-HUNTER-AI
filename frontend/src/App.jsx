import React, { useState, useEffect } from 'react';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Admin from './pages/Admin';
import LandingPageDemo from './pages/LandingPageDemo';
import FacebookDemo from './pages/FacebookDemo';
import { TenantProvider, useTenant } from './context/TenantContext';

function AppContent() {
  const [currentPage, setCurrentPage] = useState('home');
  const { tenant } = useTenant();

    useEffect(() => {
    const syncRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash.replace('#', '');
      const activeRoute = hash || path;

      if (activeRoute === '/admin' || activeRoute === 'admin') {
        setCurrentPage('admin');
      } else if (activeRoute === '/landing' || activeRoute === 'landing') {
        setCurrentPage('landing');
      } else if (activeRoute === '/facebook' || activeRoute === 'facebook') {
        setCurrentPage('facebook');
      } else {
        setCurrentPage('home');
      }
    };

    syncRoute();
    window.addEventListener('hashchange', syncRoute);
    window.addEventListener('popstate', syncRoute);
    return () => {
      window.removeEventListener('hashchange', syncRoute);
      window.removeEventListener('popstate', syncRoute);
    };
  }, []);

  return (
    <div className="App">
      <header style={{ backgroundColor: '#f8f9fa' }}>
        <div className="container header-content">
          <span>📍 {tenant.address || 'Loading...'}, {tenant.location}</span>
          <span>📞 (587) 860-1770</span>
        </div>
      </header>

      <nav>
        <div className="container nav-content">
          <a href="#" className="logo" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }} style={{ color: tenant.theme_color }}>
            {tenant.name.toUpperCase()}
          </a>
          <div className="nav-links">
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('home'); }}>Inventory</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('landing'); }}>Demo Site</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('facebook'); }}>Demo FB</a>
            <a href="#" onClick={(e) => { e.preventDefault(); setCurrentPage('admin'); }}>Admin Portal</a>
          </div>
        </div>
      </nav>

      <main>
        {currentPage === 'home' && <Home />}
        {currentPage === 'admin' && <Admin />}
        {currentPage === 'landing' && <LandingPageDemo />}
        {currentPage === 'facebook' && <FacebookDemo />}
      </main>

      <ChatWidget />

      <footer style={{ backgroundColor: '#002244', color: 'white', padding: '40px 0', marginTop: '80px' }}>
        <div className="container" style={{ textAlign: 'center' }}>
          <p>© 2026 {tenant.name} - {tenant.location}'s Trusted Used Car Dealer</p>
          <div style={{ fontSize: '0.7rem', marginTop: '10px', opacity: 0.5 }}>
            Powered by RevHunter AI - The Relentless Sales Engine
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <TenantProvider>
      <AppContent />
    </TenantProvider>
  );
}

export default App;
