import React, { useEffect, useState } from 'react';

const DarkModeToggle = () => {
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === 'true');

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  return (
    <button
      onClick={() => setDarkMode(!darkMode)}
      style={{
        position: 'fixed',
        top: '1rem',
        right: '1rem',
        padding: '0.5rem 1rem',
        borderRadius: '0.5rem',
        background: darkMode ? '#1e3a8a' : '#4f46e5',
        color: '#fff',
        border: 'none',
        cursor: 'pointer'
      }}
    >
      {darkMode ? '☀️ Light' : '🌙 Dark'}
    </button>
  );
};

export default DarkModeToggle;
