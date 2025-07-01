'use client';

import React, { useState, useRef, useEffect } from 'react';

interface FontUploaderProps {
  onFontLoaded: (fontFamily: string) => void;
  className?: string;
}

interface LoadedFont {
  id: string;
  name: string;
  url: string;
}

const FontUploader: React.FC<FontUploaderProps> = ({ onFontLoaded, className }) => {
  const [fonts, setFonts] = useState<LoadedFont[]>([]);
  const [loadingFont, setLoadingFont] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load saved fonts from localStorage on component mount
  useEffect(() => {
    try {
      const savedFonts = localStorage.getItem('user-fonts');
      if (savedFonts) {
        const parsedFonts = JSON.parse(savedFonts);
        setFonts(parsedFonts);
        
        // Load all saved fonts
        parsedFonts.forEach((font: LoadedFont) => {
          loadFontFace(font.name, font.url);
        });
      }
    } catch (err) {
      console.error('Error loading saved fonts:', err);
    }
  }, []);

  // Save fonts to localStorage when the fonts array changes
  useEffect(() => {
    if (fonts.length) {
      localStorage.setItem('user-fonts', JSON.stringify(fonts));
    }
  }, [fonts]);

  const loadFontFace = (fontName: string, fontUrl: string) => {
    const fontFace = new FontFace(fontName, `url(${fontUrl})`);
    
    document.fonts.add(fontFace);
    
    fontFace.load().then(() => {
      console.log(`Font ${fontName} loaded successfully`);
    }).catch(error => {
      console.error(`Error loading font ${fontName}:`, error);
      setErrorMessage(`Error loading font: ${error.message}`);
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.name.match(/\.(ttf|otf|woff|woff2)$/i)) {
      setErrorMessage('Please upload a valid font file (.ttf, .otf, .woff, or .woff2)');
      return;
    }

    setLoadingFont(true);
    setErrorMessage('');

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) {
        setLoadingFont(false);
        setErrorMessage('Error reading font file');
        return;
      }

      try {
        const fontUrl = e.target.result.toString();
        // Generate a unique font family name
        const fontName = `UserFont-${Date.now()}`;
        
        // Add the font face
        loadFontFace(fontName, fontUrl);
        
        // Create font object
        const newFont: LoadedFont = {
          id: `font_${Date.now()}`, 
          name: fontName,
          url: fontUrl
        };
        
        // Save to state
        setFonts(prevFonts => [...prevFonts, newFont]);
        
        // Notify parent
        onFontLoaded(fontName);
      } catch (err) {
        console.error('Error processing font:', err);
        setErrorMessage('Failed to process font file');
      } finally {
        setLoadingFont(false);
      }
    };
    
    reader.onerror = () => {
      setLoadingFont(false);
      setErrorMessage('Error reading font file');
    };
    
    reader.readAsDataURL(file);
  };

  const handleFontSelect = (fontName: string) => {
    onFontLoaded(fontName);
  };

  const handleRemoveFont = (e: React.MouseEvent, fontId: string) => {
    e.stopPropagation();
    setFonts(prevFonts => prevFonts.filter(font => font.id !== fontId));
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`font-uploader ${className || ''}`}>
      <div className="upload-section">
        <button 
          type="button"
          onClick={triggerFileInput}
          disabled={loadingFont}
          className="upload-button"
        >
          {loadingFont ? 'Loading Font...' : 'Upload Handwriting Font'}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".ttf,.otf,.woff,.woff2"
          onChange={handleFileChange}
          style={{ display: 'none' }}
        />
        
        <small className="info-text">
          Supports .ttf, .otf, .woff, and .woff2 formats
        </small>
        
        {errorMessage && (
          <div className="error-message">
            {errorMessage}
          </div>
        )}
      </div>

      {fonts.length > 0 && (
        <div className="my-fonts">
          <h4>My Fonts</h4>
          <ul className="font-list">
            {fonts.map(font => (
              <li 
                key={font.id}
                onClick={() => handleFontSelect(font.name)}
                className="font-item"
              >
                <span className="font-preview" style={{ fontFamily: font.name }}>
                  Handwriting
                </span>
                <button
                  type="button"
                  className="remove-font"
                  onClick={(e) => handleRemoveFont(e, font.id)}
                  title="Remove font"
                >
                  ✕
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <style jsx>{`
        .font-uploader {
          margin: 1rem 0;
        }
        .upload-button {
          padding: 0.5rem 1rem;
          background-color: var(--color-accent);
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        .upload-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        .error-message {
          color: #e53935;
          margin-top: 0.5rem;
          font-size: 0.9rem;
        }
        .info-text {
          display: block;
          margin-top: 0.5rem;
          color: var(--font-color-secondary);
        }
        .my-fonts {
          margin-top: 1rem;
        }
        .font-list {
          list-style: none;
          padding: 0;
          margin: 0.5rem 0;
        }
        .font-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          margin-bottom: 0.5rem;
          cursor: pointer;
          transition: background-color 0.2s;
        }
        .font-item:hover {
          background-color: rgba(0, 0, 0, 0.05);
        }
        .font-preview {
          flex-grow: 1;
          font-size: 1.2rem;
        }
        .remove-font {
          background: none;
          border: none;
          color: #999;
          cursor: pointer;
          font-size: 1rem;
          padding: 0.25rem;
        }
        .remove-font:hover {
          color: #e53935;
        }
      `}</style>
    </div>
  );
};

export default FontUploader; 