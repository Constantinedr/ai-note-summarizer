import React, { useState, useEffect } from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import "./123.css";
import { Link } from "react-router-dom";

function Torn() {
  const { unityProvider, isLoaded, loadingProgression } = useUnityContext({
    loaderUrl: "build/Build.loader.js",
    dataUrl: "build/Build.data",
    frameworkUrl: "build/Build.framework.js",
    codeUrl: "build/Build.wasm",
    streamingAssetsUrl: "StreamingAssets",
    companyName: "Test",
    productName: "test",
    productVersion: "0.1",
  });

  const [progress, setProgress] = useState(0);

  useEffect(() => {
    setProgress(Math.round(loadingProgression * 100));
  }, [loadingProgression]);

  return (
    <div className="game-container">
      {!isLoaded && (
        <div className="loading-container">
          <p>Loading... {progress}%</p>
          <div className="loading-bar">
            <div
              className="loading-progress"
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      <div className="game-card" style={{ display: isLoaded ? "block" : "none" }}>
        <Unity
          unityProvider={unityProvider}
          style={{ width: "960px", height: "600px", background: "#231F20" }}
          className="unity-game"
        />
      </div>
      <Link to="/">
        <button className="button back-button">Back to Summarizer</button>
      </Link>
    </div>
  );
}

export default Torn;