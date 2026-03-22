import React, { useState } from 'react';
import ChatWidget from './components/ChatWidget';
import Home from './pages/Home';
import Admin from './pages/Admin';
import LandingPageDemo from './pages/LandingPageDemo';
import FacebookDemo from './pages/FacebookDemo';

function App() {
  const [currentPage, setCurrentPage] = useState('home');

  return (
    <div className="App">
      <header>
        <div className="container header-content">
          <span>📍 983 FIR STREET, SHERWOOD PARK, AB T8A 4N5</span>
          <span>📞 (587) 860-1770</span>
        </div>
      </header>

      <nav>
        <div className="container nav-content">
          <a href="#" className="logo" onClick={() => setCurrentPage('home')}>FILCAN CARS</a>
          <div className="nav-links">
            <a href="#" onClick={() => setCurrentPage('home')}>Inventory</a>
            <a href="#" onClick={() => setCurrentPage('landing')}>Demo Site</a>
            <a href="#" onClick={() => setCurrentPage('facebook')}>Demo FB</a>
            <a href="#" onClick={() => setCurrentPage('admin')}>Admin Portal</a>
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
          <p>© 2026 FilCan Cars - Sherwood Park's Trusted Used Car Dealer</p>
        </div>
      </footer>
    </div>
  );
}

export default App;
