'use client';

import React, { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';

interface PaperProps {
  html: string;
  onContentChange: (newHtml: string) => void;
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
}

const Paper = forwardRef<HTMLDivElement, PaperProps>(({
  html,
  onContentChange,
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
  topPadding = '5px'
}, ref) => {
  const paperRef = useRef<HTMLDivElement>(null);
  const contentEditableRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => paperRef.current as HTMLDivElement);

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
        paperContent.style.paddingTop = topPadding;
      }
      
      paperRef.current.style.backgroundColor = paperColor;
      
      const overlayEl = paperRef.current.querySelector('.overlay') as HTMLElement;
      
      // Reset overlay styles
      if (overlayEl) {
        overlayEl.style.background = '';
        overlayEl.classList.remove('shadows', 'scanner');
        
        // Apply effect
        if (pageEffect === 'shadows') {
          paperRef.current.style.boxShadow = `12px 12px 24px 0 ${shadowColor}`;
          overlayEl.classList.add('shadows');
        } else if (pageEffect === 'scanner') {
          paperRef.current.style.boxShadow = 'none';
          overlayEl.classList.add('shadows'); // Use shadows class to show overlay
          if (paperContent) {
            paperContent.style.backgroundColor = '#fff8';
          }
        } else {
          paperRef.current.style.boxShadow = 'none';
        }
      }
    }
  }, [inkColor, paperColor, shadowColor, fontFamily, fontSize, letterSpacing, wordSpacing, topPadding, pageEffect]);

  useEffect(() => {
    if (contentEditableRef.current && html !== contentEditableRef.current.innerHTML) {
      contentEditableRef.current.innerHTML = html;
    }
  }, [html]);

  const getPaperClasses = () => {
    let classes = 'page-a';
    if (hasLines) classes += ' lines';
    if (hasMargins) classes += ' margined';
    return classes;
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain').replace(/\n/g, '<br/>');
    document.execCommand('insertHTML', false, text);
  };

  return (
    <div ref={paperRef} className={getPaperClasses()}>
      {hasMargins && <div contentEditable suppressHydrationWarning className="top-margin"></div>}
      <div className="display-flex left-margin-and-content">
        {hasMargins && <div contentEditable suppressHydrationWarning className="left-margin"></div>}
        <div 
          ref={contentEditableRef}
          className="paper-content" 
          contentEditable
          suppressHydrationWarning
          onPaste={handlePaste}
          onInput={(e) => onContentChange(e.currentTarget.innerHTML)}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </div>
      <div className={`overlay ${pageEffect !== 'no-effect' ? 'shadows' : ''}`}></div>
    </div>
  );
});

Paper.displayName = 'Paper';

export default Paper;
