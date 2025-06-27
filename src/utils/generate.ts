import { loadHtml2Canvas } from './html2canvas-loader';
import { jsPDF } from 'jspdf';

let outputImages: HTMLCanvasElement[] = [];

/**
 * Apply paper styles before generating images
 */
export const applyPaperStyles = (
  pageEl: HTMLElement,
  paperContentEl: HTMLElement,
  paperColor: string,
  inkColor: string,
  fontName: string,
  fontSize: string,
  lineHeight: string,
  letterSpacing: string,
  wordSpacing: string,
  pageEffect: string
): void => {
  if (!paperContentEl || !pageEl) return;

  // Add CSS styles to paper content
  paperContentEl.style.color = inkColor;
  paperContentEl.style.fontFamily = fontName;
  paperContentEl.style.fontSize = fontSize;
  paperContentEl.style.lineHeight = lineHeight;
  paperContentEl.style.letterSpacing = letterSpacing;
  paperContentEl.style.wordSpacing = wordSpacing;
  paperContentEl.style.backgroundColor = 'transparent';
  pageEl.style.filter = '';

  if (pageEffect === 'shadows') {
    pageEl.style.filter = 'drop-shadow(3px 3px 3px rgba(0,0,0,0.2))';
  } else if (pageEffect === 'scanner') {
    paperContentEl.style.backgroundColor = '#fff8';
  }
};

/**
 * Remove paper styles after generating images
 */
export const removePaperStyles = (
  pageEl: HTMLElement,
  paperContentEl: HTMLElement
): void => {
  if (!paperContentEl || !pageEl) return;

  // Reset styles
  paperContentEl.style.color = '';
  paperContentEl.style.fontFamily = '';
  paperContentEl.style.fontSize = '';
  paperContentEl.style.lineHeight = '';
  paperContentEl.style.letterSpacing = '';
  paperContentEl.style.wordSpacing = '';
  paperContentEl.style.backgroundColor = '';
  pageEl.style.filter = '';
};

/**
 * Render output images to the output container
 */
export const renderOutput = (
  images: HTMLCanvasElement[],
  outputContainer: HTMLElement
): void => {
  if (!outputContainer) return;

  // Clear the output container
  outputContainer.innerHTML = '';

  if (images.length === 0) {
    outputContainer.innerHTML = 'Click "Generate Image" Button to generate new image.';
    return;
  }

  images.forEach((canvas, index) => {
    const imageContainer = document.createElement('div');
    imageContainer.className = 'output-image-container';

    // Image element
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/jpeg');
    img.className = 'output-image';
    img.loading = 'lazy';

    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button';
    closeButton.dataset.index = index.toString();
    closeButton.innerHTML = '&times;';

    // Move buttons
    const moveLeftButton = document.createElement('button');
    moveLeftButton.className = 'move-left';
    moveLeftButton.dataset.index = index.toString();
    moveLeftButton.innerHTML = '&larr;';
    moveLeftButton.disabled = index === 0;

    const moveRightButton = document.createElement('button');
    moveRightButton.className = 'move-right';
    moveRightButton.dataset.index = index.toString();
    moveRightButton.innerHTML = '&rarr;';
    moveRightButton.disabled = index === images.length - 1;

    // Add elements to container
    imageContainer.appendChild(img);
    imageContainer.appendChild(closeButton);
    imageContainer.appendChild(moveLeftButton);
    imageContainer.appendChild(moveRightButton);

    outputContainer.appendChild(imageContainer);
  });

  // Set up event listeners
  setRemoveImageListeners(outputContainer);

  // Update header
  const outputHeader = document.querySelector('#output-header');
  if (outputHeader) {
    outputHeader.textContent = `Output${images.length ? ` (${images.length})` : ''}`;
  }
};

/**
 * Set event listeners for image manipulation
 */
function setRemoveImageListeners(outputContainer: HTMLElement) {
  // Remove image listeners
  outputContainer.querySelectorAll('.output-image-container > .close-button').forEach((closeButton) => {
    closeButton.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const index = Number(target.dataset.index);
      outputImages.splice(index, 1);
      renderOutput(outputImages, outputContainer);
    });
  });

  // Move left listeners
  outputContainer.querySelectorAll('.move-left').forEach((leftButton) => {
    leftButton.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const index = Number(target.dataset.index);
      moveLeft(index, outputContainer);
    });
  });

  // Move right listeners
  outputContainer.querySelectorAll('.move-right').forEach((rightButton) => {
    rightButton.addEventListener('click', (e) => {
      const target = e.target as HTMLElement;
      const index = Number(target.dataset.index);
      moveRight(index, outputContainer);
    });
  });
}

/**
 * Convert DIV to image using html2canvas
 */
