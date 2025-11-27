import { useState, useEffect } from 'react';
import { translations } from '../config/translations';
import './SearchDialog.css';

export default function SearchDialog({ isOpen, onClose }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState([]);
  const [searchType, setSearchType] = useState('english'); // 'english' or 'spanish'

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setResults([]);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const matches = [];

    if (searchType === 'english') {
      // Search English → Spanish
      Object.entries(translations).forEach(([spanish, english]) => {
        if (english.toLowerCase().includes(term)) {
          matches.push({ spanish, english });
        }
      });
    } else {
      // Search Spanish → English
      Object.entries(translations).forEach(([spanish, english]) => {
        if (spanish.toLowerCase().includes(term)) {
          matches.push({ spanish, english });
        }
      });
    }

    // Sort by relevance (exact matches first, then partial matches)
    matches.sort((a, b) => {
      const aSpanish = a.spanish.toLowerCase();
      const bSpanish = b.spanish.toLowerCase();
      const aEnglish = a.english.toLowerCase();
      const bEnglish = b.english.toLowerCase();

      if (searchType === 'english') {
        if (aEnglish === term) return -1;
        if (bEnglish === term) return 1;
        if (aEnglish.startsWith(term) && !bEnglish.startsWith(term)) return -1;
        if (!aEnglish.startsWith(term) && bEnglish.startsWith(term)) return 1;
      } else {
        if (aSpanish === term) return -1;
        if (bSpanish === term) return 1;
        if (aSpanish.startsWith(term) && !bSpanish.startsWith(term)) return -1;
        if (!aSpanish.startsWith(term) && bSpanish.startsWith(term)) return 1;
      }

      return aSpanish.localeCompare(bSpanish);
    });

    setResults(matches.slice(0, 20)); // Limit to 20 results
  }, [searchTerm, searchType]);

  const handleClose = () => {
    setSearchTerm('');
    setResults([]);
    onClose();
  };

  const handleSearchTypeToggle = () => {
    setSearchType(prev => prev === 'english' ? 'spanish' : 'english');
    setSearchTerm('');
    setResults([]);
  };

  if (!isOpen) return null;

  return (
    <div className="search-dialog-overlay" onClick={handleClose}>
      <div className="search-dialog" onClick={(e) => e.stopPropagation()}>
        <div className="search-dialog-header">
          <h2>🔍 Dictionary Search</h2>
          <button className="search-close-btn" onClick={handleClose}>✕</button>
        </div>

        <div className="search-type-toggle">
          <button 
            className={searchType === 'english' ? 'active' : ''}
            onClick={handleSearchTypeToggle}
          >
            English → Spanish
          </button>
          <button 
            className={searchType === 'spanish' ? 'active' : ''}
            onClick={handleSearchTypeToggle}
          >
            Spanish → English
          </button>
        </div>

        <div className="search-input-container">
          <input
            type="text"
            className="search-input"
            placeholder={searchType === 'english' ? 'Search in English...' : 'Buscar en español...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            autoFocus
          />
        </div>

        <div className="search-results">
          {searchTerm.trim() === '' && (
            <div className="search-hint">
              {searchType === 'english' 
                ? 'Type an English word to find its Spanish translation'
                : 'Escribe una palabra en español para encontrar su traducción'}
            </div>
          )}

          {searchTerm.trim() !== '' && results.length === 0 && (
            <div className="search-no-results">
              No results found for "{searchTerm}"
            </div>
          )}

          {results.length > 0 && (
            <div className="search-results-list">
              {results.map((result, index) => (
                <div key={index} className="search-result-item">
                  <div className="result-spanish">{result.spanish}</div>
                  <div className="result-arrow">→</div>
                  <div className="result-english">{result.english}</div>
                </div>
              ))}
            </div>
          )}

          {results.length === 20 && (
            <div className="search-hint">
              Showing first 20 results. Try being more specific.
            </div>
          )}
        </div>

        <div className="search-dialog-footer">
          <p className="search-info">
            Searching {Object.keys(translations).length} words from your WordWalker vocabulary
          </p>
        </div>
      </div>
    </div>
  );
}
