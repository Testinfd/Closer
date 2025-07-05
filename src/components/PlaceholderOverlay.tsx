'use client';

import React, { useState, useEffect } from 'react';
import { InlineMath, BlockMath } from 'react-katex';
import 'katex/dist/katex.min.css';
import { createRoot } from 'react-dom/client';

interface PlaceholderOverlayProps {
  exampleText: string;
  isActive: boolean;
  onDismiss: () => void;
  type?: 'main' | 'side' | 'top';
}

/**
 * A component that displays placeholder example text as an overlay
 * and disappears when clicked or when the associated editor is focused
 */
const PlaceholderOverlay: React.FC<PlaceholderOverlayProps> = ({
  exampleText,
  isActive,
  onDismiss,
  type = 'main'
}) => {
  const [visible, setVisible] = useState(isActive);

  useEffect(() => {
    setVisible(isActive);
  }, [isActive]);

  const handleClick = () => {
    setVisible(false);
    onDismiss();
  };

  // This useEffect (Hook 3) must be called before any early returns.
  // Its internal logic can depend on `visible`.
  useEffect(() => {
    if (visible) {
      // The DOM query document.querySelectorAll('.katex-formula') is global.
      // This could be problematic if other parts of the app use this class.
      // Ideally, this should be scoped to the component's rendered output using a ref.
      // However, for fixing the hook order, this internal logic remains for now.
      const formulaElements = document.querySelectorAll('.katex-formula');
      formulaElements.forEach(el => {
        // Ensure the element is within this component instance if possible, though difficult with global query
        const formula = el.getAttribute('data-formula');
        const isBlock = el.getAttribute('data-block') === 'true';
        
        if (formula) {
          try {
            if (isBlock) {
              const mathElement = document.createElement('div');
              const root = createRoot(mathElement);
              root.render(<BlockMath math={formula} />);
              el.parentNode?.replaceChild(mathElement, el);
            } else {
              const mathElement = document.createElement('span');
              const root = createRoot(mathElement);
              root.render(<InlineMath math={formula} />);
              el.parentNode?.replaceChild(mathElement, el);
            }
          } catch (error) {
            console.error('Error rendering LaTeX:', error);
          }
        }
      });
    }
  }, [visible, exampleText]);

  if (!visible) return null; // Early return is now after all hooks

  // Process the exampleText to properly render LaTeX formulas
  // This needs to be defined before being used in dangerouslySetInnerHTML
  const processedHtml = exampleText.replace(
    /\$\$(.*?)\$\$|\$(.*?)\$/g,
    (match, blockMath, inlineMath) => {
      const formula = blockMath || inlineMath;
      const isBlock = !!blockMath;

      return `<span class="katex-formula" data-formula="${formula}" data-block="${isBlock}"></span>`;
    }
  );

  return (
    <div 
      className={`placeholder-overlay ${type}-overlay`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Example text. Click to dismiss."
    >
      <div className="overlay-content">
        <div className="overlay-text" dangerouslySetInnerHTML={{ __html: processedHtml }} />
        <div className="overlay-instruction">
          <span>Click to dismiss example</span>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderOverlay; 