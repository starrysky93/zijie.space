import { useState, useEffect } from 'react';
import Calculator from './components/Calculator';

type Theme = 'midnight' | 'emerald' | 'sunset' | 'cyberpunk';

function App() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('calculator_theme');
      return (saved as Theme) || 'midnight';
    }
    return 'midnight';
  });

  // Persist theme choice
  useEffect(() => {
    localStorage.setItem('calculator_theme', theme);
  }, [theme]);

  return (
    <main className={`app-wrapper theme-${theme}`} aria-label="Calculator App">
      {/* Ambient background blur blobs */}
      <div className="aurora-container" aria-hidden="true">
        <div className="aurora-orb orb-1"></div>
        <div className="aurora-orb orb-2"></div>
        <div className="aurora-orb orb-3"></div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 10 }}>
        {/* Dynamic Premium Title */}
        <h1 className="app-title">AetherCalc</h1>
        
        {/* Calculator Card */}
        <Calculator currentTheme={theme} onThemeChange={setTheme} />
      </div>
    </main>
  );
}

export default App;
