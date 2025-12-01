# Theme Selector Component Examples

This document provides example code for creating UI components to allow users to select between parallax themes.

## Simple Dropdown Example

```javascript
import React, { useState } from 'react';
import { getThemesList, setActiveTheme, validateTheme } from '../utils/themeManager';

const ThemeSelectorDropdown = ({ currentTheme, onThemeChange }) => {
  const themes = getThemesList();
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const newThemeId = e.target.value;
    const validation = validateTheme(newThemeId);
    
    if (!validation.isValid) {
      setError(`Cannot load theme: ${validation.messages.join(', ')}`);
      return;
    }

    setActiveTheme(newThemeId);
    onThemeChange(newThemeId);
    setError(null);
  };

  return (
    <div className="theme-selector-dropdown">
      {error && <div className="error">{error}</div>}
      <label htmlFor="theme-select">Select Theme: </label>
      <select 
        id="theme-select"
        value={currentTheme} 
        onChange={handleChange}
      >
        {themes.map(theme => (
          <option key={theme.id} value={theme.id}>
            {theme.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ThemeSelectorDropdown;
```

## Button Grid Example

```javascript
import React, { useState } from 'react';
import { getThemesList, setActiveTheme, validateTheme } from '../utils/themeManager';
import './ThemeSelector.css';

const ThemeSelector = ({ currentTheme, onThemeChange }) => {
  const themes = getThemesList();
  const [error, setError] = useState(null);

  const handleThemeChange = (newThemeId) => {
    const validation = validateTheme(newThemeId);
    
    if (!validation.isValid) {
      setError(`Cannot load theme: ${validation.messages.join(', ')}`);
      return;
    }

    setActiveTheme(newThemeId);
    onThemeChange(newThemeId);
    setError(null);
  };

  return (
    <div className="theme-selector">
      <h3>Select Scene Theme</h3>
      
      {error && (
        <div className="theme-error" role="alert">
          {error}
        </div>
      )}

      <div className="theme-options">
        {themes.map(theme => (
          <button
            key={theme.id}
            className={`theme-button ${currentTheme === theme.id ? 'active' : ''}`}
            onClick={() => handleThemeChange(theme.id)}
            aria-pressed={currentTheme === theme.id}
            title={theme.description}
          >
            <span className="theme-name">{theme.name}</span>
            <span className="theme-description">{theme.description}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ThemeSelector;
```

## CSS for Button Grid

```css
.theme-selector {
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  max-width: 600px;
}

.theme-selector h3 {
  margin-top: 0;
  color: #333;
  font-size: 18px;
}

.theme-error {
  background-color: #fee;
  border: 1px solid #fcc;
  color: #c33;
  padding: 12px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 14px;
}

.theme-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 12px;
}

.theme-button {
  padding: 16px;
  background: #f5f5f5;
  border: 2px solid #ddd;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 8px;
  text-align: center;
}

.theme-button:hover {
  background: #efefef;
  border-color: #999;
  transform: translateY(-2px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.theme-button.active {
  background: #4CAF50;
  border-color: #2E7D32;
  color: white;
  box-shadow: 0 4px 12px rgba(76, 175, 80, 0.3);
}

.theme-name {
  font-weight: 600;
  font-size: 14px;
}

.theme-description {
  font-size: 12px;
  opacity: 0.75;
}

.theme-button.active .theme-description {
  opacity: 0.9;
}
```

## Carousel Example

```javascript
import React from 'react';
import { getThemesList, setActiveTheme } from '../utils/themeManager';
import './ThemeCarousel.css';

const ThemeCarousel = ({ currentTheme, onThemeChange }) => {
  const themes = getThemesList();
  const currentIndex = themes.findIndex(t => t.id === currentTheme);
  
  const handlePrev = () => {
    const newIndex = (currentIndex - 1 + themes.length) % themes.length;
    setActiveTheme(themes[newIndex].id);
    onThemeChange(themes[newIndex].id);
  };
  
  const handleNext = () => {
    const newIndex = (currentIndex + 1) % themes.length;
    setActiveTheme(themes[newIndex].id);
    onThemeChange(themes[newIndex].id);
  };

  const current = themes[currentIndex];
  
  return (
    <div className="theme-carousel">
      <button 
        className="carousel-button prev" 
        onClick={handlePrev}
        aria-label="Previous theme"
      >
        ←
      </button>
      <div className="theme-info">
        <h3>{current.name}</h3>
        <p>{current.description}</p>
      </div>
      <button 
        className="carousel-button next" 
        onClick={handleNext}
        aria-label="Next theme"
      >
        →
      </button>
    </div>
  );
};

export default ThemeCarousel;
```

## CSS for Carousel

```css
.theme-carousel {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 20px;
  background: rgba(255, 255, 255, 0.95);
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.carousel-button {
  background: #4CAF50;
  color: white;
  border: none;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.carousel-button:hover {
  background: #2E7D32;
  transform: scale(1.1);
}

.carousel-button:active {
  transform: scale(0.95);
}

.theme-info {
  flex: 1;
  text-align: center;
}

.theme-info h3 {
  margin: 0 0 8px 0;
  color: #333;
}

.theme-info p {
  margin: 0;
  color: #666;
  font-size: 14px;
}
```

## Integration Example

### In PathCanvas.jsx

```javascript
// Add to state
const [currentTheme, setCurrentTheme] = useState(() => {
  return localStorage.getItem('wordwalker-current-theme') || 'default';
});

// Add to UI (with conditional rendering)
{showThemeSelector && (
  <ThemeSelector 
    currentTheme={currentTheme}
    onThemeChange={setCurrentTheme}
  />
)}
```

### In Settings Dialog

```javascript
const SettingsDialog = () => {
  const [currentTheme, setCurrentTheme] = useState(getActiveTheme());

  return (
    <div className="settings-dialog">
      <h2>Game Settings</h2>
      
      <section className="settings-section">
        <h3>Scene Theme</h3>
        <p>Choose the background environment for your game.</p>
        <ThemeSelector 
          currentTheme={currentTheme}
          onThemeChange={setCurrentTheme}
        />
      </section>
      
      {/* Other settings... */}
    </div>
  );
};
```

## Implementation Steps

1. Choose which UI component example you prefer (dropdown, grid, or carousel)
2. Copy the component code into a new file (e.g., `src/components/ThemeSelector.jsx`)
3. Copy the associated CSS into a matching CSS file
4. Import the component where you want to use it
5. Pass `currentTheme` and `onThemeChange` props to the component

## Notes

- All examples include theme validation before switching
- Error messages are displayed if a theme cannot be loaded
- The `setActiveTheme()` function updates localStorage automatically
- Components are accessibility-friendly with proper ARIA labels
- Styling can be customized to match your game's design

