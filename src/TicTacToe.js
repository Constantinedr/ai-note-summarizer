import React, { useState, useEffect } from 'react';
import './TicTacToe.css'; // Assuming you have this for styling
import { Link } from 'react-router-dom';

const TicTacToe = () => {
  const [board, setBoard] = useState(
    Array(3).fill().map(() => Array(3).fill(' '))
  );
  const [currentPlayer, setCurrentPlayer] = useState('X');
  const [gameStatus, setGameStatus] = useState('Your turn (X)');

  // Handle human player (X) clicking a cell
  const handleCellClick = (row, col) => {
    if (board[row][col] !== ' ' || gameStatus.includes('wins') || gameStatus.includes('draw') || currentPlayer !== 'X') {
      return;
    }

    const newBoard = board.map(row => [...row]);
    newBoard[row][col] = 'X';
    setBoard(newBoard);

    if (checkWinner(newBoard, 'X')) {
      setGameStatus('You win (X)!');
    } else if (isBoardFull(newBoard)) {
      setGameStatus("It's a draw!");
    } else {
      setCurrentPlayer('O');
      setGameStatus('AI is thinking...');
    }
  };

  // AI move logic using Minimax
  const aiMove = () => {
    const bestMove = minimax(board, 'O');
    const newBoard = board.map(row => [...row]);
    newBoard[bestMove.row][bestMove.col] = 'O';
    setBoard(newBoard);

    if (checkWinner(newBoard, 'O')) {
      setGameStatus('AI wins (O)!');
    } else if (isBoardFull(newBoard)) {
      setGameStatus("It's a draw!");
    } else {
      setCurrentPlayer('X');
      setGameStatus('Your turn (X)');
    }
  };

  // Minimax algorithm
  const minimax = (board, player) => {
    // Check terminal states
    if (checkWinner(board, 'X')) return { score: -10 };
    if (checkWinner(board, 'O')) return { score: 10 };
    if (isBoardFull(board)) return { score: 0 };

    const moves = [];
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i][j] === ' ') {
          const move = {};
          move.row = i;
          move.col = j;
          const newBoard = board.map(row => [...row]);
          newBoard[i][j] = player;

          if (player === 'O') {
            const result = minimax(newBoard, 'X');
            move.score = result.score;
          } else {
            const result = minimax(newBoard, 'O');
            move.score = result.score;
          }
          moves.push(move);
        }
      }
    }

    let bestMove;
    if (player === 'O') {
      let bestScore = -Infinity;
      for (let move of moves) {
        if (move.score > bestScore) {
          bestScore = move.score;
          bestMove = move;
        }
      }
    } else {
      let bestScore = Infinity;
      for (let move of moves) {
        if (move.score < bestScore) {
          bestScore = move.score;
          bestMove = move;
        }
      }
    }
    return bestMove;
  };

  // Check for winner
  const checkWinner = (board, player) => {
    for (let i = 0; i < 3; i++) {
      if (board[i].every(cell => cell === player) || 
          board.every(row => row[i] === player)) {
        return true;
      }
    }
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
    setGameStatus('Your turn (X)');
  };

  // Trigger AI move when it's O's turn
  useEffect(() => {
    if (currentPlayer === 'O' && !gameStatus.includes('wins') && !gameStatus.includes('draw')) {
      setTimeout(aiMove, 500); // Small delay for better UX
    }
  }, [currentPlayer, board, gameStatus]);

  return (
    <div className="tic-tac-toe">
      <h1>Tic Tac Toe vs AI</h1>
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
      <br />
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