import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './App.css';

const PersonalityTrait = ({ darkMode, toggleDarkMode }) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResults, setShowResults] = useState(false);
  const [pastResults, setPastResults] = useState([]);
  const [userId] = useState(`user_${Math.random().toString(36).substr(2, 9)}`);
  const isLoggedIn = !!localStorage.getItem("token");

  const questions = [
    { text: "You enjoy vibrant social events with lots of people.", category: "Mind", positive: "Extraverted", negative: "Introverted" },
    { text: "You often spend time exploring unrealistic, imaginative ideas.", category: "Energy", positive: "Intuitive", negative: "Observant" },
    { text: "Your decisions are primarily based on logic rather than feelings.", category: "Nature", positive: "Thinking", negative: "Feeling" },
    { text: "You prefer to have a detailed plan rather than wing it.", category: "Tactics", positive: "Judging", negative: "Prospecting" },
    { text: "You rarely second-guess your choices.", category: "Identity", positive: "Assertive", negative: "Turbulent" },
    { text: "You find it easy to stay relaxed in social settings.", category: "Mind", positive: "Extraverted", negative: "Introverted" },
    { text: "You often notice small details others miss.", category: "Energy", positive: "Observant", negative: "Intuitive" },
    { text: "You prioritize fairness over mercy in tough situations.", category: "Nature", positive: "Thinking", negative: "Feeling" },
    { text: "You like having a structured daily routine.", category: "Tactics", positive: "Judging", negative: "Prospecting" },
    { text: "You feel confident in high-pressure situations.", category: "Identity", positive: "Assertive", negative: "Turbulent" },
    { text: "You enjoy participating in group discussions.", category: "Mind", positive: "Extraverted", negative: "Introverted" },
    { text: "You trust your experience more than your imagination.", category: "Energy", positive: "Observant", negative: "Intuitive" },
    { text: "You’d rather be honest than overly sympathetic.", category: "Nature", positive: "Thinking", negative: "Feeling" },
    { text: "Deadlines help you stay motivated.", category: "Tactics", positive: "Judging", negative: "Prospecting" },
    { text: "You rarely worry about what others think of you.", category: "Identity", positive: "Assertive", negative: "Turbulent" },
    { text: "You feel energized by meeting new people.", category: "Mind", positive: "Extraverted", negative: "Introverted" },
  ];

  const personalityDescriptions = {
    "ENTJ": "The Commander: Bold, imaginative, and strong-willed leaders, always finding a way—or making one.",
    "ENTP": "The Debater: Smart and curious thinkers who love a mental sparring match.",
    "ENFJ": "The Protagonist: Charismatic and inspiring leaders, rallying others to their cause.",
    "ENFP": "The Campaigner: Enthusiastic, creative free spirits who see life as full of possibilities.",
    "ESTJ": "The Executive: Excellent administrators, managing people and things with efficiency.",
    "ESTP": "The Entrepreneur: Energetic and action-oriented, thriving on risk and excitement.",
    "ESFJ": "The Consul: Warm, caring people who ensure everyone is taken care of.",
    "ESFP": "The Entertainer: Spontaneous, enthusiastic, and love being the center of attention.",
    "INTJ": "The Architect: Imaginative and strategic thinkers with a plan for everything.",
    "INTP": "The Logician: Innovative inventors with a thirst for knowledge.",
    "INFJ": "The Advocate: Quiet and mystical, inspiring others with their idealism.",
    "INFP": "The Mediator: Poetic, kind, and altruistic, always seeking the good in others.",
    "ISTJ": "The Logistician: Practical and fact-minded, with a strong sense of duty.",
    "ISTP": "The Virtuoso: Bold and practical experimenters, masters of tools and action.",
    "ISFJ": "The Defender: Warm and dedicated protectors, always ready to defend their loved ones.",
    "ISFP": "The Adventurer: Flexible and charming artists, always ready for a new experience.",
  };

  const handleAnswer = (value) => {
    setAnswers({ ...answers, [currentQuestion]: value });
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      saveResults();
    }
  };

  const calculateScores = () => {
    const scores = { mind: 0, energy: 0, nature: 0, tactics: 0, identity: 0 };
    Object.entries(answers).forEach(([index, value]) => {
      const category = questions[index].category.toLowerCase();
      scores[category] += value;
    });
    return scores;
  };

  const calculateResults = (scores) => {
    return {
      mind: scores.mind > 0 ? "E" : "I",
      energy: scores.energy > 0 ? "N" : "S",
      nature: scores.nature > 0 ? "T" : "F",
      tactics: scores.tactics > 0 ? "J" : "P",
      identity: scores.identity > 0 ? "A" : "T"
    };
  };

  const getPersonalityDescription = (results) => {
    const type = Object.values(results).slice(0, 4).join("");
    const description = personalityDescriptions[type] || "Unknown personality type.";
    return `${description} ${results.identity === "A" ? "You’re confident and steady." : "You’re adaptable but sometimes self-conscious."}`;
  };

  const getPersonalityImage = (results) => {
    const type = Object.values(results).slice(0, 4).join("");
    return `/images/${type}.png`;
  };

  const saveResults = async () => {
    const scores = calculateScores();
    const token = localStorage.getItem("token");
    const effectiveUserId = isLoggedIn && token ? token : userId;
    
    console.log('Sending data to server:', { userId: effectiveUserId, scores });
    try {
      const response = await fetch('https://ai-note-summarizer.onrender.com/api/results', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          ...(isLoggedIn && { 'Authorization': `Bearer ${token}` })
        },
        body: JSON.stringify({ userId: effectiveUserId, scores }),
      });
      const result = await response.json();
      if (response.ok) {
        console.log('Server response:', result);
        setShowResults(true);
        fetchPastResults();
      } else {
        console.error('Server error:', result.error || 'Unknown error');
      }
    } catch (error) {
      console.error('Fetch error:', error.message);
    }
  };

  const fetchPastResults = async () => {
    const token = localStorage.getItem("token");
    try {
      const response = await fetch('https://ai-note-summarizer.onrender.com/api/results', {
        headers: isLoggedIn ? { 'Authorization': `Bearer ${token}` } : {}
      });
      const data = await response.json();
      console.log('Fetched past results:', data);
      // Limit to the 5 most recent results
      const limitedResults = Array.isArray(data) ? data.slice(0, 5) : [];
      setPastResults(limitedResults);
    } catch (error) {
      console.error('Error fetching past results:', error.message);
      setPastResults([]);
    }
  };

  const restartTest = () => {
    setCurrentQuestion(0);
    setAnswers({});
    setShowResults(false);
  };

  useEffect(() => {
    fetchPastResults();
  }, []);

  const progress = (Object.keys(answers).length / questions.length) * 100;
  const results = showResults ? calculateResults(calculateScores()) : null;

  return (
    <div className={`container ${darkMode ? 'darkMode' : ''}`}>
      <div className="summarizerCard">
        <div className="leftSection">

          
          {!showResults ? (
            <div className="section">
              <div className="progress-container">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${progress}%` }} />
                </div>
                <p className="progress-text">{currentQuestion + 1} of {questions.length} ({Math.round(progress)}%)</p>
              </div>

              <p className="question-text">{questions[currentQuestion].text}</p>

              <div className="answer-buttons">
                {[-3, -2, -1, 0, 1, 2, 3].map((value) => (
                  <button
                    key={value}
                    className={`answer-button ${answers[currentQuestion] === value ? 'selected' : ''}`}
                    onClick={() => handleAnswer(value)}
                  >
                    {value === -3 ? "Strongly Disagree" : 
                     value === 3 ? "Strongly Agree" : 
                     value === 0 ? "Neutral" : ""}
                  </button>
                ))}
              </div>
              <div className="answer-labels">
                <span>Disagree</span>
                <span>Neutral</span>
                <span> Agree</span>
              </div>
            </div>
          ) : (
            <div className="section results-section">
              <h2 className="subtitle">Your Personality Type</h2>
              <div className="result-text">
                {Object.values(results).slice(0, 4).join("")}
                <span className="identity-text">-{results.identity}</span>
              </div>
              <p className="description-text">{getPersonalityDescription(results)}</p>
              <img 
                src={getPersonalityImage(results)} 
                alt={`${Object.values(results).slice(0, 4).join("")} icon`} 
                className="personality-image" 
              />
              <button className="retake-button" onClick={restartTest}>
                Retake Journey
              </button>
            </div>
          )}
        </div>

        <div className="rightSection">
          <h2 className="subtitle">Personality Aspects</h2>
          <ul className="summaryList">
            {["Mind", "Energy", "Nature", "Tactics", "Identity"].map((cat) => (
              <li 
                key={cat} 
                className={`summaryItem ${questions[currentQuestion].category === cat && !showResults ? 'active' : ''}`}
              >
                <span>{cat}</span>
                <span className="status-text">
                  {answers[questions.findIndex(q => q.category === cat)] !== undefined ? "Complete" : "Pending"}
                </span>
              </li>
            ))}
          </ul>
          <h2 className="subtitle">Past Results (Up to 5)</h2>
          <ul className="summaryList">
            {pastResults.length > 0 ? (
              pastResults.map((result) => {
                if (!result.scores) {
                  console.error('Invalid result entry:', result);
                  return (
                    <li key={result._id} className="summaryItem">
                      <span>{result.userId}</span>
                      <span className="status-text">No scores - {new Date(result.timestamp).toLocaleDateString()}</span>
                    </li>
                  );
                }
                const scores = {
                  mind: result.scores.mind || 0,
                  energy: result.scores.energy || 0,
                  nature: result.scores.nature || 0,
                  tactics: result.scores.tactics || 0,
                  identity: result.scores.identity || 0
                };
                const type = calculateResults(scores);
                return (
                  <li key={result._id} className="summaryItem">
                    <span>{Object.values(type).slice(0, 4).join("")}-{type.identity}</span>
                    <span className="status-text">{new Date(result.timestamp).toLocaleDateString()}</span>
                  </li>
                );
              })
            ) : (
              <li className="summaryItem">No past results yet</li>
            )}
          </ul>
        </div>
      </div>
      <div className="back-button-container">
        <Link to="/">
          <button className="button back-button">
            Back to Summarizer
          </button>
        </Link>
      </div>
    </div>
  );
};

export default PersonalityTrait;