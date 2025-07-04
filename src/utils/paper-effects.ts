/**
 * Utility functions for paper textures and ink effects
 */

/**
 * Applies a paper texture effect to an HTML element
 * @param element Target HTML element
 * @param textureUrl URL of the paper texture image
 * @param opacity Opacity of the texture (0-1)
 */
export function applyPaperTexture(
  element: HTMLElement,
  textureUrl: string,
  opacity: number = 0.2
): void {
  // Ensure the element has relative positioning for proper overlay
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }
  element.style.overflow = 'hidden';

  // Find or create the texture overlay element
  let overlay = element.querySelector('.paper-texture-overlay') as HTMLElement;
  if (overlay) {
    // Remove existing overlay to prevent duplicates
    overlay.remove();
  }
  
  overlay = document.createElement('div');
  overlay.classList.add('paper-texture-overlay');
  
  // Position behind the text but above the background
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '0';
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  
  // Make sure content appears above the texture
  const contentElements = Array.from(element.children);
  contentElements.forEach(child => {
    if (child !== overlay) {
      (child as HTMLElement).style.position = 'relative';
      (child as HTMLElement).style.zIndex = '1';
    }
  });
  
  // Apply the texture
  overlay.style.backgroundImage = `url(${textureUrl})`;
  overlay.style.backgroundSize = 'cover';
  overlay.style.opacity = opacity.toString();
  
  // Apply a slight rotation for more realism
  const rotation = (Math.random() - 0.5) * 2; // -1 to 1 degrees
  overlay.style.transform = `rotate(${rotation}deg)`;
  
  // Insert at the beginning to ensure it's behind all content
  element.prepend(overlay);
}

/**
 * Creates and applies ink bleed effects
 * @param element Target HTML element containing text
 * @param inkColor Base color of the ink
 * @param bleedIntensity Intensity of the bleed effect (0-1)
 */
export function applyInkBleedEffect(
  element: HTMLElement,
  inkColor: string,
  bleedIntensity: number = 0.3
): void {
  if (!element) return;
  
  // Parse the color to RGB components
  const hexToRgb = (hex: string): { r: number, g: number, b: number } => {
    // Handle non-hex colors by returning a default
    if (!hex || !hex.startsWith('#')) {
      return { r: 0, g: 0, b: 0 };
    }
    
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };
  
  const rgb = hexToRgb(inkColor);
  
  // Process all text nodes
  const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
  let node: Text | null;
  
  while ((node = walker.nextNode() as Text | null)) {
    if (!node?.textContent?.trim()) continue;
    
    // Get parent element of text node
    const parent = node.parentNode as HTMLElement;
    if (!parent) continue;
    
    // Apply bleed effect via text-shadow
    const blurRadius = Math.max(1, Math.floor(3 * bleedIntensity));
    const spreadRadius = Math.max(0.5, 1 * bleedIntensity);
    
    parent.style.textShadow = `0 0 ${blurRadius}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bleedIntensity * 0.5})`;
    
    // Also apply a subtle filter for more realism
    parent.style.filter = `drop-shadow(0 0 ${spreadRadius}px rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${bleedIntensity * 0.3}))`;
  }
}

/**
 * Applies subtle ink pressure variations
 * @param element Target HTML element containing text
 */
export function applyInkPressureVariations(element: HTMLElement): void {
  if (!element) return;
  
  // Find all text elements
  const textElements = element.querySelectorAll('p, span, div');
  
  textElements.forEach(el => {
    if (!el.textContent?.trim()) return;
    
    // Convert to array of characters wrapped in spans
    const text = el.textContent || '';
    el.textContent = '';
    
    for (let i = 0; i < text.length; i++) {
      const char = text[i];
      const span = document.createElement('span');
      span.textContent = char;
      
      // Apply random pressure effect (thickness variation)
      const pressure = 0.7 + Math.random() * 0.6; // 0.7-1.3 range
      span.style.fontWeight = (400 * pressure).toString();
      
      // Apply random opacity variation
      const opacity = 0.85 + Math.random() * 0.15; // 0.85-1.0 range
      span.style.opacity = opacity.toString();
      
      el.appendChild(span);
    }
  });
}

/**
 * Applies paper creases and imperfections
 * @param element Target HTML element
 * @param intensity Intensity of the effect (0-1)
 */
export function applyPaperImperfections(element: HTMLElement, intensity: number = 0.3): void {
  if (!element) return;
  
  // Ensure the element has relative positioning for proper overlay
  if (getComputedStyle(element).position === 'static') {
    element.style.position = 'relative';
  }
  
  // Create imperfection overlay
  let overlay = element.querySelector('.paper-imperfections') as HTMLElement;
  if (overlay) {
    // Remove existing overlay to prevent duplicates
    overlay.remove();
  }
  
  overlay = document.createElement('div');
  overlay.classList.add('paper-imperfections');
  overlay.style.position = 'absolute';
  overlay.style.inset = '0';
  overlay.style.pointerEvents = 'none';
  overlay.style.zIndex = '0';
  overlay.style.opacity = (intensity * 0.5).toString();
  overlay.style.width = '100%';
  overlay.style.height = '100%';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  
  // Add subtle creases
  const numCreases = Math.floor(2 + Math.random() * 3); // 2-4 creases
  
  for (let i = 0; i < numCreases; i++) {
    const crease = document.createElement('div');
    crease.classList.add('paper-crease');
    
    // Random position and angle
    const isHorizontal = Math.random() > 0.5;
    const position = 10 + Math.random() * 80; // Avoid edges (10%-90% of dimension)
    
    crease.style.position = 'absolute';
    crease.style.backgroundColor = 'rgba(0, 0, 0, 0.03)';
    
    if (isHorizontal) {
      crease.style.height = `${0.5 + Math.random() * 1}px`;
      crease.style.width = '100%';
      crease.style.top = `${position}%`;
      crease.style.left = '0';
    } else {
      crease.style.width = `${0.5 + Math.random() * 1}px`;
      crease.style.height = '100%';
      crease.style.left = `${position}%`;
      crease.style.top = '0';
    }
    
    // Subtle shadow for depth
    crease.style.boxShadow = `0 0 4px rgba(0, 0, 0, 0.05)`;
    
    overlay.appendChild(crease);
  }
  
  // Add subtle stains/marks
  const numStains = Math.floor(intensity * 5); // 0-5 stains based on intensity
  
  for (let i = 0; i < numStains; i++) {
    const stain = document.createElement('div');
    stain.classList.add('paper-stain');
    
    // Random position
    const left = Math.random() * 90 + 5; // 5%-95%
    const top = Math.random() * 90 + 5; // 5%-95%
    
    // Random size
    const size = 5 + Math.random() * 15; // 5px-20px
    
    stain.style.position = 'absolute';
    stain.style.left = `${left}%`;
    stain.style.top = `${top}%`;
    stain.style.width = `${size}px`;
    stain.style.height = `${size}px`;
    stain.style.borderRadius = '50%';
    stain.style.backgroundColor = `rgba(0, 0, 0, ${0.01 + Math.random() * 0.03})`; // Very subtle
    stain.style.opacity = (0.2 + Math.random() * 0.2).toString();
    
    overlay.appendChild(stain);
  }
  
  // Insert at the beginning to ensure it's behind all content
  element.prepend(overlay);
} 