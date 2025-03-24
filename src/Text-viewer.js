import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom'; // Import Link for navigation
import './123.css'; // Assuming this is your CSS file

const TextViewer = ({ darkMode, toggleDarkMode }) => {
  const [text, setText] = useState(''); // State for the text input
  const [token, setToken] = useState(localStorage.getItem('token') || ''); // JWT token for authentication
  const [isLoggedIn, setIsLoggedIn] = useState(!!token); // Check if user is logged in based on token
  const [savedTexts, setSavedTexts] = useState([]); // State to store fetched texts
  const [message, setMessage] = useState(''); // Feedback message for user

  // Handle text change in the editor
  const handleTextChange = (event) => {
    setText(event.target.value);
  };

  // Clear the text area
  const clearText = () => {
    setText('');
  };

  // Save text to the server
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
      const response = await fetch('http://localhost:5000/summaries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, summary: text }),
      });

      const result = await response.text();
      if (response.ok) {
        setMessage('Text saved successfully!');
        fetchSavedTexts(); // Refresh the list after saving
      } else {
        setMessage(result || 'Failed to save text.');
      }
    } catch (error) {
      console.error('Error saving text:', error);
      setMessage('Error saving text.');
    }
  };

  // Fetch saved texts from the server
  const fetchSavedTexts = async () => {
    if (!isLoggedIn) {
      setMessage('Please log in to view saved texts.');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/summaries?token=${token}`);
      const data = await response.json();
      if (response.ok) {
        setSavedTexts(data);
        setMessage('Saved texts loaded.');
      } else {
        setMessage(data || 'Failed to fetch saved texts.');
      }
    } catch (error) {
      console.error('Error fetching texts:', error);
      setMessage('Error fetching saved texts.');
    }
  };

  // Simulate login/logout for testing (replace with actual login logic)
  const toggleLogin = () => {
    if (isLoggedIn) {
      localStorage.removeItem('token');
      setToken('');
      setIsLoggedIn(false);
      setSavedTexts([]);
      setMessage('Logged out.');
    } else {
      // Simulate login (replace with real login flow)
      const mockToken = 'mock-jwt-token'; // Replace with actual token from login
      localStorage.setItem('token', mockToken);
      setToken(mockToken);
      setIsLoggedIn(true);
      setMessage('Logged in (mock).');
      fetchSavedTexts(); // Fetch texts on login
    }
  };

  // Load saved texts on component mount if logged in
  useEffect(() => {
    if (isLoggedIn) {
      fetchSavedTexts();
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
              <h2 className="subtitle">Saved Texts</h2>
              <button className="fetch-button" onClick={fetchSavedTexts}>
                Refresh Saved Texts
              </button>
              <ul className="stats-list">
                {savedTexts.length > 0 ? (
                  savedTexts.map((saved, index) => (
                    <li key={index} className="stat-item">
                      <span>{saved.text.substring(0, 20)}...</span>
                      <span>{new Date(saved.createdAt).toLocaleDateString()}</span>
                    </li>
                  ))
                ) : (
                  <li className="stat-item">No saved texts yet.</li>
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