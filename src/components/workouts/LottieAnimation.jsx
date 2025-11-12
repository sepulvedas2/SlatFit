import React, { useEffect, useRef, useState } from "react";

export default function LottieAnimation({ url, className = "w-32 h-32" }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    const loadLottie = () => {
      try {
        // Check if lottie is already loaded
        if (window.lottie) {
          if (animationRef.current) {
            animationRef.current.destroy();
          }

          animationRef.current = window.lottie.loadAnimation({
            container: containerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: true,
            path: url
          });
        } else {
          // Load lottie from CDN
          const script = document.createElement('script');
          script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lottie-web/5.12.2/lottie.min.js';
          script.async = true;
          script.onload = () => {
            if (window.lottie && containerRef.current) {
              animationRef.current = window.lottie.loadAnimation({
                container: containerRef.current,
                renderer: 'svg',
                loop: true,
                autoplay: true,
                path: url
              });
            }
          };
          script.onerror = () => {
            console.error("Failed to load Lottie library");
            setError(true);
          };
          document.head.appendChild(script);
        }
      } catch (error) {
        console.error("Error loading Lottie animation:", error);
        setError(true);
      }
    };

    loadLottie();

    return () => {
      if (animationRef.current) {
        try {
          animationRef.current.destroy();
        } catch (e) {
          console.error("Error destroying animation:", e);
        }
      }
    };
  }, [url]);

  if (!url || error) return null;

  return <div ref={containerRef} className={className} />;
}