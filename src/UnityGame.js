import React, { useEffect, useRef } from 'react';

function UnityGame() {
  const unityContainerRef = useRef(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = '/build/unityBuild.loader.js';
    script.async = true;
    document.body.appendChild(script);

    script.onload = () => {
      if (window.createUnityInstance) {
        window.createUnityInstance(unityContainerRef.current, {
                      
                dataUrl: '/build/unityBuild.data.br',
                frameworkUrl: '/build/unityBuild.framework.js.br',
                codeUrl: '/build/unityBuild.wasm.br',
            
        })
          .then((unityInstance) => {
            console.log('Unity loaded successfully!');
          })
          .catch((error) => {
            console.error('Error loading Unity:', error);
          });
      }
    };

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div ref={unityContainerRef} style={{ width: '960px', height: '600px' }} />
  );
}

export default UnityGame;