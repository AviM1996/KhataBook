/**
 * 📱 useWindowSize Hook
 * Get responsive window size without performance issues
 */

import { useState, useEffect } from "react";

export const useWindowSize = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Use passive listener for better performance
    window.addEventListener("resize", handleResize, { passive: true });
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return { isMobile };
};
