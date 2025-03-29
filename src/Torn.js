import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import "./123.css"; // Make sure this CSS file exists and contains appropriate styling

function Torn() {
  const { unityProvider } = useUnityContext({
    loaderUrl: "build/unityBuild.loader.js",    // Updated paths to match original
    dataUrl: "build/unityBuild.data",
    frameworkUrl: "build/unityBuild.framework.js",
    codeUrl: "build/unityBuild.wasm",
    streamingAssetsUrl: "StreamingAssets", // Added from original config
    companyName: "Test",
    productName: "test",
    productVersion: "0.1",
  });

  return (
    <div className="game-container">
      <div className="game-card">
        <Unity 
          unityProvider={unityProvider}
          style={{
            width: "960px",
            height: "600px",
            background: "#231F20"
          }}
          className="unity-game"
        />
      </div>
    </div>
  );
}

export default Torn;