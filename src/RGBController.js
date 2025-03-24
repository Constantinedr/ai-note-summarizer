
import React, { useState } from 'react';
import './App.css';

const RGBController = () => {
  const [isGameMode, setIsGameMode] = useState(false);
  const [color, setColor] = useState({ red: 128, green: 128, blue: 128 });
  const [gameColor, setGameColor] = useState(generateRandomColor());
  const [options, setOptions] = useState(generateOptions(gameColor));
  const [message, setMessage] = useState('');

  function generateRandomColor() {
    return {
      red: Math.floor(Math.random() * 256),
      green: Math.floor(Math.random() * 256),
      blue: Math.floor(Math.random() * 256)
    };
  }

  function generateOptions(correctColor) {
    const opts = [correctColor];
    for (let i = 0; i < 2; i++) {
      opts.push({
        red: Math.min(255, Math.max(0, Math.floor(correctColor.red + (Math.random() * 100 - 50)))),
        green: Math.min(255, Math.max(0, Math.floor(correctColor.green + (Math.random() * 100 - 50)))),
        blue: Math.min(255, Math.max(0, Math.floor(correctColor.blue + (Math.random() * 100 - 50))))
      });
    }
    return opts.sort(() => Math.random() - 0.5);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setColor(prevColor => ({
      ...prevColor,
      [name]: parseInt(value)
    }));
  };

  const handleGuess = (option) => {
    if (option.red === gameColor.red && 
        option.green === gameColor.green && 
        option.blue === gameColor.blue) {
      setMessage('Correct! New color generated.');
      const newColor = generateRandomColor();
      setGameColor(newColor);
      setOptions(generateOptions(newColor));
    } else {
      setMessage('Wrong! Try again.');
    }
  };

  const rgbStyle = `rgb(${color.red}, ${color.green}, ${color.blue})`;
  const hexColor = `#${((1 << 24) + (color.red << 16) + (color.green << 8) + color.blue)
    .toString(16)
    .slice(1)}`;
  const gameHexColor = `#${((1 << 24) + (gameColor.red << 16) + (gameColor.green << 8) + gameColor.blue)
    .toString(16)
    .slice(1)}`;

  return (
    <div className="container">
      <button 
        className="retake-button mode-toggle"
        onClick={() => setIsGameMode(!isGameMode)}
        style={{ margin: '20px auto', display: 'block' }}
      >
        Switch to {isGameMode ? 'Controller' : 'Game'} Mode
      </button>

      <div className="summarizerCard">
        {/* Left Section */}
        <div className="leftSection">
          <h1 className="title">
            {isGameMode ? 'Color Guessing Game' : 'RGB Controller'}
          </h1>
          
          {isGameMode ? (
            <div className="color-display rgb-display">
              <span className="rgb-text">{gameHexColor}</span>
            </div>
          ) : (
            <div 
              className="color-display"
              style={{ backgroundColor: rgbStyle }}
            ></div>
          )}

          {!isGameMode && (
            <div className="section">
              <div className="slider-group">
                <label className="subtitle">Red: {color.red}</label>
                <input
                  type="range"
                  name="red"
                  min="0"
                  max="255"
                  value={color.red}
                  onChange={handleChange}
                  className="color-slider"
                />
              </div>

              <div className="slider-group">
                <label className="subtitle">Green: {color.green}</label>
                <input
                  type="range"
                  name="green"
                  min="0"
                  max="255"
                  value={color.green}
                  onChange={handleChange}
                  className="color-slider"
                />
              </div>

              <div className="slider-group">
                <label className="subtitle">Blue: {color.blue}</label>
                <input
                  type="range"
                  name="blue"
                  min="0"
                  max="255"
                  value={color.blue}
                  onChange={handleChange}
                  className="color-slider"
                />
              </div>
            </div>
          )}

          {isGameMode && (
            <div className="section">
              <div className="answer-buttons">
                {options.map((opt, index) => (
                  <button
                    key={index}
                    className="answer-button"
                    style={{ backgroundColor: `rgb(${opt.red}, ${opt.green}, ${opt.blue})` }}
                    onClick={() => handleGuess(opt)}
                  >
                    Option {index + 1}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="rightSection">
          <h2 className="subtitle">
            {isGameMode ? 'Game Info' : 'Color Details'}
          </h2>
          
          {!isGameMode ? (
            <div className="results-section">
              <div className="result-text">
                Current Color Preview
              </div>
              <div className="summaryList">
                <div className="summaryItem">
                  <span>RGB Value</span>
                  <span className="status-text">{rgbStyle}</span>
                </div>
                <div className="summaryItem">
                  <span>HEX Value</span>
                  <span className="status-text">{hexColor}</span>
                </div>
                <div className="summaryItem">
                  <span>Red Component</span>
                  <span className="status-text">{color.red}</span>
                </div>
                <div className="summaryItem">
                  <span>Green Component</span>
                  <span className="status-text">{color.green}</span>
                </div>
                <div className="summaryItem">
                  <span>Blue Component</span>
                  <span className="status-text">{color.blue}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="results-section">
              <div className="result-text">
                Guess the Color!
              </div>
              <div className="summaryList">
                <div className="summaryItem">
                  <span>Instruction</span>
                  <span className="status-text">
                    Match the HEX value to the correct color
                  </span>
                </div>
                <div className="summaryItem">
                  <span>Result</span>
                  <span className="status-text">{message}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RGBController;