import React from "react";
import { Unity, useUnityContext } from "react-unity-webgl";
import "./123.css";

function Torn() {
  const { unityProvider } = useUnityContext({
    loaderUrl: "/build/unityBuild.loader.js",
    dataUrl: "/build/unityBuild.data",
    frameworkUrl: "/build/unityBuild.framework.js",
    codeUrl: "/build/unityBuild.wasm",
  });

  return (
    <div className="game-container">
      <div className="game-card">
        <Unity unityProvider={unityProvider} className="unity-game" />
      </div>
    </div>
  );
}

export default Torn;