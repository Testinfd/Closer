/**
 * Utility functions for randomizing handwriting appearance
 */

/**
 * Generate a random vertical offset within a specified range
 * @param baselineJitterAmount Maximum amount of jitter in pixels
 */
export function getRandomBaselineJitter(baselineJitterAmount: number = 2): number {
  // Use a smaller multiplier for more subtle variations
  return (Math.random() - 0.5) * baselineJitterAmount * 0.8;
}

/**
 * Generate a random letter spacing value to simulate natural handwriting
 * @param baseSpacing The base letter spacing value in pixels
 * @param variationAmount Maximum variation amount in pixels
 */
export function getRandomLetterSpacing(baseSpacing: number, variationAmount: number = 1): number {
  // Use a smaller multiplier for more subtle variations
  return baseSpacing + (Math.random() - 0.5) * variationAmount * 0.6;
}

/**
 * Generate a random word spacing value to simulate natural handwriting
 * @param baseSpacing The base word spacing value in pixels
 * @param variationAmount Maximum variation amount in pixels
 */
export function getRandomWordSpacing(baseSpacing: number, variationAmount: number = 2): number {
  // Use a smaller multiplier for more subtle variations
  return baseSpacing + (Math.random() - 0.5) * variationAmount * 0.7;
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
  
  // Increase rotation for more noticeable effect (from -1 to 1 degrees to -3 to 3 degrees)
  const rotation = (Math.random() - 0.5) * 6;
  
  // More noticeable scale variation (from 0.98-1.02 to 0.95-1.05)
  const scale = 0.95 + Math.random() * 0.1;
  
  // More noticeable baseline shift (from -0.75 to 0.75 to -2 to 2)
  const baselineShift = (Math.random() - 0.5) * 4;
  
  // More varied ink opacity variation for natural ink flow
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
 * @param intensity Intensity of the effect (0-1)
 */
export function applyInkVariations(element: HTMLElement, inkColor: string, intensity: number = 0.7): void {
  if (!element) return;
  
  // Convert hex to RGB for manipulation
  const parseColor = (color: string) => {
    // Handle non-hex colors
    if (!color.startsWith('#')) {
      return { r: 0, g: 0, b: 0 };
    }
    
    const r = parseInt(color.slice(1, 3), 16);
    const g = parseInt(color.slice(3, 5), 16);
    const b = parseInt(color.slice(5, 7), 16);
    return { r, g, b };
  };
  
  const rgb = parseColor(inkColor);
  
  // Apply to all text nodes
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  
  while ((node = walker.nextNode() as Text | null)) {
    if (!node?.textContent?.trim()) continue;
    
    // Apply more noticeable variations based on the intensity parameter
    const text = node.textContent || '';
    const fragment = document.createDocumentFragment();
    
    // Choose a few random positions in the text to vary more noticeably
    const specialPositions: number[] = [];
    const wordPositions = text.split(' ').map((_, i, arr) => 
      arr.slice(0, i).join(' ').length + (i > 0 ? i : 0)
    );
    
    // Select more positions for increased variation
    if (wordPositions.length > 3) {
      for (let i = 0; i < Math.min(4, Math.floor(wordPositions.length * 0.4)); i++) {
        const randomIdx = Math.floor(Math.random() * wordPositions.length);
        specialPositions.push(wordPositions[randomIdx]);
      }
    }
    
    // Process each character
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement('span');
      span.textContent = char;
      
      // Skip significant processing for spaces
      if (char === ' ' || char === '\n' || char === '\t') {
        fragment.appendChild(span);
        continue;
      }
      
      // Determine if this is a special position for slightly more variation
      const isSpecialPosition = specialPositions.some(pos => 
        i >= pos && i <= pos + 2 // The character and next few chars at this position
      );
      
      // Apply more variation for special positions, less for others
      // Increase multiplier for more noticeable effect
      const variationMultiplier = isSpecialPosition ? intensity * 1.5 : intensity;
      
      // Random ink density with more noticeable variations
      const densityVariation = variationMultiplier * 0.5; // Increased from 0.3 to 0.5
      const density = 0.8 + Math.random() * densityVariation;
      const darkR = Math.floor(rgb.r * density);
      const darkG = Math.floor(rgb.g * density);
      const darkB = Math.floor(rgb.b * density);
      
      // Apply more noticeable rotation
      const rotation = isSpecialPosition 
        ? (Math.random() - 0.5) * 4 * variationMultiplier  // Increased from 2 to 4
        : (Math.random() - 0.5) * 1.5 * variationMultiplier; // Increased from 0.7 to 1.5
      
      // Apply enhanced styles
      span.style.color = `rgb(${darkR}, ${darkG}, ${darkB})`;
      span.style.display = 'inline-block';
      
      // Only apply transformation if not a space
      if (char.trim()) {
        span.style.transform = `rotate(${rotation}deg)`;
        
        // Apply more noticeable baseline jitter
        const baselineJitter = (Math.random() - 0.5) * variationMultiplier * 3; // Increased from 1.5 to 3
        span.style.position = 'relative';
        span.style.top = `${baselineJitter}px`;
        
        // Apply more noticeable size variation
        const sizeVariation = isSpecialPosition 
          ? 1 + (Math.random() - 0.5) * 0.08 * variationMultiplier  // Increased from 0.05 to 0.08
          : 1 + (Math.random() - 0.5) * 0.04 * variationMultiplier; // Increased from 0.02 to 0.04
        span.style.fontSize = `${sizeVariation}em`;
      }
      
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
  if (!element) return;
  
  // Find all paragraph elements
  const paragraphs = element.querySelectorAll('p, div[data-slate-node="element"]');
  
  paragraphs.forEach((p) => {
    // Skip empty paragraphs
    if (!p.textContent?.trim()) return;
    
    // Random width percentage between 100-maxVariation and 100
    // More subtle variation: use only half the max variation most of the time
    const useSubtle = Math.random() > 0.3; // 70% chance of subtle variation
    const actualVariation = useSubtle ? maxVariation * 0.5 : maxVariation;
    const widthPercentage = 100 - Math.random() * actualVariation;
    (p as HTMLElement).style.width = `${widthPercentage}%`;
    
    // Add a very slight random rotation for more natural look
    // More subtle rotation
    const rotation = (Math.random() - 0.5) * 0.3; // -0.15 to 0.15 degrees (was -0.25 to 0.25)
    (p as HTMLElement).style.transform = `rotate(${rotation}deg)`;
  });
}

/**
 * Applies subtle randomization to specific words in the text
 * This creates a more natural handwriting effect by varying just a few words
 * @param element HTML element to process
 * @param intensity Intensity of the randomization (0-1)
 */
export function applyWordVariations(element: HTMLElement, intensity: number = 0.7): void {
  if (!element) return;
  
  // Find paragraphs and process text nodes
  const paragraphs = element.querySelectorAll('p, div[data-slate-node="element"]');
  
  paragraphs.forEach((paragraph) => {
    // Get all direct text nodes in the paragraph
    const textNodes = [];
    for (let i = 0; i < paragraph.childNodes.length; i++) {
      const node = paragraph.childNodes[i];
      if (node.nodeType === Node.TEXT_NODE) {
        textNodes.push(node);
      }
    }
    
    textNodes.forEach((textNode) => {
      const text = textNode.textContent || '';
      const words = text.split(/\s+/);
      
      // Only process if we have enough words
      if (words.length <= 2) return;
      
      // Select 1-3 words to vary
      const numWordsToVary = Math.max(1, Math.floor(words.length * 0.2));
      const wordIndexesToVary = new Set<number>();
      
      while (wordIndexesToVary.size < numWordsToVary) {
        const randomIndex = Math.floor(Math.random() * words.length);
        if (words[randomIndex].length >= 3) { // Only vary words with sufficient length
          wordIndexesToVary.add(randomIndex);
        }
      }
      
      // Create document fragment to replace text node
      const fragment = document.createDocumentFragment();
      let currentPosition = 0;
      
      words.forEach((word, i) => {
        if (wordIndexesToVary.has(i)) {
          // This word needs variation
          const wordSpan = document.createElement('span');
          wordSpan.textContent = word;
          
          // Apply subtle letter spacing variation
          const letterSpacing = (Math.random() - 0.5) * 0.5 * intensity;
          wordSpan.style.letterSpacing = `${letterSpacing}px`;
          
          // Apply subtle baseline shift
          const baselineShift = (Math.random() - 0.5) * intensity;
          wordSpan.style.position = 'relative';
          wordSpan.style.top = `${baselineShift}px`;
          
          // Very subtle rotation
          const rotation = (Math.random() - 0.5) * intensity * 0.6;
          wordSpan.style.display = 'inline-block';
          wordSpan.style.transform = `rotate(${rotation}deg)`;
          
          fragment.appendChild(wordSpan);
        } else {
          // Regular word, no variation
          fragment.appendChild(document.createTextNode(word));
        }
        
        // Add space after word if not the last word
        if (i < words.length - 1) {
          fragment.appendChild(document.createTextNode(' '));
        }
      });
      
      // Replace the text node with our fragment
      if (textNode.parentNode) {
        textNode.parentNode.replaceChild(fragment, textNode);
      }
    });
  });
} 