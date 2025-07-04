'use client';

import React, { useState, useEffect } from 'react';

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

  if (!visible) return null;

  return (
    <div 
      className={`placeholder-overlay ${type}-overlay`}
      onClick={handleClick}
      role="button"
      tabIndex={0}
      aria-label="Example text. Click to dismiss."
    >
      <div className="overlay-content">
        <div className="overlay-text" dangerouslySetInnerHTML={{ __html: exampleText }} />
        <div className="overlay-instruction">
          <span>Click to dismiss example</span>
        </div>
      </div>
    </div>
  );
};

export default PlaceholderOverlay; 