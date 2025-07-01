'use client';

import React, { useEffect, useRef, useState } from 'react';
import { createEditor, Descendant } from 'slate';
import { withHistory } from 'slate-history';
import { withReact } from 'slate-react';
import RichTextEditor from './RichTextEditor';
import { applyPaperTexture, applyInkBleedEffect, applyPaperImperfections } from '../utils/paper-effects';
import { applyInkVariations, applyNonUniformLineEndings } from '../utils/handwriting-randomization';
import { DEFAULT_SLATE_VALUE, htmlToSlateValue, slateValueToHtml } from '../utils/slate-serializer';

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
  const [slateValue, setSlateValue] = useState<Descendant[]>(DEFAULT_SLATE_VALUE);
  const [editor] = useState(() => withHistory(withReact(createEditor())));

  useEffect(() => {
    const converted = htmlToSlateValue(initialValue);
    setSlateValue(converted);
  }, [initialValue]);

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
      paperRef.current.style.backgroundColor = paperColor;
      const overlayEl = paperRef.current.querySelector('.overlay') as HTMLElement;
      if (overlayEl) {
        overlayEl.style.background = '';
        overlayEl.classList.remove('shadows', 'scanner');
        if (pageEffect === 'shadows') {
          paperRef.current.style.boxShadow = `12px 12px 24px 0 ${shadowColor}`;
          overlayEl.classList.add('shadows');
        } else if (pageEffect === 'scanner') {
          paperRef.current.style.boxShadow = 'none';
          overlayEl.classList.add('shadows');
          if (paperContent) {
            paperContent.style.backgroundColor = '#fff8';
          }
        } else {
          paperRef.current.style.boxShadow = 'none';
        }
      }
    }
  }, [inkColor, paperColor, shadowColor, fontFamily, fontSize, letterSpacing, wordSpacing, topPadding, pageEffect, paperRef]);

  useEffect(() => {
    if (!paperRef.current || !contentRef.current) return;
    const contentEl = contentRef.current;
    if (paperTextureUrl) {
      applyPaperTexture(paperRef.current, paperTextureUrl);
    }
    if (realisticInkEffects) {
      applyInkBleedEffect(contentEl, inkColor, 0.2);
      applyPaperImperfections(paperRef.current);
    }
    if (randomizeHandwriting) {
      applyInkVariations(contentEl, inkColor);
      applyNonUniformLineEndings(contentEl);
    }
  }, [paperTextureUrl, realisticInkEffects, randomizeHandwriting, inkColor, paperRef]);

  const handleContentChange = (newValue: Descendant[]) => {
    if (!newValue || !Array.isArray(newValue)) {
      console.warn("Invalid Slate value received:", newValue);
      return;
    }
    setSlateValue(newValue);
    try {
      const html = slateValueToHtml(newValue);
      onContentChange(html);
    } catch (error) {
      console.error("Error converting Slate value to HTML:", error);
    }
  };

  const getPaperClasses = () => {
    let classes = 'page-a enhanced-paper';
    if (hasLines) classes += ' lines';
    if (hasMargins) classes += ' margined';
    return classes;
  };

  return (
    <div ref={paperRef} className={getPaperClasses()}>
      <div className="paper-container" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {hasMargins && (
          <div className="left-margin" style={{
            width: '50px',
            position: 'absolute',
            left: 0,
            top: 0,
            bottom: 0,
            borderRight: '2px solid var(--accent-color)',
            backgroundColor: '#f9f9f9',
            zIndex: 1,
            padding: '5px',
            paddingTop: '55px',
            overflow: 'auto'
          }}>
            <RichTextEditor
              value={htmlToSlateValue(sideText)}
              onChange={(newValue) => {
                const html = slateValueToHtml(newValue);
                onSideTextChange(html);
              }}
              inkColor={inkColor}
              fontFamily={fontFamily}
              fontSize={fontSize}
              letterSpacing={letterSpacing}
              wordSpacing={wordSpacing}
              className="side-note-editor"
            />
          </div>
        )}
        
        {hasMargins && <div className="top-margin" style={{ 
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '50px',
          borderBottom: '2px solid var(--accent-color)',
          backgroundColor: '#f9f9f9',
          zIndex: 2,
          paddingLeft: '55px',
          boxSizing: 'border-box'
        }}>
          <RichTextEditor
            value={htmlToSlateValue(topText)}
            onChange={(newValue) => {
              const html = slateValueToHtml(newValue);
              onTopTextChange(html);
            }}
            inkColor={inkColor}
            fontFamily={fontFamily}
            fontSize={fontSize}
            letterSpacing={letterSpacing}
            wordSpacing={wordSpacing}
            className="top-note-editor"
          />
        </div>}
        
        <div className="paper-content" style={{ 
          position: 'absolute',
          top: hasMargins ? '52px' : '0',
          left: hasMargins ? '52px' : '0',
          width: hasMargins ? 'calc(100% - 52px)' : '100%',
          height: hasMargins ? 'calc(100% - 52px)' : '100%',
          padding: '0',
          boxSizing: 'border-box'
        }}>
          <div ref={contentRef} className="editor-wrapper" style={{ 
            width: '100%', 
            height: '100%',
            position: 'relative',
            padding: '5px'
          }}>
            <RichTextEditor
              value={slateValue}
              onChange={handleContentChange}
              inkColor={inkColor}
              fontFamily={fontFamily}
              fontSize={fontSize}
              letterSpacing={letterSpacing}
              wordSpacing={wordSpacing}
            />
          </div>
        </div>
      </div>
      <div className={`overlay ${pageEffect !== 'no-effect' ? 'shadows' : ''}`}></div>
    </div>
  );
};

export default EnhancedPaper;
