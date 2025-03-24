import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom"; // Import useNavigate
import { Unity, useUnityContext } from "react-unity-webgl";
import "./123.css"; // Adjust path to your CSS file

function Torn() {
  const { unityProvider, unload, sendMessage, addEventListener, removeEventListener } = useUnityContext({
    loaderUrl: "build/unityBuild.loader.js",
    dataUrl: "build/unityBuild.data",
    frameworkUrl: "build/unityBuild.framework.js",
    codeUrl: "build/unityBuild.wasm",
  });

  const navigate = useNavigate(); // Hook for programmatic navigation

  // Handle Unity events
  useEffect(() => {
    const handleGameOver = (score) => {
      console.log("Game Over! Score:", score);
    };
    addEventListener("GameOver", handleGameOver);
    return () => removeEventListener("GameOver", handleGameOver);
  }, [addEventListener, removeEventListener]);

  // Function to stop the game and navigate
  const handleBackClick = () => {
    unload()
      .then(() => {
        console.log("Unity game stopped successfully");
        navigate("/"); // Navigate only after unload completes
      })
      .catch((error) => {
        console.error("Error stopping Unity game:", error);
        navigate("/"); // Navigate even if unload fails, to avoid getting stuck
      });
  };

  return (
    <div className="game-container">
      <div className="game-card">
        <Unity unityProvider={unityProvider} className="unity-game" />
        <br />
        <button className="button back-button" onClick={handleBackClick}>
          Back to Summarizer
        </button>
      </div>
    </div>
  );
}

export default Torn;