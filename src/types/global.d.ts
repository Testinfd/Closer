import html2canvas from 'html2canvas';

declare global {
  interface Window {
    html2canvas: typeof html2canvas;
  }
}
