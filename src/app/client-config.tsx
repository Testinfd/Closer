'use client';

import { useEffect } from 'react';
import { loadHtml2Canvas } from '../utils/html2canvas-loader';

export default function ClientConfig() {
  useEffect(() => {
    console.log('Client configuration loaded');
    
    // Preload html2canvas
    loadHtml2Canvas()
      .then((html2canvas) => {
        if (html2canvas) {
          console.log('html2canvas loaded successfully');
          // Make it globally available for legacy code
          window.html2canvas = html2canvas;
        } else {
          console.warn('html2canvas not found, some features may not work');
        }
      })
      .catch((error) => {
        console.error('Error loading html2canvas:', error);
      });
  }, []);
  
  // This component doesn't render anything
  return null;
} 