'use client';

import React, { useState, useRef, useEffect } from 'react';
import EnhancedPaper from '../components/EnhancedPaper';
import CustomizationForm from '../components/CustomizationForm';
import DrawingCanvas from '../components/DrawingCanvas';
import LoadingSpinner from '../components/LoadingSpinner';
import FontUploader from '../components/FontUploader';
import { generateImages, downloadAsPDF, deleteAllImages } from '../utils/generate';
import { sanitizeRichTextContent } from '../utils/sanitize';
import { PaperSizes } from '../types';
import 'katex/dist/katex.min.css';
import { Descendant } from 'slate';
import RichTextEditor from '../components/RichTextEditor';
import { slateValueToHtml, htmlToSlateValue } from '../utils/slate-serializer';

const PAPER_SIZES: PaperSizes = {
  A4: { width: 210, height: 297 },
  A5: { width: 148, height: 210 },
  LETTER: { width: 216, height: 279 },
  LEGAL: { width: 216, height: 356 },
};

const HANDWRITING_FONTS = [
  { 
    value: "'Homemade Apple', cursive", 
    label: "Homemade Apple",
    style: { fontFamily: 'Homemade Apple' }
  },
  { 
    value: "Hindi_Font", 
    label: "Kruti-dev(Hindi)" 
  },
  { 
    value: "'Caveat', cursive", 
    label: "Caveat",
    style: { fontFamily: 'Caveat', fontSize: '13pt' } 
  },
  { 
    value: "'Liu Jian Mao Cao', cursive", 
    label: "Liu Jian Mao Cao",
    style: { fontFamily: 'Liu Jian Mao Cao', fontSize: '13pt' } 
  }
];

const PAGE_EFFECTS = [
  { value: "shadows", label: "Shadows" },
  { value: "scanner", label: "Scanner" },
  { value: "no-effect", label: "No Effect" }
];

// Paper texture URLs
const PAPER_TEXTURES = [
  { value: "", label: "None" },
  { value: "/paper-textures/basic.jpg", label: "Basic Paper" },
  { value: "/paper-textures/recycled.jpg", label: "Recycled Paper" },
  { value: "/paper-textures/notebook.jpg", label: "Notebook Paper" }
];

