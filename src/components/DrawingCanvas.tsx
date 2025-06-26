'use client';

import React, { useEffect, useRef, useState } from 'react';

interface DrawingCanvasProps {
  inkColor: string;
  visible: boolean;
  onClose: () => void;
  onAddToPaper: (dataUrl: string) => void;
}

const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ 
  inkColor, 
  visible, 
  onClose, 
  onAddToPaper 
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [lastX, setLastX] = useState<number>(0);
  const [lastY, setLastY] = useState<number>(0);
  const isMobile = typeof window !== 'undefined' && /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const pointSize = isMobile ? 0.5 : 1;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;

    // Set smaller canvas on mobiles
    if (isMobile) {
      canvas.height = 150;
      canvas.width = 300;
    }

    ctx.strokeStyle = inkColor;
    ctx.lineWidth = 2 * pointSize;
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
  }, [inkColor, isMobile, pointSize]);

  const drawPoint = (x: number, y: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    const canvasRect = canvas.getBoundingClientRect();

    const fixPositions = (eventX: number, eventY: number): [number, number] => {
      return [eventX - canvasRect.left, eventY - canvasRect.top];
    };

    if (lastX && lastY && (x !== lastX || y !== lastY)) {
      ctx.beginPath();
      ctx.strokeStyle = inkColor;
      ctx.lineWidth = 2 * pointSize;
      ctx.moveTo(...fixPositions(lastX, lastY));
      ctx.lineTo(...fixPositions(x, y));
      ctx.stroke();
    }

    ctx.beginPath();
    ctx.fillStyle = inkColor;
    ctx.arc(...fixPositions(x, y), pointSize, 0, Math.PI * 2, true);
    ctx.fill();

    setLastX(x);
    setLastY(y);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    setLastX(e.clientX);
    setLastY(e.clientY);
    drawPoint(e.clientX, e.clientY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    drawPoint(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    setLastX(0);
    setLastY(0);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setIsDrawing(true);
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    setLastX(touchX);
    setLastY(touchY);
    drawPoint(touchX, touchY);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const touchX = e.touches[0].clientX;
    const touchY = e.touches[0].clientY;
    
    drawPoint(touchX, touchY);
  };

  const handleTouchEnd = () => {
    setIsDrawing(false);
    setLastX(0);
    setLastY(0);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const addToPaper = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const dataUrl = canvas.toDataURL('image/png');
    onAddToPaper(dataUrl);
  };

  const downloadImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = canvas.toDataURL('image/png');
    a.download = 'diagram.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const addBackgroundImage = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/x-png,image/jpeg';
    
    input.onchange = (e) => {
      const target = e.target as HTMLInputElement;
      if (!target.files || target.files.length === 0) return;
      
      const file = target.files[0];
      const reader = new FileReader();
      
      reader.onload = (event) => {
        if (!event.target) return;
        
        const tempImage = new Image();
        tempImage.src = event.target.result as string;
        
        tempImage.onload = () => {
          if (tempImage.width > tempImage.height) {
            ctx.drawImage(
              tempImage,
              0,
              0,
              canvas.width,
              (canvas.height * tempImage.width) / canvas.width
            );
          } else {
            const newWidth = (canvas.height * tempImage.width) / tempImage.height;
            ctx.drawImage(
              tempImage,
              canvas.width / 2 - newWidth / 2,
              0,
              newWidth,
              canvas.height
            );
          }
        };
      };
      
      reader.readAsDataURL(file);
    };
    
    input.click();
  };

  return (
    <section className={`draw-container popup-container ${visible ? 'visible' : ''}`}>
      <button className="close-button" onClick={onClose}>&times;</button>
      <div className="display-flex responsive-flex">
        <canvas
          ref={canvasRef}
          id="diagram-canvas"
          style={{ backgroundColor: '#fff' }}
          height={isMobile ? "150" : "300"}
          width={isMobile ? "300" : "600"}
          onMouseDown={isMobile ? undefined : handleMouseDown}
          onMouseMove={isMobile ? undefined : handleMouseMove}
          onMouseUp={isMobile ? undefined : handleMouseUp}
          onMouseLeave={isMobile ? undefined : handleMouseUp}
          onTouchStart={isMobile ? handleTouchStart : undefined}
          onTouchMove={isMobile ? handleTouchMove : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
        ></canvas>
        <div className="flex-1 buttons-container padding-around">
          <button
            id="add-to-paper-button"
            style={{ marginTop: '5px', marginBottom: '5px' }}
            onClick={addToPaper}
          >
            Add to Paper
          </button>
          <button
            id="draw-download-button"
            style={{ marginTop: '5px', marginBottom: '5px' }}
            onClick={downloadImage}
          >
            Download Image
          </button>
          <br /><br />
          <button 
            id="add-new-image-button"
            onClick={addBackgroundImage}
          >
            Add bg image
          </button>
          <br /><br />
          <button
            id="clear-draw-canvas"
            className="blue-button"
            style={{ backgroundColor: '#f30', color: '#fff' }}
            onClick={clearCanvas}
          >
            Clear Canvas
          </button>
        </div>
      </div>
    </section>
  );
};

export default DrawingCanvas;