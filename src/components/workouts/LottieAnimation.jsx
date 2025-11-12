import React, { useEffect, useRef } from "react";

export default function LottieAnimation({ url, className = "w-32 h-32" }) {
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  useEffect(() => {
    if (!url || !containerRef.current) return;

    const loadLottie = async () => {
      try {
        // Dynamically import lottie-web
        const lottie = await import('lottie-web');
        
        // Clear previous animation
        if (animationRef.current) {
          animationRef.current.destroy();
        }

        // Load animation
        animationRef.current = lottie.default.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: url
        });
      } catch (error) {
        console.error("Error loading Lottie animation:", error);
      }
    };

    loadLottie();

    return () => {
      if (animationRef.current) {
        animationRef.current.destroy();
      }
    };
  }, [url]);

  if (!url) return null;

  return <div ref={containerRef} className={className} />;
}