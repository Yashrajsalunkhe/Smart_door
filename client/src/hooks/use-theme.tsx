import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check for user preference in localStorage
    const savedMode = localStorage.getItem('doorbell-theme');
    if (savedMode === 'dark') {
      setIsDarkMode(true);
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      localStorage.setItem('doorbell-theme', newMode ? 'dark' : 'light');
      return newMode;
    });
  };

  return { isDarkMode, toggleDarkMode };
};
