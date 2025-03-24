import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './123.css';

const TextViewer = ({ darkMode, toggleDarkMode }) => {
  const [text, setText] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!token);
  const [savedText, setSavedText] = useState(null); // Single saved text
  const [message, setMessage] = useState('');

  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  const clearText = () => {
    setText('');
  };

  const saveText = async () => {
    if (!isLoggedIn) {
      setMessage('Please log in to save text.');
      return;
    }
    if (!text.trim()) {
      setMessage('Text cannot be empty.');
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, text }),
      });

      const result = await response.text();
      if (response.ok) {
        setMessage('Text saved successfully!');
        fetchSavedText();
      } else {
        setMessage(result || 'Failed to save text.');
      }
    } catch (error) {
      console.error('Error saving text:', error);
      setMessage('Error saving text.');
    }
  };

  const fetchSavedText = async () => {
    if (!isLoggedIn) {
      setMessage('Please log in to view saved text.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/text?token=${token}`);
      const data = await response.json();
      if (response.ok) {
        setSavedText(data);
        setMessage('Saved text loaded.');
      } else {
        setMessage(data || 'Failed to fetch saved text.');
      }
    } catch (error) {
      console.error('Error fetching text:', error);
      setMessage('Error fetching saved text.');
    }
  };

  const toggleLogin = () => {
    if (isLoggedIn) {
      localStorage.removeItem('token');
      setToken('');
      setIsLoggedIn(false);
      setSavedText(null);
      setMessage('Logged out.');
    } else {
      const mockToken = 'mock-jwt-token'; // Replace with actual token from login
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      setIsLoggedIn(true);
      setMessage('Logged in (mock).');
      fetchSavedText();
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchSavedText();
    }
  }, [isLoggedIn]);

  return (
    <div className={`container ${darkMode ? 'dark-mode' : ''}`}>
      <div className="editor-card">
        <div className="left-section">
          <h1 className="title">Simple Text Editor</h1>
          <textarea
            className="text-area"
            value={text}
            onChange={handleTextChange}
            placeholder="Start typing here..."
            rows="10"
            cols="50"
          />
          <div className="button-group">
            <button className="clear-button" onClick={clearText}>
              Clear Text
            </button>
            <button className="toggle-dark-button" onClick={toggleDarkMode}>
              {darkMode ? 'Light Mode' : 'Dark Mode'}
            </button>
            {isLoggedIn && (
              <button className="save-button" onClick={saveText}>
                Save Text
              </button>
            )}
            <button className="login-button" onClick={toggleLogin}>
              {isLoggedIn ? 'Logout' : 'Login (Mock)'}
            </button>
          </div>
          <p className="message">{message}</p>
        </div>

        <div className="right-section">
          <h2 className="subtitle">Editor Stats</h2>
          <ul className="stats-list">
            <li className="stat-item">
              <span>Word Count:</span>
              <span>{text.trim().split(/\s+/).filter(Boolean).length}</span>
            </li>
            <li className="stat-item">
              <span>Character Count:</span>
              <span>{text.length}</span>
            </li>
            <li className="stat-item">
              <span>Line Count:</span>
              <span>{text.split('\n').length}</span>
            </li>
          </ul>

          {isLoggedIn && (
            <>
              <h2 className="subtitle">Saved Text</h2>
              <button className="fetch-button" onClick={fetchSavedText}>
                Refresh Saved Text
              </button>
              <ul className="stats-list">
                {savedText ? (
                  <li className="stat-item">
                    <span>{savedText.text.substring(0, 20)}...</span>
                    <span>{new Date(savedText.createdAt).toLocaleDateString()}</span>
                  </li>
                ) : (
                  <li className="stat-item">No saved text yet.</li>
                )}
              </ul>
            </>
          )}
        </div>
      </div>

      <div className="login-status">
        <span className={isLoggedIn ? 'status-logged-in' : 'status-logged-out'}>
          {isLoggedIn ? 'Logged In' : 'Not Logged In'}
        </span>
        <Link to="/">
          <button className="button back-button">
            Back to Summarizer
          </button>
        </Link>
      </div>
    </div>
  );
};

export default TextViewer;