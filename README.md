# Text to Handwriting Next

This is a modern React/TypeScript rewrite of the original Text to Handwriting project by Saurabh Daware.

## Recent Updates

- **Fixed text input issues**: Resolved overlay issues that were preventing text input in the editor
- **Restored shadow and scanner effects**: Properly implemented page effects from the legacy version
- **Improved multi-page generation**: Pages now maintain consistent margins and styles across all pages
- **Enhanced UI with thumbnails**: Added page thumbnails for easier multi-page document management
- **Added external text areas**: Optional side and top notes areas that don't interfere with main content

## Features

- Convert text to handwritten-style images
- Multiple handwriting font options
- Custom handwriting font upload
- Page effects (shadows, scanner)
- Multiple page generation
- Export as images or PDF
- Drawing capabilities
- Dark mode support

## Project Structure

- `/src/app`: Next.js app pages and layout components
- `/src/components`: React components for UI elements
- `/src/utils`: Utility functions for image generation, drawing, and PDF export
- `/src/types`: TypeScript type definitions

## Development

### Prerequisites

- Node.js 18+
- npm or yarn

### Setup

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Run the development server:
   ```
   npm run dev
   ```

## Known Issues and Future Work

- **Paper customization**: Implement more paper styles and backgrounds
- **Margin customization**: Allow adjusting margin sizes and colors
- **Font management**: Improve custom font handling and provide more built-in options
- **Better mobile support**: Enhance responsive design for smaller screens
- **Performance optimization**: Optimize image generation for large documents
- **Accessibility improvements**: Enhance keyboard navigation and screen reader support

## Technologies Used

- React 18
- Next.js 13+
- TypeScript
- html2canvas for image generation
- jsPDF for PDF generation

## License

MIT License - See LICENSE file for details

## Credits

- Original project by Saurabh Daware
- Contributors to the original text-to-handwriting project
