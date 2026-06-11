import React from 'react';

type Theme = 'midnight' | 'emerald' | 'sunset' | 'cyberpunk';

interface ThemeSelectorProps {
  currentTheme: Theme;
  onThemeChange: (theme: Theme) => void;
}

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onThemeChange,
}) => {
  const themes: { id: Theme; name: string }[] = [
    { id: 'midnight', name: 'Midnight Glow' },
    { id: 'emerald', name: 'Emerald Aurora' },
    { id: 'sunset', name: 'Sunset Breeze' },
    { id: 'cyberpunk', name: 'Cyberpunk Neon' },
  ];

  return (
    <div className="theme-selector-popover" role="radiogroup" aria-label="Choose theme">
      {themes.map((theme) => (
        <button
          key={theme.id}
          className={`theme-dot theme-dot-${theme.id} ${
            currentTheme === theme.id ? 'active' : ''
          }`}
          onClick={() => onThemeChange(theme.id)}
          title={theme.name}
          aria-label={`Switch to ${theme.name}`}
          aria-checked={currentTheme === theme.id}
          role="radio"
        />
      ))}
    </div>
  );
};
export default ThemeSelector;
