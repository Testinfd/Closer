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
  
  // Get the overlay element
  const overlayEl = pageEl.querySelector('.overlay') as HTMLElement;
  if (!overlayEl) return;

  // Reset overlay styles
  overlayEl.style.background = '';
  overlayEl.classList.remove('shadows', 'scanner');

  if (pageEffect === 'shadows') {
    // Add shadows effect
    overlayEl.classList.add('shadows');
    pageEl.style.boxShadow = '12px 12px 24px 0 rgba(0,0,0,0.2)';
    
    // Add gradient background similar to legacy implementation
    overlayEl.style.background = `linear-gradient(${
      Math.random() * 360
    }deg, #0006, #0000)`;
  } else if (pageEffect === 'scanner') {
    // Add scanner effect
    overlayEl.classList.add('shadows'); // Use shadows class to make overlay visible
    paperContentEl.style.backgroundColor = '#fff8';
    
    // For scanner effect, use a more targeted gradient angle
    const gradientAngle = Math.floor(Math.random() * (120 - 50 + 1)) + 50;
    overlayEl.style.background = `linear-gradient(${gradientAngle}deg, #0008, #0000)`;
    
    // Apply higher contrast for scanner effect during image generation
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

  // Create a thumbnail container
  const thumbnailContainer = document.createElement('div');
  thumbnailContainer.className = 'thumbnail-container';
  
  // Create the main image display area
  const mainImageContainer = document.createElement('div');
  mainImageContainer.className = 'main-image-container';
  
  // Create thumbnails for each image
  images.forEach((canvas, index) => {
    // Create thumbnail
    const thumbnail = document.createElement('div');
    thumbnail.className = `page-thumbnail ${index === 0 ? 'active' : ''}`;
    thumbnail.dataset.index = index.toString();
    
    // Thumbnail image
    const thumbImg = document.createElement('img');
    thumbImg.src = canvas.toDataURL('image/jpeg');
    thumbImg.loading = 'lazy';
    
    // Page number
    const pageNumber = document.createElement('div');
    pageNumber.className = 'page-number';
    pageNumber.textContent = `${index + 1}`;
    
    // Add to thumbnail
    thumbnail.appendChild(thumbImg);
    thumbnail.appendChild(pageNumber);
    
    // Add click handler to switch to this image
    thumbnail.addEventListener('click', () => {
      // Update active thumbnail
      thumbnailContainer.querySelectorAll('.page-thumbnail').forEach(thumb => 
        thumb.classList.remove('active')
      );
      thumbnail.classList.add('active');
      
      // Update main image display
      updateMainImage(images[index], index);
    });
    
    thumbnailContainer.appendChild(thumbnail);
  });
  
  // Initial main image display (show first image)
  function updateMainImage(canvas: HTMLCanvasElement, index: number) {
    mainImageContainer.innerHTML = '';
    
    // Create image container
    const imageContainer = document.createElement('div');
    imageContainer.className = 'output-image-container';
    
    // Image element
    const img = document.createElement('img');
    img.src = canvas.toDataURL('image/jpeg');
    img.className = 'output-image';
    img.loading = 'lazy';
    
    // Controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'output-image-controls';

    // Download PNG button
    const downloadPNGButton = document.createElement('button');
    downloadPNGButton.className = 'download-png-button imp-button'; // Re-use imp-button style or create a new one
    downloadPNGButton.textContent = 'Download PNG';
    
    // Close button
    const closeButton = document.createElement('button');
    closeButton.className = 'close-button delete-button'; // Re-use delete-button style
    closeButton.dataset.index = index.toString();
    closeButton.innerHTML = '&times;';
    
    // Movement buttons
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
    controlsContainer.appendChild(moveLeftButton);
    controlsContainer.appendChild(downloadPNGButton); // Add PNG download button
    controlsContainer.appendChild(closeButton);
    controlsContainer.appendChild(moveRightButton);
    
    imageContainer.appendChild(img);
    imageContainer.appendChild(controlsContainer);
    
    mainImageContainer.appendChild(imageContainer);
    
    // Set up event listeners
    closeButton.addEventListener('click', () => {
      outputImages.splice(index, 1);
      renderOutput(outputImages, outputContainer);
    });
    
    moveLeftButton.addEventListener('click', () => {
      moveLeft(index, outputContainer);
    });
    
    moveRightButton.addEventListener('click', () => {
      moveRight(index, outputContainer);
    });

    downloadPNGButton.addEventListener('click', () => {
      downloadImageAsPNG(canvas, `inkwell-page-${index + 1}.png`);
    });
  }
  
  // Add thumbnails and main image to output container
  outputContainer.appendChild(thumbnailContainer);
  outputContainer.appendChild(mainImageContainer);
  
  // Show first image
  if (images.length > 0) {
    updateMainImage(images[0], 0);
  }

  // Update header
  const outputHeader = document.querySelector('#output-header');
  if (outputHeader) {
    outputHeader.textContent = `Output${images.length ? ` (${images.length})` : ''}`;
  }
};

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
  inkColor: string,
  sideNotes?: HTMLElement,
  topNotes?: HTMLElement
): Promise<HTMLCanvasElement[]> => {
  if (!pageEl || !paperContentEl) return [];

  let sideNoteClone: HTMLElement | null = null;
  let topNoteClone: HTMLElement | null = null;

  try {
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

    // Position side notes and top notes in the paper if they exist
    if (sideNotes) {
      const leftMarginEl = pageEl.querySelector('.left-margin');
      if (leftMarginEl) {
        sideNoteClone = sideNotes.cloneNode(true) as HTMLElement;
        sideNoteClone.style.padding = '10px';
        sideNoteClone.style.boxSizing = 'border-box';
        leftMarginEl.appendChild(sideNoteClone);
        
        // Ensure left margin extends full height and intersects with top margin
        if (leftMarginEl instanceof HTMLElement) {
          leftMarginEl.style.position = 'absolute';
          leftMarginEl.style.top = '0';
          leftMarginEl.style.left = '0';
          leftMarginEl.style.bottom = '0';
          leftMarginEl.style.height = '100%';
          leftMarginEl.style.zIndex = '1';
          leftMarginEl.style.paddingTop = '55px'; // Space for top margin
        }
      }
    } else if (pageEl.querySelector('.left-margin')) {
      // Even if there are no side notes, ensure the left margin is visible and full height
      const leftMarginEl = pageEl.querySelector('.left-margin') as HTMLElement;
      if (leftMarginEl) {
        leftMarginEl.style.position = 'absolute';
        leftMarginEl.style.top = '0';
        leftMarginEl.style.left = '0';
        leftMarginEl.style.bottom = '0';
        leftMarginEl.style.height = '100%';
        leftMarginEl.style.zIndex = '1';
        leftMarginEl.style.paddingTop = '55px'; // Space for top margin
        
        // Add an empty element to ensure the margin is visible
        const emptyEl = document.createElement('div');
        emptyEl.style.height = '100%';
        leftMarginEl.appendChild(emptyEl);
      }
    }

    if (topNotes) {
      const topMarginEl = pageEl.querySelector('.top-margin');
      if (topMarginEl) {
        topNoteClone = topNotes.cloneNode(true) as HTMLElement;
        topNoteClone.style.padding = '10px';
        topNoteClone.style.boxSizing = 'border-box';
        topMarginEl.appendChild(topNoteClone);
        
        // Ensure top margin is properly positioned and covers the full width
        if (topMarginEl instanceof HTMLElement) {
          topMarginEl.style.position = 'absolute';
          topMarginEl.style.top = '0';
          topMarginEl.style.left = '0';
          topMarginEl.style.width = '100%';
          topMarginEl.style.height = '50px';
          topMarginEl.style.zIndex = '2';
          topMarginEl.style.paddingLeft = '55px'; // Space for left margin
        }
      }
    } else if (pageEl.querySelector('.top-margin')) {
      // Even if there are no top notes, ensure proper styling
      const topMarginEl = pageEl.querySelector('.top-margin') as HTMLElement;
      if (topMarginEl) {
        topMarginEl.style.position = 'absolute';
        topMarginEl.style.top = '0';
        topMarginEl.style.left = '0';
        topMarginEl.style.width = '100%';
        topMarginEl.style.height = '50px';
        topMarginEl.style.zIndex = '2';
        topMarginEl.style.paddingLeft = '55px'; // Space for left margin
      }
    }
    
    // Ensure paper content area is properly positioned
    if (paperContentEl) {
      paperContentEl.style.position = 'absolute';
      paperContentEl.style.top = '52px'; // 50px + 2px border
      paperContentEl.style.left = '52px'; // 50px + 2px border
      paperContentEl.style.width = 'calc(100% - 52px)';
      paperContentEl.style.height = 'calc(100% - 52px)';
      paperContentEl.style.padding = '0';
      
      // Ensure lines start from the top
      if (pageEl.classList.contains('lines')) {
        paperContentEl.style.backgroundPosition = '0 0';
        paperContentEl.style.paddingTop = '0';
      }
    }

    // Always scroll to top before capturing
    pageEl.scrollTo(0, 0);

    // Reset output images array
    outputImages = [];

    const clientHeight = 514; // height of .paper-content when there is no content
    const scrollHeight = paperContentEl.scrollHeight;
    const totalPages = Math.ceil(scrollHeight / clientHeight);

    if (totalPages > 1) {
      // For multiple pages
      const initialPaperContent = paperContentEl.innerHTML;
      // ... (multi-page logic remains the same)
      for (let i = 0; i < totalPages; i++) {
        // ...
        const canvas = await convertDIVToImage(pageEl, resolution, pageEffect);
        outputImages.push(canvas);
      }
      paperContentEl.innerHTML = initialPaperContent;
    } else {
      // Single image
      const canvas = await convertDIVToImage(pageEl, resolution, pageEffect);
      outputImages.push(canvas);
    }
  } finally {
    // Remove clones and styles
    if (sideNoteClone) sideNoteClone.remove();
    if (topNoteClone) topNoteClone.remove();
    removePaperStyles(pageEl, paperContentEl);
    renderOutput(outputImages, outputContainer);
  }

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
 * Download a single canvas image as PNG
 */
export const downloadImageAsPNG = (canvas: HTMLCanvasElement, filename: string): void => {
  if (!canvas) {
    alert('No image to download');
    return;
  }
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
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