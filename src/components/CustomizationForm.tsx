'use client';

import React, { useState } from 'react';
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
  generateImages: () => void;
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
  sideNotesVisible?: boolean;
  toggleSideNotes?: () => void;
  randomizeHandwriting?: boolean;
  toggleRandomizeHandwriting?: () => void;
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
  generateImages,
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
  pageEffects,
  sideNotesVisible,
  toggleSideNotes,
  randomizeHandwriting = false,
  toggleRandomizeHandwriting
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('handwriting');

  // Predefined ink colors for quick selection
  const inkColorPresets = [
    { color: "#000f55", name: "Blue" },
    { color: "#000000", name: "Black" },
    { color: "#ba3807", name: "Red" },
    { color: "#0b5394", name: "Navy Blue" },
    { color: "#38761d", name: "Green" },
    { color: "#351c75", name: "Purple" },
    { color: "#741b47", name: "Burgundy" }
  ];

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

  const toggleSection = (section: string) => {
    if (expandedSection === section) {
      setExpandedSection(null);
    } else {
      setExpandedSection(section);
    }
  };

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className={`customization-sidebar ${collapsed ? 'collapsed' : ''}`}>
      <button 
        className="sidebar-toggle" 
        onClick={toggleSidebar}
        aria-label={collapsed ? "Expand customization panel" : "Collapse customization panel"}
      >
        {collapsed ? '›' : '‹'}
      </button>
      
      <div className="sidebar-content">
        <div className="sidebar-header">
          <h2>Customizations</h2>
          <button 
            type="button"
            className="generate-image-button"
            onClick={generateImages}
          >
            Generate Image
          </button>
        </div>
        
        <div className="sidebar-accordion">
          <div className={`accordion-item ${expandedSection === 'handwriting' ? 'expanded' : ''}`}>
            <button 
              className="accordion-header" 
              onClick={() => toggleSection('handwriting')}
              aria-expanded={expandedSection === 'handwriting'}
            >
              <span>Handwriting Style</span>
              <span className="accordion-icon">{expandedSection === 'handwriting' ? '▼' : '▶'}</span>
            </button>
            
            {expandedSection === 'handwriting' && (
              <div className="accordion-content">
                <div className="form-group">
                  <label className="block" htmlFor="handwriting-font">
                    Font Style
                  </label>
                  <select 
                    id="handwriting-font"
                    value={fontFamily}
                    onChange={(e) => setFontFamily(e.target.value)}
                    className="full-width"
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
                
                <div className="form-group">
                  <label className="block" htmlFor="font-file">
                    Upload Font <span className="badge">Beta</span>
                  </label>
                  <input 
                    accept=".ttf, .otf" 
                    type="file" 
                    id="font-file"
                    onChange={handleFontFileChange}
                    className="file-input"
                  />
                </div>
                
                <div className="form-group">
                  <div className="flex-between">
                    <label htmlFor="randomize-toggle">
                      Randomize Handwriting
                    </label>
                    <label className="switch-toggle outer">
                      <input
                        aria-checked={randomizeHandwriting}
                        checked={randomizeHandwriting}
                        onChange={toggleRandomizeHandwriting}
                        aria-label="Handwriting Randomization Button"
                        id="randomize-toggle"
                        type="checkbox"
                      />
                      <div></div>
                    </label>
                  </div>
                  <p className="helper-text">
                    Adds subtle variations to letters and spacing
                  </p>
                </div>
              </div>
            )}
          </div>
          
          <div className={`accordion-item ${expandedSection === 'appearance' ? 'expanded' : ''}`}>
            <button 
              className="accordion-header" 
              onClick={() => toggleSection('appearance')}
              aria-expanded={expandedSection === 'appearance'}
            >
              <span>Ink & Appearance</span>
              <span className="accordion-icon">{expandedSection === 'appearance' ? '▼' : '▶'}</span>
            </button>
            
            {expandedSection === 'appearance' && (
              <div className="accordion-content">
                <div className="form-group">
                  <label className="block">Ink Color</label>
                  <div className="color-picker-container">
                    <input 
                      type="color" 
                      value={inkColor}
                      onChange={(e) => setInkColor(e.target.value)}
                      className="color-picker"
                      aria-label="Select ink color"
                    />
                    <input 
                      type="text" 
                      value={inkColor}
                      onChange={(e) => setInkColor(e.target.value)}
                      className="color-text-input"
                      aria-label="Ink color hex value"
                    />
                  </div>
                  <div className="color-presets">
                    {inkColorPresets.map(preset => (
                      <button
                        key={preset.color}
                        type="button"
                        className={`color-preset ${inkColor === preset.color ? 'active' : ''}`}
                        style={{ backgroundColor: preset.color }}
                        onClick={() => setInkColor(preset.color)}
                        title={preset.name}
                        aria-label={`Set ink color to ${preset.name}`}
                      />
                    ))}
                  </div>
                </div>
                
                <div className="form-group">
                  <label htmlFor="font-size">Font Size</label>
                  <div className="input-with-controls">
                    <button 
                      type="button"
                      className="control-button" 
                      onClick={() => setFontSize(Math.max(1, parseFloat(fontSize) - 0.5).toString())}
                      aria-label="Decrease font size"
                    >−</button>
                    <input
                      id="font-size"
                      min="1"
                      step="0.5"
                      value={fontSize}
                      onChange={(e) => setFontSize(e.target.value)}
                      type="number"
                      className="centered-input"
                    />
                    <button 
                      type="button"
                      className="control-button" 
                      onClick={() => setFontSize((parseFloat(fontSize) + 0.5).toString())}
                      aria-label="Increase font size"
                    >+</button>
                    <span className="input-suffix">pt</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className={`accordion-item ${expandedSection === 'page' ? 'expanded' : ''}`}>
            <button 
              className="accordion-header" 
              onClick={() => toggleSection('page')}
              aria-expanded={expandedSection === 'page'}
            >
              <span>Page Settings</span>
              <span className="accordion-icon">{expandedSection === 'page' ? '▼' : '▶'}</span>
            </button>
            
            {expandedSection === 'page' && (
              <div className="accordion-content">
                <div className="form-group">
                  <label className="block" htmlFor="page-size">Page Size</label>
                  <select 
                    id="page-size" 
                    value={paperSize} 
                    onChange={(e) => setPaperSize(e.target.value)}
                    className="full-width"
                  >
                    <option value="A4">A4</option>
                    <option value="A5">A5</option>
                    <option value="LETTER">Letter</option>
                    <option value="LEGAL">Legal</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block" htmlFor="page-effects">Effects</label>
                  <select 
                    id="page-effects" 
                    value={pageEffect} 
                    onChange={(e) => setPageEffect(e.target.value)}
                    className="full-width"
                  >
                    {pageEffects.map((effect) => (
                      <option key={effect.value} value={effect.value}>
                        {effect.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block" htmlFor="resolution">Resolution</label>
                  <select 
                    id="resolution" 
                    value={resolution} 
                    onChange={(e) => setResolution(e.target.value)}
                    className="full-width"
                  >
                    <option value="0.8">Very Low</option>
                    <option value="1">Low</option>
                    <option value="2">Normal</option>
                    <option value="3">High</option>
                    <option value="4">Very High</option>
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="block" htmlFor="paper-file">
                    Custom Paper Background
                  </label>
                  <input
                    accept=".jpg, .jpeg, .png"
                    type="file"
                    id="paper-file"
                    onChange={handlePaperFileChange}
                    className="file-input"
                  />
                </div>
              </div>
            )}
          </div>
          
          <div className={`accordion-item ${expandedSection === 'spacing' ? 'expanded' : ''}`}>
            <button 
              className="accordion-header" 
              onClick={() => toggleSection('spacing')}
              aria-expanded={expandedSection === 'spacing'}
            >
              <span>Spacing & Layout</span>
              <span className="accordion-icon">{expandedSection === 'spacing' ? '▼' : '▶'}</span>
            </button>
            
            {expandedSection === 'spacing' && (
              <div className="accordion-content">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="top-padding">Vertical Position</label>
                    <div className="input-with-controls">
                      <input 
                        id="top-padding" 
                        min="0" 
                        value={topPadding}
                        onChange={(e) => setTopPadding(e.target.value)}
                        type="number" 
                        className="centered-input"
                      />
                      <span className="input-suffix">px</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="word-spacing">Word Spacing</label>
                    <div className="input-with-controls">
                      <input
                        id="word-spacing"
                        min="0"
                        max="100"
                        value={wordSpacing}
                        onChange={(e) => setWordSpacing(e.target.value)}
                        type="number"
                        className="centered-input"
                      />
                      <span className="input-suffix">px</span>
                    </div>
                  </div>
                  <div className="form-group">
                    <label htmlFor="letter-spacing">Letter Spacing</label>
                    <div className="input-with-controls">
                      <input
                        id="letter-spacing"
                        min="-5"
                        max="40"
                        value={letterSpacing}
                        onChange={(e) => setLetterSpacing(e.target.value)}
                        type="number"
                        className="centered-input"
                      />
                      <span className="input-suffix">px</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          <div className={`accordion-item ${expandedSection === 'notes' ? 'expanded' : ''}`}>
            <button 
              className="accordion-header" 
              onClick={() => toggleSection('notes')}
              aria-expanded={expandedSection === 'notes'}
            >
              <span>Notes & Margins</span>
              <span className="accordion-icon">{expandedSection === 'notes' ? '▼' : '▶'}</span>
            </button>
            
            {expandedSection === 'notes' && (
              <div className="accordion-content">
                <div className="form-group">
                  <div className="flex-between">
                    <label htmlFor="paper-margin-toggle">
                      Paper Margins
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
                </div>

                <div className="form-group">
                  <div className="flex-between">
                    <label htmlFor="side-notes-toggle">
                      Show Side & Top Notes
                    </label>
                    <label className="switch-toggle outer">
                      <input
                        disabled={!hasMargins}
                        aria-checked={sideNotesVisible}
                        checked={sideNotesVisible}
                        onChange={toggleSideNotes}
                        aria-label="Side Notes Toggle Button"
                        id="side-notes-toggle"
                        type="checkbox"
                      />
                      <div></div>
                    </label>
                  </div>
                  {!hasMargins && (
                    <p className="helper-text alert">
                      Enable margins to use notes
                    </p>
                  )}
                </div>

                <div className="form-group">
                  <div className="flex-between">
                    <label htmlFor="paper-line-toggle">
                      Paper Lines
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
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomizationForm;