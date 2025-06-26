'use client';

import React from 'react';
import { HandwritingFont, PageEffects } from '../types';

interface CustomizationFormProps {
  fontFamily: string;
  setFontFamily: (fontFamily: string) => void;
  fontSize: string;
  setFontSize: (fontSize: string) => void;
  letterSpacing: string;
  setLetterSpacing: (letterSpacing: string) => void;
  wordSpacing: string;
  setWordSpacing: (wordSpacing: string) => void;
  topPadding: string;
  setTopPadding: (topPadding: string) => void;
  inkColor: string;
  setInkColor: (color: string) => void;
  paperColor: string;
  setPaperColor: (color: string) => void;
  generateImages: () => void;
  showDrawingCanvas: () => void;
  isDark: boolean;
  setIsDark: (isDark: boolean) => void;
  hasLines: boolean;
  setHasLines: (hasLines: boolean) => void;
  hasMargins: boolean;
  setHasMargins: (hasMargins: boolean) => void;
  pageEffect: string;
  setPageEffect: (effect: string) => void;
  resolution: string;
  setResolution: (resolution: string) => void;
  paperSize: string;
  setPaperSize: (size: string) => void;
  handwritingFonts: HandwritingFont[];
  pageEffects: PageEffects[];
}

const CustomizationForm: React.FC<CustomizationFormProps> = ({
  fontFamily,
  setFontFamily,
  fontSize,
  setFontSize,
  letterSpacing,
  setLetterSpacing,
  wordSpacing,
  setWordSpacing,
  topPadding,
  setTopPadding,
  inkColor,
  setInkColor,
  paperColor,
  setPaperColor,
  generateImages,
  showDrawingCanvas,
  isDark,
  setIsDark,
  hasLines,
  setHasLines,
  hasMargins,
  setHasMargins,
  pageEffect,
  setPageEffect,
  resolution,
  setResolution,
  paperSize,
  setPaperSize,
  handwritingFonts,
  pageEffects
}) => {
  const handleFontFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;
      
      // Create a custom font name
      const fontName = `CustomFont-${Date.now()}`;
      
      // Create and add the font face
      const fontFace = new FontFace(fontName, `url(${e.target.result})`);
      document.fonts.add(fontFace);
      
      // Use the new font
      setFontFamily(fontName);
    };
    reader.readAsDataURL(file);
  };

  const handlePaperFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;
      document.documentElement.style.setProperty(
        '--paper-bg-image',
        `url(${e.target.result})`
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="customization-col">
      <div style={{ padding: '5px 0px 5px 0px' }}>
        <b>Customizations</b> <small>(Optional)</small>
        <p style={{ fontSize: '0.8rem' }}>
          <em>
            Note: Few changes may reflect only in the generated image and not in the preview
          </em>
        </p>
      </div>
      <fieldset>
        <legend>Handwriting Options</legend>

        <div className="category-grid">
          <div>
            <label className="block" htmlFor="handwriting-font">
              Handwriting Font
            </label>
            <select 
              id="handwriting-font"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {handwritingFonts.map((font) => (
                <option 
                  key={font.value}
                  value={font.value}
                  style={font.style}
                >
                  {font.label}
                </option>
              ))}
            </select>
          </div>
          <div className="upload-handwriting-container">
            <label className="block" htmlFor="font-file">
              Upload your handwriting font <small>(Beta)</small>&nbsp;
              <a
                style={{ fontSize: '1.1rem' }}
                title="How to add your own handwriting"
                href="#how-to-add-handwriting"
              >
                &#9432;
              </a>
            </label>
            <input 
              accept=".ttf, .otf" 
              type="file" 
              id="font-file"
              onChange={handleFontFileChange}
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Page & Text Options</legend>

        <div className="category-grid">
          <div className="postfix-input" data-postfix="pt">
            <label htmlFor="font-size">Font Size</label>
            <input
              id="font-size"
              min="0"
              step="0.5"
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              type="number"
            />
          </div>
          <div>
            <label className="block" htmlFor="ink-color">Ink Color</label>
            <select 
              id="ink-color" 
              value={inkColor} 
              onChange={(e) => setInkColor(e.target.value)}
            >
              <option value="#000f55">Blue</option>
              <option value="black">Black</option>
              <option value="#ba3807">Red</option>
            </select>
          </div>
          <div>
            <label className="block" htmlFor="page-size">Page Size</label>
            <select 
              id="page-size" 
              value={paperSize} 
              onChange={(e) => setPaperSize(e.target.value)}
            >
              <option value="A4">A4</option>
              <option value="A5">A5</option>
              <option value="LETTER">Letter</option>
              <option value="LEGAL">Legal</option>
            </select>
          </div>
          <div>
            <label className="block" htmlFor="page-effects">Effects</label>
            <select 
              id="page-effects" 
              value={pageEffect} 
              onChange={(e) => setPageEffect(e.target.value)}
            >
              {pageEffects.map((effect) => (
                <option key={effect.value} value={effect.value}>
                  {effect.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block" htmlFor="resolution">Resolution</label>
            <select 
              id="resolution" 
              value={resolution} 
              onChange={(e) => setResolution(e.target.value)}
            >
              <option value="0.8">Very Low</option>
              <option value="1">Low</option>
              <option value="2">Normal</option>
              <option value="3">High</option>
              <option value="4">Very High</option>
            </select>
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Spacing Options</legend>

        <div className="category-grid">
          <div className="postfix-input" data-postfix="px">
            <label htmlFor="top-padding">Vertical Position</label>
            <input 
              id="top-padding" 
              min="0" 
              value={topPadding}
              onChange={(e) => setTopPadding(e.target.value)}
              type="number" 
            />
          </div>
          <div className="postfix-input" data-postfix="px">
            <label htmlFor="word-spacing">Word Spacing</label>
            <input
              id="word-spacing"
              min="0"
              max="100"
              value={wordSpacing}
              onChange={(e) => setWordSpacing(e.target.value)}
              type="number"
            />
          </div>
          <div className="postfix-input" data-postfix="pt">
            <label htmlFor="letter-spacing">Letter Spacing</label>
            <input
              id="letter-spacing"
              min="-5"
              max="40"
              value={letterSpacing}
              onChange={(e) => setLetterSpacing(e.target.value)}
              type="number"
            />
          </div>
        </div>
      </fieldset>

      <fieldset>
        <legend>Margin & Line Options</legend>

        <div className="category-grid">
          <div>
            <label htmlFor="paper-margin-toggle">
              Paper Margin:
              <span aria-label="paper margin status" className="status">
                {hasMargins ? 'on' : 'off'}
              </span>
            </label>
            <label className="switch-toggle outer">
              <input
                aria-checked={hasMargins}
                checked={hasMargins}
                onChange={(e) => setHasMargins(e.target.checked)}
                aria-label="Paper Margin Button"
                id="paper-margin-toggle"
                type="checkbox"
              />
              <div></div>
            </label>
          </div>

          <div>
            <label htmlFor="paper-line-toggle">
              Paper Lines:
              <span aria-label="paper line status" className="status">
                {hasLines ? 'on' : 'off'}
              </span>
            </label>
            <label className="switch-toggle outer">
              <input
                aria-checked={hasLines}
                checked={hasLines}
                onChange={(e) => setHasLines(e.target.checked)}
                aria-label="Paper Line Button"
                id="paper-line-toggle"
                type="checkbox"
              />
              <div></div>
            </label>
          </div>
          <div className="experimental">
            <div className="upload-paper-container">
              <label className="block" htmlFor="paper-file">
                Upload Paper Image as Background
              </label>
              <input
                accept=".jpg, .jpeg, .png"
                type="file"
                id="paper-file"
                onChange={handlePaperFileChange}
              />
            </div>
          </div>
        </div>
      </fieldset>

      <hr
        style={{
          border: '0.3px solid var(--elevation-background)',
          width: '80%',
        }}
      />

      <div style={{ padding: '5px 0px 5px 0px' }}>
        <button
          type="button"
          className="generate-image-button"
          onClick={generateImages}
        >
          Generate Image
        </button>
      </div>
    </div>
  );
};

export default CustomizationForm;