'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import RichTextEditor from './RichTextEditor';
import { applyPaperTexture, applyInkBleedEffect, applyPaperImperfections } from '../utils/paper-effects';
import { applyInkVariations, applyNonUniformLineEndings, applyWordVariations } from '../utils/handwriting-randomization';
import { DEFAULT_SLATE_VALUE, htmlToSlateValue, slateValueToHtml } from '../utils/slate-serializer';
import 'katex/dist/katex.min.css';

interface EnhancedPaperProps {
  paperRef: React.RefObject<HTMLDivElement | null>;
  initialValue: string;
  onContentChange: (newContent: string) => void;
  sideText: string;
  onSideTextChange: (newContent: string) => void;
  topText: string;
  onTopTextChange: (newContent: string) => void;
  inkColor: string;
  paperColor: string;
  shadowColor: string;
  hasLines: boolean;
  hasMargins: boolean;
  pageEffect: string;
  fontFamily?: string;
  fontSize?: string;
  letterSpacing?: string;
  wordSpacing?: string;
  topPadding?: string;
  randomizeHandwriting?: boolean;
  realisticInkEffects?: boolean;
  paperTextureUrl?: string;
}

const EnhancedPaper: React.FC<EnhancedPaperProps> = ({
  paperRef,
  initialValue,
  onContentChange,
  sideText,
  onSideTextChange,
  topText,
  onTopTextChange,
  inkColor,
  paperColor,
  shadowColor,
  hasLines,
  hasMargins,
  pageEffect,
  fontFamily = "'Homemade Apple', cursive",
  fontSize = '10pt',
  letterSpacing = '0px',
  wordSpacing = '0px',
  topPadding = '5px',
  randomizeHandwriting = false,
  realisticInkEffects = false,
  paperTextureUrl
}) => {
  const contentRef = useRef<HTMLDivElement>(null);
  const sideNoteRef = useRef<HTMLDivElement>(null);
  const topNoteRef = useRef<HTMLDivElement>(null);
  const [mainContent, setMainContent] = useState<Descendant[]>(DEFAULT_SLATE_VALUE);
  const [sideContent, setSideContent] = useState<Descendant[]>(DEFAULT_SLATE_VALUE);
  const [topContent, setTopContent] = useState<Descendant[]>(DEFAULT_SLATE_VALUE);
  const [editor] = useState(() => withHistory(withReact(createEditor())));

  useEffect(() => {
    setMainContent(htmlToSlateValue(initialValue));
  }, [initialValue]);

  useEffect(() => {
    setSideContent(htmlToSlateValue(sideText));
  }, [sideText]);
  
  useEffect(() => {
    setTopContent(htmlToSlateValue(topText));
  }, [topText]);

  useEffect(() => {
    if (paperRef.current) {
      const paperContent = paperRef.current.querySelector('.paper-content') as HTMLElement;
      if (paperContent) {
        paperContent.style.setProperty('--ink-color', inkColor);
        paperContent.style.color = inkColor;
        paperContent.style.fontFamily = fontFamily;
        paperContent.style.fontSize = fontSize;
        paperContent.style.letterSpacing = letterSpacing;
        paperContent.style.wordSpacing = wordSpacing;
        paperContent.style.paddingTop = topPadding || '0';
        paperContent.style.position = 'relative';
        paperContent.style.display = 'block';
        const editorElement = paperContent.querySelector('.rich-text-editor') as HTMLElement;
        if (editorElement) {
          editorElement.style.border = 'none';
          editorElement.style.boxShadow = 'none';
          const toolbarElement = editorElement.querySelector('.editor-toolbar') as HTMLElement;
          if (toolbarElement) {
            toolbarElement.style.display = 'none';
            toolbarElement.style.printColorAdjust = 'exact';
          }
        }
      }

      // Apply same styles to top and side margin areas
      const leftMargin = paperRef.current.querySelector('.left-margin') as HTMLElement;
      if (leftMargin) {
        leftMargin.style.color = inkColor;
        leftMargin.style.fontFamily = fontFamily;
        leftMargin.style.fontSize = fontSize;
        leftMargin.style.letterSpacing = letterSpacing;
        leftMargin.style.wordSpacing = wordSpacing;
        // Use a more subtle border color for margins
        leftMargin.style.borderRight = '1.5px solid #c1879c';
      }
      
      const topMargin = paperRef.current.querySelector('.top-margin') as HTMLElement;
      if (topMargin) {
        topMargin.style.color = inkColor;
        topMargin.style.fontFamily = fontFamily;
        topMargin.style.fontSize = fontSize;
        topMargin.style.letterSpacing = letterSpacing;
        topMargin.style.wordSpacing = wordSpacing;
        // Use a more subtle border color for margins
        topMargin.style.borderBottom = '1.5px solid #c1879c';
      }
      
      // Apply background color to the entire paper
      paperRef.current.style.backgroundColor = paperColor;
      
      // Apply effects based on pageEffect setting
      const overlayEl = paperRef.current.querySelector('.overlay') as HTMLElement;
      if (overlayEl) {
        overlayEl.style.background = '';
        overlayEl.classList.remove('shadows', 'scanner');
        
        if (pageEffect === 'shadows') {
          paperRef.current.style.boxShadow = `12px 12px 24px 0 ${shadowColor}`;
          overlayEl.classList.add('shadows');
        } else if (pageEffect === 'scanner') {
          paperRef.current.style.boxShadow = 'none';
          overlayEl.classList.add('scanner');
          
          // Reset background colors to ensure scanner effect is visible
          if (paperContent) {
            paperContent.style.backgroundColor = 'transparent';
          }
          if (topMargin) {
            topMargin.style.backgroundColor = 'transparent';
          }
          if (leftMargin) {
            leftMargin.style.backgroundColor = 'transparent';
          }
        } else {
          paperRef.current.style.boxShadow = 'none';
        }
      }
    }
  }, [inkColor, paperColor, shadowColor, fontFamily, fontSize, letterSpacing, wordSpacing, topPadding, pageEffect, paperRef]);

  useEffect(() => {
    if (!paperRef.current) return;
    
    // Apply effects to the entire paper as a whole first
    if (paperTextureUrl) {
      applyPaperTexture(paperRef.current, paperTextureUrl);
    }
    
    if (realisticInkEffects) {
      // Apply paper imperfections to the entire paper
      applyPaperImperfections(paperRef.current);
    }
    
    // Get all content areas
    const contentEl = contentRef.current;
    const sideNoteEl = sideNoteRef.current;
    const topNoteEl = topNoteRef.current;
    
    // Apply effects to each content area
    if (realisticInkEffects) {
      // Apply ink bleed effect to all text areas
      if (contentEl) {
        applyInkBleedEffect(contentEl, inkColor, 0.2);
      }
      
      if (sideNoteEl) {
        applyInkBleedEffect(sideNoteEl, inkColor, 0.2);
      }
      
      if (topNoteEl) {
        applyInkBleedEffect(topNoteEl, inkColor, 0.2);
      }
    }
    
    if (randomizeHandwriting) {
      // Default intensity - subtle
      const intensity = 0.6;
      
      // Apply handwriting randomization to all text areas
      if (contentEl) {
        applyInkVariations(contentEl, inkColor, intensity);
        applyNonUniformLineEndings(contentEl, 5);
        applyWordVariations(contentEl, intensity);
      }
      
      if (sideNoteEl) {
        applyInkVariations(sideNoteEl, inkColor, intensity);
        applyNonUniformLineEndings(sideNoteEl, 3);
        applyWordVariations(sideNoteEl, intensity);
      }
      
      if (topNoteEl) {
        applyInkVariations(topNoteEl, inkColor, intensity);
        applyNonUniformLineEndings(topNoteEl, 3);
        applyWordVariations(topNoteEl, intensity);
      }
    }
  }, [paperTextureUrl, realisticInkEffects, randomizeHandwriting, inkColor, paperRef]);

  const handleMainContentChange = (newValue: Descendant[]) => {
    setMainContent(newValue);
    try {
      const html = slateValueToHtml(newValue);
      onContentChange(html);
    } catch (error) {
      console.error("Error converting main content to HTML:", error);
    }
  };
  
  const handleSideContentChange = (newValue: Descendant[]) => {
    setSideContent(newValue);
    try {
      const html = slateValueToHtml(newValue);
      onSideTextChange(html);
    } catch (error) {
      console.error("Error converting side content to HTML:", error);
    }
  };

  const handleTopContentChange = (newValue: Descendant[]) => {
    setTopContent(newValue);
    try {
      const html = slateValueToHtml(newValue);
      onTopTextChange(html);
    } catch (error) {
      console.error("Error converting top content to HTML:", error);
    }
  };

  const getPaperClasses = () => {
    let classes = 'page-a enhanced-paper';
    if (hasLines) classes += ' lines';
    if (hasMargins) classes += ' margined';
    return classes;
  };

  return (
    <div ref={paperRef} className={getPaperClasses()} style={{ overflow: 'hidden' }}>
      {hasMargins && <div ref={topNoteRef} className="top-margin" style={{
        width: '100%',
        height: '50px',
        borderBottom: '1.5px solid #c1879c',
        backgroundColor: '#f9f9f9',
        display: 'block',
        padding: '5px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 3,
        textAlign: 'center'
      }}>
        <RichTextEditor
          value={topContent}
          onChange={handleTopContentChange}
          inkColor={inkColor}
          fontFamily={fontFamily}
          fontSize={fontSize}
          letterSpacing={letterSpacing}
          wordSpacing={wordSpacing}
          className="top-note-editor"
        />
      </div>}
      <div className="display-flex left-margin-and-content">
        {hasMargins && (
          <div ref={sideNoteRef} className="left-margin" style={{
            width: '50px',
            borderRight: '1.5px solid #c1879c',
            backgroundColor: hasLines ? 'transparent' : '#f9f9f9',
            position: 'absolute',
            top: 0,
            left: 0,
            bottom: 0,
            padding: '5px',
            paddingTop: '55px',
            overflow: 'auto',
            zIndex: 2,
            boxSizing: 'border-box',
            minHeight: '100%',
            height: '100%'
          }}>
            <RichTextEditor
              value={sideContent}
              onChange={handleSideContentChange}
              inkColor={inkColor}
              fontFamily={fontFamily}
              fontSize={fontSize}
              letterSpacing={letterSpacing}
              wordSpacing={wordSpacing}
              className="side-note-editor"
            />
          </div>
        )}
        <div 
          ref={contentRef} 
          className="paper-content" 
          style={{
            flex: 1,
            marginLeft: hasMargins ? '0' : '0',
            marginTop: hasMargins ? '50px' : '0',
            width: '100%',
            minHeight: '100%',
            height: 'auto',
            maxHeight: '100%',
            boxSizing: 'border-box',
            overflow: 'hidden',
            paddingLeft: hasMargins ? '55px' : '5px'
          }}
        >
          <div className="editor-wrapper" style={{ width: '100%', position: 'relative' }}>
            <RichTextEditor
              value={mainContent}
              onChange={handleMainContentChange}
              inkColor={inkColor}
              fontFamily={fontFamily}
              fontSize={fontSize}
              letterSpacing={letterSpacing}
              wordSpacing={wordSpacing}
            />
          </div>
        </div>
      </div>
      <div className={`overlay ${pageEffect}`} style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        pointerEvents: 'none',
        zIndex: 4
      }}></div>
    </div>
  );
};

export default EnhancedPaper;