export const convertDIVToImage = async (
  pageEl: HTMLElement,
  resolution: number,
  pageEffect: string
): Promise<HTMLCanvasElement> => {
  if (typeof window === 'undefined') {
    throw new Error('Cannot generate image on server side');
  }
  
  // Dynamically load html2canvas
  const html2canvas = await loadHtml2Canvas();
  if (!html2canvas) {
    throw new Error('Failed to load html2canvas library');
  }
  
  const options = {
    scrollX: 0,
    scrollY: -window.scrollY,
    scale: resolution,
    useCORS: true,
    allowTaint: true,
    backgroundColor: null,
    windowWidth: pageEl.scrollWidth,
    windowHeight: pageEl.scrollHeight
  };

  // Generate canvas from element
  const canvas = await html2canvas(pageEl, options);

  // Apply scanner effect if selected
  if (pageEffect === 'scanner') {
    const context = canvas.getContext('2d', { willReadFrequently: true });
    if (context) {
      const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      contrastImage(imageData, 0.55);
      context.putImageData(imageData, 0, 0);
    }
  }

  return canvas;
};

/**
 * Generate images from paper content
 */
export const generateImages = async (
  pageEl: HTMLElement,
  paperContentEl: HTMLElement,
  resolution: number,
  pageEffect: string,
  outputContainer: HTMLElement,
  fontName: string,
  fontSize: string,
  lineHeight: string,
  letterSpacing: string,
  wordSpacing: string,
  paperColor: string,
  inkColor: string
): Promise<HTMLCanvasElement[]> => {
  if (!pageEl || !paperContentEl) return [];

  // Apply styles before generating images
  applyPaperStyles(
    pageEl,
    paperContentEl,
    paperColor,
    inkColor,
    fontName,
    fontSize,
    lineHeight,
    letterSpacing,
    wordSpacing,
    pageEffect
  );
  
  // Always scroll to top before capturing
  pageEl.scrollTo(0, 0);
  
  // Reset output images array
  outputImages = [];
  
  const clientHeight = 514; // height of .paper-content when there is no content
  const scrollHeight = paperContentEl.scrollHeight;
  const totalPages = Math.ceil(scrollHeight / clientHeight);
  
  if (totalPages > 1) {
    // For multiple pages
    if (paperContentEl.innerHTML.includes('<img')) {
      alert(
        "You're trying to generate more than one page. Images and some formatting may not work correctly with multiple images."
      );
    }
    
    const initialPaperContent = paperContentEl.innerHTML;
    const splitContent = initialPaperContent.split(/(\s+)/);
    
    // Multiple images
    let wordCount = 0;
    for (let i = 0; i < totalPages; i++) {
      paperContentEl.innerHTML = '';
      const wordArray = [];
      let wordString = '';
      
      while (
        paperContentEl.scrollHeight <= clientHeight &&
        wordCount <= splitContent.length
      ) {
        wordString = wordArray.join(' ');
        wordArray.push(splitContent[wordCount]);
        paperContentEl.innerHTML = wordArray.join(' ');
        wordCount++;
      }
      
      paperContentEl.innerHTML = wordString;
      wordCount--;
      pageEl.scrollTo(0, 0);
      
      const canvas = await convertDIVToImage(pageEl, resolution, pageEffect);
      outputImages.push(canvas);
      
      paperContentEl.innerHTML = initialPaperContent;
    }
  } else {
    // Single image
    const canvas = await convertDIVToImage(pageEl, resolution, pageEffect);
    outputImages.push(canvas);
  }
  
  // Remove styles after generating
  removePaperStyles(pageEl, paperContentEl);
  
  // Render the output
  renderOutput(outputImages, outputContainer);
  
  return outputImages;
};

/**
 * Delete all generated images
 */
export const deleteAllImages = (outputContainer: HTMLElement): void => {
  outputImages = [];
  renderOutput(outputImages, outputContainer);
};

/**
 * Move image left in the array
 */
export const moveLeft = (index: number, outputContainer: HTMLElement): void => {
  if (index === 0) return;
  
  const temp = outputImages[index];
  outputImages.splice(index, 1);
  outputImages.splice(index - 1, 0, temp);
  
  renderOutput(outputImages, outputContainer);
};

/**
 * Move image right in the array
 */
export const moveRight = (index: number, outputContainer: HTMLElement): void => {
  if (index === outputImages.length - 1) return;
  
  const temp = outputImages[index];
  outputImages.splice(index, 1);
  outputImages.splice(index + 1, 0, temp);
  
  renderOutput(outputImages, outputContainer);
};

/**
 * Download generated images as PDF
 */
export const downloadAsPDF = (paperSize = {width: 210, height: 297}): void => {
  if (outputImages.length === 0) {
    alert('No images to download');
    return;
  }
  
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: [paperSize.width, paperSize.height]
  });
  
  outputImages.forEach((canvas, index) => {
    if (index > 0) {
      pdf.addPage([paperSize.width, paperSize.height]);
    }
    
    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    
    const width = pdf.internal.pageSize.getWidth();
    const height = pdf.internal.pageSize.getHeight();
    
    pdf.addImage(imgData, 'JPEG', 25, 50, width - 50, height - 80);
  });
  
  pdf.save(`handwriting.pdf`);
};

/**
 * Add contrast to image data (for scanner effect)
 */
const contrastImage = (imageData: ImageData, contrast: number): void => {
  const data = imageData.data;
  contrast *= 255;
  const factor = (contrast + 255) / (255.01 - contrast);
  
  for (let i = 0; i < data.length; i += 4) {
    data[i] = factor * (data[i] - 128) + 128;
    data[i + 1] = factor * (data[i + 1] - 128) + 128;
    data[i + 2] = factor * (data[i + 2] - 128) + 128;
  }
};