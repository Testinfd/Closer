import { loadHtml2Canvas } from './html2canvas-loader';
import { jsPDF } from 'jspdf';

let outputImages: HTMLCanvasElement[] = [];

/**
 * Shows a user-friendly error message
 */
const showErrorMessage = (message: string): void => {
  console.error(message);
  // If in browser environment, show alert
  if (typeof window !== 'undefined') {
    alert(`Error: ${message}`);
  }
};

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
  if (!paperContentEl || !pageEl) {
    throw new Error('Paper or content elements not found');
  }

  try {
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
    if (!overlayEl) {
      console.warn('Overlay element not found, some effects may not be applied');
      return;
    }

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
    }
  } catch (error) {
    console.error('Error applying paper styles:', error);
    throw new Error(`Failed to apply paper styles: ${(error as Error).message}`);
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
  
  if (!pageEl) {
    throw new Error('Page element is not defined');
  }
  
  try {
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
        try {
          const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
          contrastImage(imageData, 0.55);
          context.putImageData(imageData, 0, 0);
        } catch (error) {
          console.warn('Failed to apply scanner effect:', error);
          // Continue without the scanner effect rather than failing
        }
      }
    }

    return canvas;
  } catch (error) {
    console.error('Error converting DIV to image:', error);
    throw new Error(`Failed to generate image: ${(error as Error).message}`);
  }
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
  if (!pageEl || !paperContentEl) {
    showErrorMessage('Page or content element not found');
    return [];
  }

  if (!outputContainer) {
    showErrorMessage('Output container not found');
    return [];
  }

  let sideNoteClone: HTMLElement | null = null;
  let topNoteClone: HTMLElement | null = null;
  const initialContent = {
    paperContent: paperContentEl.innerHTML,
    leftMargin: '',
    topMargin: ''
  };

  try {
    // Apply styles before generating images
    await applyPaperStyles(
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

    // Store margin elements for later restoration
    const leftMarginEl = pageEl.querySelector('.left-margin') as HTMLElement | null;
    const topMarginEl = pageEl.querySelector('.top-margin') as HTMLElement | null;
    
    if (leftMarginEl) initialContent.leftMargin = leftMarginEl.innerHTML;
    if (topMarginEl) initialContent.topMargin = topMarginEl.innerHTML;

    // Position side notes and top notes in the paper if they exist
    if (sideNotes && leftMarginEl) {
      try {
        sideNoteClone = sideNotes.cloneNode(true) as HTMLElement;
        sideNoteClone.style.padding = '10px';
        sideNoteClone.style.boxSizing = 'border-box';
        sideNoteClone.style.width = '100%';
        sideNoteClone.style.height = '100%';
        sideNoteClone.style.overflow = 'hidden';
        // Clear any children first to avoid duplicates
        while (leftMarginEl.firstChild) {
          leftMarginEl.removeChild(leftMarginEl.firstChild);
        }
        leftMarginEl.appendChild(sideNoteClone);
      } catch (error) {
        console.error('Error setting up side notes:', error);
      }
    }

    if (topNotes && topMarginEl) {
      try {
        topNoteClone = topNotes.cloneNode(true) as HTMLElement;
        topNoteClone.style.padding = '10px';
        topNoteClone.style.boxSizing = 'border-box';
        topNoteClone.style.width = '100%';
        topNoteClone.style.textAlign = 'center';
        // Clear any children first to avoid duplicates
        while (topMarginEl.firstChild) {
          topMarginEl.removeChild(topMarginEl.firstChild);
        }
        topMarginEl.appendChild(topNoteClone);
      } catch (error) {
        console.error('Error setting up top notes:', error);
      }
    }

    // Always scroll to top before capturing
    if ('scrollTo' in pageEl) {
      try {
        pageEl.scrollTo(0, 0);
      } catch (error) {
        console.warn('Could not scroll element to top:', error);
      }
    }

    // Reset output images array
    outputImages = [];

    const pageHeight = paperContentEl.clientHeight > 100 ? paperContentEl.clientHeight : 514;
    const scrollHeight = paperContentEl.scrollHeight;
    
    // Add a tolerance to prevent creating extra pages for minor overflows
    const tolerance = 10; // 10px tolerance
    const totalPages = scrollHeight > pageHeight + tolerance ? Math.ceil(scrollHeight / pageHeight) : 1;

    // Set a reasonable limit to prevent browser crashes
    const maxPages = 50;
    if (totalPages > maxPages) {
      showErrorMessage(`Too many pages (${totalPages}). Maximum allowed is ${maxPages}. Try reducing content or increasing page size.`);
      return [];
    }

    if (totalPages > 1) {
      // For multiple pages
      // Process each page
      for (let i = 0; i < totalPages; i++) {
        try {
          // Scroll to the correct page content
          paperContentEl.scrollTop = i * pageHeight;

          // Apply proper styles for multi-page margins
          if (leftMarginEl) leftMarginEl.innerHTML = initialContent.leftMargin;
          if (topMarginEl) topMarginEl.innerHTML = initialContent.topMargin;
          
          // Generate the canvas
          const canvas = await convertDIVToImage(pageEl, resolution, pageEffect);
          outputImages.push(canvas);
        } catch (error) {
          console.error(`Error generating page ${i+1}:`, error);
          showErrorMessage(`Failed to generate page ${i+1}. ${(error as Error).message}`);
          // Continue with other pages
        }
      }
    } else {
      // Single image
      try {
        const canvas = await convertDIVToImage(pageEl, resolution, pageEffect);
        outputImages.push(canvas);
      } catch (error) {
        console.error('Error generating image:', error);
        showErrorMessage(`Failed to generate image. ${(error as Error).message}`);
      }
    }

    return outputImages;
  } catch (error) {
    console.error('Error in image generation process:', error);
    showErrorMessage(`Image generation failed: ${(error as Error).message}`);
    return [];
  } finally {
    // Ensure cleanup happens even if there are errors
    try {
      // Remove clones
      if (sideNoteClone && sideNoteClone.parentNode) {
        sideNoteClone.parentNode.removeChild(sideNoteClone);
      }
      
      if (topNoteClone && topNoteClone.parentNode) {
        topNoteClone.parentNode.removeChild(topNoteClone);
      }
      
      // Restore original content
      paperContentEl.innerHTML = initialContent.paperContent;
      paperContentEl.scrollTop = 0; // Reset scroll position
      
      const leftMarginEl = pageEl.querySelector('.left-margin') as HTMLElement | null;
      const topMarginEl = pageEl.querySelector('.top-margin') as HTMLElement | null;
      
      if (leftMarginEl && initialContent.leftMargin) {
        leftMarginEl.innerHTML = initialContent.leftMargin;
      }
      
      if (topMarginEl && initialContent.topMargin) {
        topMarginEl.innerHTML = initialContent.topMargin;
      }
      
      // Remove applied styles
      removePaperStyles(pageEl, paperContentEl);
      
      // Render output (even if empty)
      renderOutput(outputImages, outputContainer);
    } catch (cleanupError) {
      console.error('Error during cleanup:', cleanupError);
    }
  }
};

/**
 * Delete all generated images
 */
export const deleteAllImages = (outputContainer: HTMLElement): void => {
  if (!outputContainer) {
    showErrorMessage('Output container not found');
    return;
  }
  
  try {
    outputImages = [];
    renderOutput(outputImages, outputContainer);
  } catch (error) {
    console.error('Error deleting images:', error);
    showErrorMessage(`Failed to delete images: ${(error as Error).message}`);
  }
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
    showErrorMessage('No images to download');
    return;
  }
  
  try {
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
  } catch (error) {
    console.error('Error downloading PDF:', error);
    showErrorMessage(`Failed to generate PDF: ${(error as Error).message}`);
  }
};

/**
 * Download a single canvas image as PNG
 */
export const downloadImageAsPNG = (canvas: HTMLCanvasElement, filename: string): void => {
  if (!canvas) {
    showErrorMessage('No image to download');
    return;
  }
  
  try {
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error downloading PNG:', error);
    showErrorMessage(`Failed to download image: ${(error as Error).message}`);
  }
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