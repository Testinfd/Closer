'use client';

import React, { useState, useRef, useEffect } from 'react';
import Paper from '../components/Paper';
import CustomizationForm from '../components/CustomizationForm';
import DrawingCanvas from '../components/DrawingCanvas';
import LoadingSpinner from '../components/LoadingSpinner';
import { generateImages, downloadAsPDF, deleteAllImages } from '../utils/generate';
import { PaperSizes } from '../types';

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

export default function Home() {
  // Paper Content State
  const [text, setText] = useState<string>('Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut rhoncus dui eget tortor feugiat iaculis. Morbi et dolor in felis viverra efficitur. Integer id laoreet arcu. Mauris turpis nibh, scelerisque sed tristique non, hendrerit in erat. Duis interdum nisl risus, ac ultrices ipsum auctor at.');
  
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
  const [resolution, setResolution] = useState<number>(2);
  const [paperSize, setPaperSize] = useState<string>('A4');
  
  // Refs
  const paperRef = useRef<HTMLDivElement>(null);
  

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
        resolution,
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
    const paperContentEl = paperRef.current?.querySelector('.paper-content');
    if (paperContentEl) {
      const img = document.createElement('img');
      img.src = dataUrl;
      img.style.width = '100%';
      paperContentEl.prepend(img);
    }
    setDrawingCanvasVisible(false);
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
      alert('Letter Spacing is too big, try a number up to 40');
      return;
    }
    setLetterSpacing(value);
  };

  const handleWordSpacingChange = (value: string) => {
    const numValue = parseInt(value, 10);
    if (numValue > 100) {
      alert('Word Spacing is too big, try a number up to hundred');
      return;
    }
    setWordSpacing(value);
  };

  const handleTopPaddingChange = (value: string) => {
    setTopPadding(value);
  };

  return (
    <main>
      <h1>Text to Handwriting</h1>
      <section className="generate-image-section">
        <br /><br />
        <form id="generate-image-form" onSubmit={(e) => { e.preventDefault(); handleGenerateImages(); }}>
          <div className="display-flex output-grid responsive-flex">
            <div className="flex-1 page-container-super">
              <div>
                <h2 style={{ marginTop: '0px' }}>Input</h2>
                <label className="block" htmlFor="note">Type/Paste text here</label>
              </div>

              <div className="flex-1 page-container">
                <Paper
                  ref={paperRef}
                  html={text}
                  onContentChange={setText}
                  inkColor={inkColor}
                  paperColor={paperColor}
                  shadowColor={isDark ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.2)'}
                  hasLines={hasLines}
                  hasMargins={hasMargins}
                  pageEffect={pageEffect}
                  fontFamily={fontFamily}
                  fontSize={`${fontSize}pt`}
                  letterSpacing={`${letterSpacing}px`}
                  wordSpacing={`${wordSpacing}px`}
                  topPadding={`${topPadding}px`}
                />
                <br />
              </div>

              <div>
                <button
                  id="draw-diagram-button"
                  type="button"
                  style={{ fontSize: '0.9rem', marginTop: '5px' }}
                  className="draw-button"
                  onClick={() => setDrawingCanvasVisible(true)}
                >
                  Draw <small>(Beta)</small>
                </button>
              </div>
            </div>

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
              resolution={resolution.toString()}
              setResolution={(res) => setResolution(parseInt(res, 10))}
              paperSize={paperSize}
              setPaperSize={setPaperSize}
              handwritingFonts={HANDWRITING_FONTS}
              pageEffects={PAGE_EFFECTS}
            />
          </div>
        </form>
      </section>

      <section>
        <h2 id="output-header">Output</h2>
        <div id="output" className="output" style={{ textAlign: 'center' }}>
          Click &quot;Generate Image&quot; Button to generate new image.
        </div>
        <div style={{ textAlign: 'center', padding: '30px' }}>
          <button className="imp-button" id="download-as-pdf-button" onClick={handleDownloadPDF}>
            Download All Images as PDF
          </button>
          <button className="delete-button" id="delete-all-button" onClick={handleDeleteAll}>
            Clear all images
          </button>
        </div>
      </section>

      <DrawingCanvas
        inkColor={inkColor}
        visible={drawingCanvasVisible}
        onClose={() => setDrawingCanvasVisible(false)}
        onAddToPaper={handleAddToPaper}
      />
      
      {isGenerating && <LoadingSpinner message="Generating handwritten text..." />}
      
    </main>
  );
}