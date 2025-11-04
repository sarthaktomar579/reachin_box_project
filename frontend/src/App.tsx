import React, { useState, useEffect } from 'react';
import { io, Socket } from 'socket.io-client';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import './styles/App.css';

const socket: Socket = io('http://localhost:5000');

function App() {
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'settings'>('dashboard');
  const [notification, setNotification] = useState<string | null>(null);

  useEffect(() => {
    socket.on('new-email', (email) => {
      setNotification(`📧 New email: ${email.subject.substring(0, 50)}`);
      setTimeout(() => setNotification(null), 5000);
    });

    return () => {
      socket.off('new-email');
    };
  }, []);

  return (
    <div className="app">
      <header className="app-header">
        <h1>📧 ReachInbox Onebox</h1>
        <nav>
          <button 
            className={currentPage === 'dashboard' ? 'active' : ''} 
            onClick={() => setCurrentPage('dashboard')}
          >
            Dashboard
          </button>
          <button 
            className={currentPage === 'settings' ? 'active' : ''} 
            onClick={() => setCurrentPage('settings')}
          >
            Settings
          </button>
        </nav>
      </header>

      {notification && (
        <div className="notification">
          {notification}
        </div>
      )}

      <main>
        {currentPage === 'dashboard' ? <Dashboard /> : <Settings />}
      </main>
    </div>
  );
}

export default App;