export default function Home() {
  // Paper Content State
  const [text, setText] = useState<string>('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut rhoncus dui eget tortor feugiat iaculis. Morbi et dolor in felis viverra efficitur. Integer id laoreet arcu. Mauris turpis nibh, scelerisque sed tristique non, hendrerit in erat. Duis interdum nisl risus, ac ultrices ipsum auctor at.');
  
  // External Text Areas
  const [showExternalText, setShowExternalText] = useState<boolean>(false);
  const [sideText, setSideText] = useState<string>('Side notes can be added here');
  const [topText, setTopText] = useState<string>('Top notes can be added here');
  
  // Paper Styling State
  const [inkColor, setInkColor] = useState<string>('#000f55');
  const [paperColor] = useState<string>('#ffffff');
  const [fontSize, setFontSize] = useState<string>('10');
  const [letterSpacing, setLetterSpacing] = useState<string>('0');
  const [wordSpacing, setWordSpacing] = useState<string>('0');
  const [lineHeight] = useState<string>('1.5');
  const [topPadding, setTopPadding] = useState<string>('5');
  const [fontFamily, setFontFamily] = useState<string>("'Homemade Apple', cursive");
  
  // UI State
  const [isDark, setIsDark] = useState<boolean>(false);
  const [hasLines, setHasLines] = useState<boolean>(true);
  const [hasMargins, setHasMargins] = useState<boolean>(true);
  const [drawingCanvasVisible, setDrawingCanvasVisible] = useState<boolean>(false);
  
  const [isGenerating, setIsGenerating] = useState<boolean>(false);
  const [pageEffect, setPageEffect] = useState<string>('shadows');
  const [resolution, setResolution] = useState<string>('2');
  const [paperSize, setPaperSize] = useState<string>('A4');
  
  // New features state
  const [randomizeHandwriting, setRandomizeHandwriting] = useState<boolean>(true);
  const [realisticEffects, setRealisticEffects] = useState<boolean>(true);
  const [selectedPaperTexture, setSelectedPaperTexture] = useState<string>("");
  const [customPaperTexture, setCustomPaperTexture] = useState<string | null>(null);
  
  // Refs
  const paperRef = useRef<HTMLDivElement>(null);
  const sideTextRef = useRef<HTMLDivElement>(null);
  const topTextRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDark(prefersDark);
    document.documentElement.classList.toggle('dark', prefersDark);
    document.documentElement.classList.toggle('light', !prefersDark);
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
    document.documentElement.classList.toggle('light', !isDark);
  }, [isDark]);

  useEffect(() => {
    if (paperRef.current) {
      const size = PAPER_SIZES[paperSize as keyof typeof PAPER_SIZES] || PAPER_SIZES.A4;
      const aspectRatio = size.height / size.width;
      
      const width = 400; 
      const height = width * aspectRatio;
      
      paperRef.current.style.width = `${width}px`;
      paperRef.current.style.height = `${height}px`;
    }
  }, [paperSize, paperRef]);

  const handlePaperTextureUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target?.result) return;
      setCustomPaperTexture(e.target.result as string);
      setSelectedPaperTexture('custom');
    };
    reader.readAsDataURL(file);
  };

  const getPaperTextureUrl = (): string | undefined => {
    if (selectedPaperTexture === 'custom' && customPaperTexture) {
      return customPaperTexture;
    } else if (selectedPaperTexture) {
      return selectedPaperTexture;
    }
    return undefined;
  };

  const handleToggleExternalText = () => {
    setShowExternalText(prev => !prev);
  };

  const handleGenerateImages = async () => {
    const paperEl = paperRef.current;
    const outputContainer = document.getElementById('output');
    if (!paperEl || !outputContainer) return;
    
    const paperContentEl = paperEl.querySelector('.paper-content') as HTMLElement;
    if (!paperContentEl) return;
    
    setIsGenerating(true);
    
    try {
      await generateImages(
        paperEl,
        paperContentEl,
        parseFloat(resolution),
        pageEffect,
        outputContainer,
        fontFamily,
        `${fontSize}pt`,
        lineHeight,
        `${letterSpacing}px`,
        `${wordSpacing}px`,
        paperColor,
        inkColor
      );
    } catch (error) {
      console.error('Error generating images:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDeleteAll = () => {
    const outputContainer = document.getElementById('output');
    if (!outputContainer) return;
    
    deleteAllImages(outputContainer);
  };

  const handleDownloadPDF = () => {
    const size = PAPER_SIZES[paperSize as keyof typeof PAPER_SIZES] || PAPER_SIZES.A4;
    downloadAsPDF(size);
  };

  const handleAddToPaper = (dataUrl: string) => {
    const imgTag = `<img src="${dataUrl}" style="max-width: 100%;" />`;
    setText(prev => prev + imgTag);
    setDrawingCanvasVisible(false);
  };

  const handleContentChange = (newHtml: string) => {
    setText(sanitizeRichTextContent(newHtml, true));
  };

  const handleFontSizeChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (numValue > 30) {
      alert('Font-size is too big, try up to 30');
      return;
    }
    setFontSize(value);
  };

  const handleLetterSpacingChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (numValue > 40) {
      alert('Letter-spacing is too big, try up to 40');
      return;
    }
    setLetterSpacing(value);
  };

  const handleWordSpacingChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (numValue > 100) {
      alert('Word-spacing is too big, try up to 100');
      return;
    }
    setWordSpacing(value);
  };

  const handleTopPaddingChange = (value: string) => {
    setTopPadding(value);
  };

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  return (
    <main>
      <h1>Convert Text to Handwriting</h1>
      
      {isGenerating && <LoadingSpinner />}

      <section className="generate-image-section">
        <div className="display-flex responsive-flex">
          <div className="customization-col">
            <CustomizationForm 
              fontFamily={fontFamily}
              setFontFamily={setFontFamily}
              fontSize={fontSize}
              setFontSize={handleFontSizeChange}
              letterSpacing={letterSpacing}
              setLetterSpacing={handleLetterSpacingChange}
              wordSpacing={wordSpacing}
              setWordSpacing={handleWordSpacingChange}
              topPadding={topPadding}
              setTopPadding={handleTopPaddingChange}
              inkColor={inkColor}
              setInkColor={setInkColor}
              generateImages={handleGenerateImages}
              hasLines={hasLines}
              setHasLines={setHasLines}
              hasMargins={hasMargins}
              setHasMargins={setHasMargins}
              pageEffect={pageEffect}
              setPageEffect={setPageEffect}
              resolution={resolution}
              setResolution={setResolution}
              paperSize={paperSize}
              setPaperSize={setPaperSize}
              handwritingFonts={HANDWRITING_FONTS}
              pageEffects={PAGE_EFFECTS}
            />
            
            {/* External Text Toggle Button */}
            <div className="external-text-toggle" style={{marginTop: '20px'}}>
              <button 
                onClick={handleToggleExternalText}
                className={showExternalText ? 'imp-button' : 'generate-image-button'}
              >
                {showExternalText ? 'Hide Side & Top Notes' : 'Show Side & Top Notes'}
              </button>
            </div>
            
            {/* External Text Editors */}
            {showExternalText && (
              <div className="external-text-container" style={{marginTop: '20px'}}>
                <fieldset>
                  <legend>Notes Configuration</legend>
                  <p>Add content to the side and top margins. These will appear in the margins when you have margins enabled.</p>
                  <div className="side-text-area">
                    <label className="block">Side Notes:</label>
                    <div ref={sideTextRef} style={{minHeight: '100px', border: '1px solid #ccc', padding: '8px'}}>
                      <RichTextEditor
                        value={htmlToSlateValue(sideText)}
                        onChange={(newValue) => {
                          const html = slateValueToHtml(newValue);
                          setSideText(html);
                        }}
                        inkColor={inkColor}
                        fontFamily={fontFamily}
                        fontSize={fontSize}
                        letterSpacing={letterSpacing}
                        wordSpacing={wordSpacing}
                        className="side-note-preview"
                      />
                    </div>
                  </div>
                  <div className="top-text-area" style={{marginTop: '15px'}}>
                    <label className="block">Top Notes:</label>
                    <div ref={topTextRef} style={{minHeight: '100px', border: '1px solid #ccc', padding: '8px'}}>
                      <RichTextEditor
                        value={htmlToSlateValue(topText)}
                        onChange={(newValue) => {
                          const html = slateValueToHtml(newValue);
                          setTopText(html);
                        }}
                        inkColor={inkColor}
                        fontFamily={fontFamily}
                        fontSize={fontSize}
                        letterSpacing={letterSpacing}
                        wordSpacing={wordSpacing}
                        className="top-note-preview"
                      />
                    </div>
                  </div>
                </fieldset>
              </div>
            )}
            
            <div className="output-container">
              <div id="output" className="output">
                <div className="output-image-controls" style={{display: 'none'}}>
                  <button id="delete-all-button" onClick={handleDeleteAll}>Delete All</button>
                  <button id="download-as-pdf-button" onClick={handleDownloadPDF}>Download as PDF</button>
                </div>
              </div>
            </div>

            {/* Font upload component */}
            <FontUploader onFontLoaded={(fontName) => setFontFamily(fontName)} />
          </div>
          
          <div className="page-container">
            <div className="page-container-super shadow">
              <EnhancedPaper
                paperRef={paperRef}
                initialValue={text}
                onContentChange={handleContentChange}
                sideText={sideText}
                onSideTextChange={setSideText}
                topText={topText}
                onTopTextChange={setTopText}
                inkColor={inkColor}
                paperColor={paperColor}
                shadowColor="#0005"
                hasLines={hasLines}
                hasMargins={hasMargins}
                pageEffect={pageEffect}
                fontFamily={fontFamily}
                fontSize={`${fontSize}pt`}
                letterSpacing={`${letterSpacing}px`}
                wordSpacing={`${wordSpacing}px`}
                topPadding={`${topPadding}px`}
                randomizeHandwriting={randomizeHandwriting}
                realisticInkEffects={realisticEffects}
                paperTextureUrl={getPaperTextureUrl()}
              />
            </div>
          </div>
        </div>
      </section>

      {drawingCanvasVisible && (
        <DrawingCanvas 
          onClose={() => setDrawingCanvasVisible(false)} 
          onAddToPaper={handleAddToPaper}
          inkColor={inkColor}
          visible={drawingCanvasVisible}
        />
      )}
      
      <button 
        type="button" 
        className="draw-button" 
        onClick={() => setDrawingCanvasVisible(true)}
      >
        Add Drawing
      </button>

      <button 
        type="button" 
        className="theme-toggle-button" 
        onClick={toggleTheme}
        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
      >
        <span className="fade-in-light" style={{ opacity: isDark ? 0 : 1 }}>☀️</span>
        <span className="fade-in-dark" style={{ opacity: isDark ? 1 : 0 }}>🌙</span>
      </button>
    </main>
  );
}