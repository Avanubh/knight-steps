import React, { useState } from "react";
import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import axios from "axios";
import Header from "./Header";
import Footer from "./Footer";
import "./ChessBoard.css"; // Make sure ChessBoard.css exists

const ChessBoard = () => {
  const [game, setGame] = useState(new Chess());
  const [bestMove, setBestMove] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [invalidMove, setInvalidMove] = useState(false); // State for popup

  const handleMove = async (source, target) => {
    const newGame = new Chess(game.fen());
    const move = { from: source, to: target };

    if (!newGame.move(move)) return false; // Invalid move
    if (!move) {
        setInvalidMove(true); // Show popup for invalid move
        setTimeout(() => setInvalidMove(false), 2000); // Hide popup after 2 sec
        return false; // Stop execution
      }
    

    setGame(newGame);
    const moves = newGame.history({ verbose: true }).map(m => `${m.from}${m.to}`);

    try {
      const response = await axios.post("http://your-ec2-ip:8000/analyze/", { moves });
      setBestMove(response.data.best_move);
      setEvaluation(response.data.evaluation);
    } catch (error) {
      console.error("Error analyzing move:", error);
    }
  };

  return (
    <div className="page-container">
      <Header /> {/* Now used, no more warnings */}

      <div className="chess-container">
        <div className="chessboard">
          <Chessboard
            position={game.fen()}
            onPieceDrop={(source, target) => handleMove(source, target)}
            boardStyle={{ borderRadius: "10px", boxShadow: "0 2px 10px rgba(0,0,0,0.5)" }}
          />
        </div>

        <div className="notation">
          <h2>Move Notation</h2>
          <ul>
            {game.history().map((move, index) => (
              <li key={index}>
                {index % 2 === 0 ? `${index / 2 + 1}. ${move}` : move}
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      {/* Popup for Invalid Move */}
      {invalidMove && (
        <div className="popup">
          <p>Please make the right move!</p>
        </div>
      )}


      {bestMove && <h2 className="stockfish-suggestion">Stockfish Suggests: {bestMove}</h2>}
      {evaluation !== null && <h3 className="evaluation-score">Evaluation: {evaluation / 100} (Centipawns)</h3>}

      <Footer /> {/* Now used, no more warnings */}
    </div>
  );
};

export default ChessBoard;
