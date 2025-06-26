let canvas: HTMLCanvasElement;
let context: CanvasRenderingContext2D;
let onAddToPaper: (dataUrl: string) => void;

export const init = (canvasEl: HTMLCanvasElement, onAddToPaperCallback: (dataUrl: string) => void) => {
  canvas = canvasEl;
  context = canvas.getContext('2d', { willReadFrequently: true })!;
  onAddToPaper = onAddToPaperCallback;

  // Add event listeners
  canvas.addEventListener('mousedown', startDrawing);
  canvas.addEventListener('mouseup', stopDrawing);
  canvas.addEventListener('mousemove', draw);

  document.getElementById('add-to-paper-button')!.addEventListener('click', () => {
    const dataUrl = canvas.toDataURL();
    onAddToPaper(dataUrl);
  });

  document.getElementById('clear-draw-canvas')!.addEventListener('click', () => {
    context.clearRect(0, 0, canvas.width, canvas.height);
  });
};

let isDrawing = false;

const startDrawing = (e: MouseEvent) => {
  isDrawing = true;
  draw(e);
};

const stopDrawing = () => {
  isDrawing = false;
  context.beginPath();
};

const draw = (e: MouseEvent) => {
  if (!isDrawing) return;

  context.lineWidth = 3;
  context.lineCap = 'round';
  context.strokeStyle = '#000f55';

  context.lineTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
  context.stroke();
  context.beginPath();
  context.moveTo(e.clientX - canvas.offsetLeft, e.clientY - canvas.offsetTop);
};

export const setInkColor = (color: string) => {
  context.strokeStyle = color;
};

export const toggleDrawCanvas = () => {
  const drawContainer = document.querySelector('.draw-container') as HTMLElement;
  if (drawContainer.style.display === 'none' || drawContainer.style.display === '') {
    drawContainer.style.display = 'block';
  } else {
    drawContainer.style.display = 'none';
  }
};