/**
 * This utility handles dynamic loading of html2canvas in browser environments
 */

import dynamic from 'next/dynamic';

// Function to dynamically load html2canvas only on client-side
let html2canvasPromise: Promise<any> | null = null;
let html2canvasLoaded = false;

export const loadHtml2Canvas = async (): Promise<any> => {
  // Return cached promise if already loading
  if (html2canvasPromise) {
    return html2canvasPromise;
  }

  // Check if we're in the browser environment
  if (typeof window === 'undefined') {
    console.warn('html2canvas cannot be loaded in a server environment');
    return null;
  }

  // Create a new promise to load html2canvas
  html2canvasPromise = import('html2canvas')
    .then(mod => {
      const html2canvas = mod.default || mod;
      html2canvasLoaded = true;
      return html2canvas;
    })
    .catch(err => {
      console.error('Failed to load html2canvas:', err);
      html2canvasPromise = null;
      return null;
    });

  return html2canvasPromise;
};

// Export a function to check if html2canvas is available
export const isHtml2CanvasAvailable = (): boolean => {
  return typeof window !== 'undefined' && html2canvasLoaded;
}; 