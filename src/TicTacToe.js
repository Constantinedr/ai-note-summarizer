import React, { useState } from 'react';
import './TicTacToe.css'; // We'll add CSS separately
import { Link } from 'react-router-dom';

const TicTacToe = () => {
  // Initialize 3x3 board with empty spaces
  const [board, setBoard] = useState(
    Array(3).fill().map(() => Array(3).fill(' '))
  );
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameStatus, setGameStatus] = useState('Player X\'s turn');

  // Handle cell click
  const handleCellClick = (row, col) => {
    if (board[row][col] !== ' ' || gameStatus.includes('wins') || gameStatus.includes('draw')) {
      return;
    }

    // Create new board with the move
    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = currentPlayer;
    setBoard(newBoard);

    // Check for winner
    if (checkWinner(newBoard, currentPlayer)) {
      setGameStatus(`Player ${currentPlayer} wins!`);
    }
    // Check for draw
    else if (isBoardFull(newBoard)) {
      setGameStatus("It's a draw!");
    }
    // Switch player
    else {
      const nextPlayer = currentPlayer === 'X' ? 'O' : 'X';
      setCurrentPlayer(nextPlayer);
      setGameStatus(`Player ${nextPlayer}'s turn`);
    }
  };

  // Check for winner
  const checkWinner = (board, player) => {
    // Check rows and columns
    for (let i = 0; i < 3; i++) {
      if (board[i].every(cell => cell === player) || 
          board.every(row => row[i] === player)) {
        return true;
      }
    }
    // Check diagonals
    if (board[0][0] === player && board[1][1] === player && board[2][2] === player) {
      return true;
    }
    if (board[0][2] === player && board[1][1] === player && board[2][0] === player) {
      return true;
    }
    return false;
  };

  // Check if board is full
  const isBoardFull = (board) => {
    return board.every(row => row.every(cell => cell !== ' '));
  };

  // Reset game
  const resetGame = () => {
    setBoard(Array(3).fill().map(() => Array(3).fill(' ')));
    setCurrentPlayer('X');
    setGameStatus('Player X\'s turn');
  };

  return (
    <div className="tic-tac-toe">
      <h1>Tic Tac Toe</h1>
      <div className="status">{gameStatus}</div>
      <div className="board">
        {board.map((row, rowIndex) => (
          <div key={rowIndex} className="row">
            {row.map((cell, colIndex) => (
              <div
                key={colIndex}
                className="cell"
                onClick={() => handleCellClick(rowIndex, colIndex)}
              >
                {cell}
              </div>
            ))}
          </div>
        ))}
      </div>
              <Link to="/">
                <button className="button back-button">
                  Back to Summarizer
                </button>
              </Link>
      <button className="reset-button" onClick={resetGame}>
        Reset Game
      </button>
    </div>
    
  );
};

export default TicTacToe;