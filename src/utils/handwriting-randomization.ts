/**
 * Utility functions for randomizing handwriting appearance
 */

/**
 * Generate a random vertical offset within a specified range
 * @param baselineJitterAmount Maximum amount of jitter in pixels
 */
export function getRandomBaselineJitter(baselineJitterAmount: number = 2): number {
  return (Math.random() - 0.5) * baselineJitterAmount;
}

/**
 * Generate a random letter spacing value to simulate natural handwriting
 * @param baseSpacing The base letter spacing value in pixels
 * @param variationAmount Maximum variation amount in pixels
 */
export function getRandomLetterSpacing(baseSpacing: number, variationAmount: number = 1): number {
  return baseSpacing + (Math.random() - 0.5) * variationAmount;
}

/**
 * Generate a random word spacing value to simulate natural handwriting
 * @param baseSpacing The base word spacing value in pixels
 * @param variationAmount Maximum variation amount in pixels
 */
export function getRandomWordSpacing(baseSpacing: number, variationAmount: number = 2): number {
  return baseSpacing + (Math.random() - 0.5) * variationAmount;
}

/**
 * Creates a style object with random variations for text
 * @param options Base style options
 */
export function createRandomizedTextStyle(options: {
  fontSize: number;
  letterSpacing: number;
  wordSpacing: number;
  baselineJitter: number;
}) {
  const { fontSize, letterSpacing, wordSpacing, baselineJitter } = options;
  
  return {
    transform: `translateY(${getRandomBaselineJitter(baselineJitter)}px)`,
    letterSpacing: `${getRandomLetterSpacing(letterSpacing)}px`,
    wordSpacing: `${getRandomWordSpacing(wordSpacing)}px`,
  };
}

/**
 * Randomly select one font variant from multiple options
 * @param fontVariants Array of font family names
 */
export function getRandomFontVariant(fontVariants: string[]): string {
  if (!fontVariants.length) return '';
  const randomIndex = Math.floor(Math.random() * fontVariants.length);
  return fontVariants[randomIndex];
}

/**
 * Creates a randomized character component with variations for letter appearance
 * @param char Character to display
 * @param inkColor Color for the text
 * @param fontFamily Font family to use 
 * @param fontSize Font size in points
 */
export function createRandomizedCharacter(
  char: string,
  inkColor: string,
  fontFamily: string,
  fontSize: number
): React.CSSProperties {
  // Skip spaces and specific characters
  if (char === ' ' || char === '\n' || char === '\t') {
    return {};
  }
  
  // Random rotation between -2 and 2 degrees
  const rotation = (Math.random() - 0.5) * 4;
  
  // Random scale between 0.95 and 1.05
  const scale = 0.95 + Math.random() * 0.1;
  
  // Slight random baseline shift
  const baselineShift = (Math.random() - 0.5) * 2;
  
  // Random ink opacity variation for natural ink flow
  const opacity = 0.85 + Math.random() * 0.15;
  
  return {
    display: 'inline-block',
    transform: `rotate(${rotation}deg) scale(${scale}) translateY(${baselineShift}px)`,
    color: inkColor,
    opacity,
    fontFamily,
    fontSize: `${fontSize}pt`,
  };
}

/**
 * Applies ink variations to simulate natural handwriting pressure
 * @param element HTML element to apply the effect to
 * @param inkColor Base ink color
 */
export function applyInkVariations(element: HTMLElement, inkColor: string): void {
  // Convert hex to RGB for manipulation
  const r = parseInt(inkColor.slice(1, 3), 16);
  const g = parseInt(inkColor.slice(3, 5), 16);
  const b = parseInt(inkColor.slice(5, 7), 16);
  
  // Apply to all text nodes
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  
  while ((node = walker.nextNode() as Text | null)) {
    if (!node.textContent?.trim()) continue;
    
    // Split text into individual characters
    const fragment = document.createDocumentFragment();
    const text = node.textContent || '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement('span');
      span.textContent = char;
      
      // Random ink density
      const density = 0.7 + Math.random() * 0.3;
      const darkR = Math.floor(r * density);
      const darkG = Math.floor(g * density);
      const darkB = Math.floor(b * density);
      
      // Apply varying styles
      span.style.color = `rgb(${darkR}, ${darkG}, ${darkB})`;
      
      // Random thickness
      const thickness = 1 + Math.random() * 0.2;
      span.style.fontWeight = (400 * thickness).toString();
      
      fragment.appendChild(span);
    }
    
    // Replace node with our fragment
    if (node.parentNode) {
      node.parentNode.replaceChild(fragment, node);
    }
  }
}

/**
 * Applies non-uniform line endings to paragraph elements
 * @param element Container element with paragraph children
 * @param maxVariation Maximum variation in line end position (percentage)
 */
export function applyNonUniformLineEndings(element: HTMLElement, maxVariation: number = 5): void {
  const paragraphs = element.querySelectorAll('p');
  
  paragraphs.forEach((p) => {
    // Random width percentage between 100-maxVariation and 100
    const widthPercentage = 100 - Math.random() * maxVariation;
    p.style.width = `${widthPercentage}%`;
  });
} 